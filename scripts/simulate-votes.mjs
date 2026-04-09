/**
 * LBS Fireside — Vote Simulation Script
 *
 * Spins up a fake presenter + N fake audience clients against the running
 * server and runs through every poll, exercising:
 *   ✓ Client registration (audience + presenter)
 *   ✓ Screen navigation (set_screen with poll payload)
 *   ✓ Audience vote submission
 *   ✓ One-vote-per-client enforcement (duplicate vote → overwrite)
 *   ✓ Vote changing (client re-votes for different option)
 *   ✓ Vote reset
 *   ✓ Concurrent votes (all clients vote within the same tick)
 *   ✓ Client disconnect + reconnect mid-poll
 *   ✓ Tally accuracy (presenter tally matches expected counts)
 *
 * Usage:
 *   node scripts/simulate-votes.mjs [--clients=N] [--url=ws://localhost:3000]
 *
 * Run with the server already started: npm start
 */

import WebSocket from 'ws';

// ─── Config ──────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace('--', '').split('=')),
);
const SERVER_URL = args.url ?? 'ws://localhost:3000';
const NUM_CLIENTS = parseInt(args.clients ?? '6', 10);
const TICK = 200; // ms between actions

// ─── Poll definitions (mirrors mainScreens.ts polls) ─────────────────────────

const POLLS = [
  {
    questionId: 'q1',
    question: 'How often do you use AI tools in your work?',
    options: [
      { id: 'q1-daily', label: 'Every day' },
      { id: 'q1-weekly', label: 'A few times a week' },
      { id: 'q1-occasionally', label: 'Occasionally / experimenting' },
      { id: 'q1-rarely', label: 'Rarely or never' },
    ],
  },
  {
    questionId: 'q5',
    question: 'How much of the work you produce today is AI-assisted?',
    options: [
      { id: 'q5-lt25', label: 'Less than 25% of my work' },
      { id: 'q5-25to50', label: 'About 25–50%' },
      { id: 'q5-gt50', label: 'More than 50%' },
      { id: 'q5-na', label: 'Not really applicable to my role' },
    ],
  },
  {
    questionId: 'q3',
    question: "What's your single biggest blocker to using AI tools more?",
    options: [
      { id: 'q3-access', label: "I don't have the right access or tools" },
      { id: 'q3-usecase', label: "I don't know what I'd actually use it for" },
      { id: 'q3-time', label: 'Too busy — no time to experiment' },
      { id: 'q3-trust', label: "I don't trust the output enough to rely on it" },
      { id: 'q3-none', label: 'No real blocker — I use it freely' },
    ],
  },
  {
    questionId: 'q7',
    question: 'How do you see AI assisting you with your job in two years?',
    options: [
      { id: 'q7-same', label: 'Similar to now, just faster and smoother' },
      { id: 'q7-strategic', label: 'Handling the repetitive parts so I can focus on harder problems' },
      { id: 'q7-new', label: "Enabling work I can't do today at all" },
      { id: 'q7-unsure', label: 'Too early to say — still figuring it out' },
    ],
  },
  {
    questionId: 'q-read',
    question: "Would a monthly update be something you'd actually read?",
    options: [
      { id: 'qr-yes', label: 'Yes' },
      { id: 'qr-maybe', label: 'Depends' },
      { id: 'qr-no', label: 'Probably not' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? `  →  ${detail}` : ''}`);
    failed++;
  }
}

function connectClient(name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);
    const messages = [];
    ws.on('open', () => resolve({ ws, messages, name }));
    ws.on('message', (raw) => {
      try {
        messages.push(JSON.parse(raw.toString()));
      } catch {}
    });
    ws.on('error', reject);
  });
}

function send(client, msg) {
  client.ws.send(JSON.stringify(msg));
}

function waitForMessage(client, type, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const check = setInterval(() => {
      const found = client.messages.find((m) => m.type === type);
      if (found) {
        clearInterval(check);
        resolve(found);
      } else if (Date.now() > deadline) {
        clearInterval(check);
        reject(new Error(`Timeout waiting for message type "${type}" on ${client.name}`));
      }
    }, 50);
  });
}

function latestMessage(client, type) {
  return [...client.messages].reverse().find((m) => m.type === type) ?? null;
}

function clearMessages(client) {
  client.messages.length = 0;
}

function waitForCount(presenterClient, expectedCount, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const check = setInterval(() => {
      const msg = latestMessage(presenterClient, 'audience_count');
      if (msg?.count === expectedCount) {
        clearInterval(check);
        resolve(expectedCount);
      } else if (Date.now() > deadline) {
        clearInterval(check);
        resolve(msg?.count ?? null);
      }
    }, 50);
  });
}

// ─── Test runner ─────────────────────────────────────────────────────────────

async function run() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  LBS Fireside — Vote Simulation & Test Suite');
  console.log(`  Server:  ${SERVER_URL}`);
  console.log(`  Clients: ${NUM_CLIENTS} simulated audience members`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // ── 0. Reset server state for a clean run ─────────────────────────────────

  const httpBase = SERVER_URL.replace('ws://', 'http://').replace('wss://', 'https://');
  try {
    const res = await fetch(`${httpBase}/test/reset`, { method: 'POST' });
    const body = await res.json();
    assert('Server state reset before test run', body.ok === true);
  } catch (e) {
    console.error('  Could not reach server at', httpBase, '—', e.message);
    console.error('  Make sure npm start is running first.\n');
    process.exit(1);
  }
  await sleep(TICK);

  // ── 1. Connect presenter ──────────────────────────────────────────────────

  console.log('[ 1 ] Connection & Registration');
  const presenter = await connectClient('Presenter');
  send(presenter, { type: 'register', role: 'presenter' });
  const presReg = await waitForMessage(presenter, 'registered');
  assert('Presenter registers successfully', presReg?.role === 'presenter');

  // ── 2. Connect audience clients ───────────────────────────────────────────

  const audience = [];
  for (let i = 0; i < NUM_CLIENTS; i++) {
    const c = await connectClient(`Audience-${i + 1}`);
    send(c, { type: 'register', role: 'audience' });
    audience.push(c);
  }
  await sleep(TICK);

  for (const c of audience) {
    const reg = latestMessage(c, 'registered');
    assert(`${c.name} registers as audience`, reg?.role === 'audience');
    if (reg?.clientId) c.clientId = reg.clientId; // store server-assigned ID for kick
  }

  // ── 3. Audience count broadcast ───────────────────────────────────────────

  console.log('');
  console.log('[ 2 ] Audience Count Broadcast');
  await sleep(TICK);
  const countMsg = latestMessage(presenter, 'audience_count');
  assert(
    `Presenter receives audience_count = ${NUM_CLIENTS}`,
    countMsg?.count === NUM_CLIENTS,
    `got ${countMsg?.count}`,
  );

  // ── 4. Waiting state on connect ───────────────────────────────────────────

  console.log('');
  console.log('[ 3 ] Waiting State');
  // After reset, no active poll — every client should receive "waiting"
  for (const c of audience) {
    const waiting = latestMessage(c, 'waiting');
    const showPoll = latestMessage(c, 'show_poll');
    assert(
      `${c.name} receives initial state on join`,
      waiting !== null || showPoll !== null,
    );
  }

  // ── 5. Poll-by-poll voting ────────────────────────────────────────────────

  console.log('');
  console.log('[ 4 ] Poll Voting — All Polls');

  for (const poll of POLLS) {
    console.log('');
    console.log(`  ▸ Poll: "${poll.question.slice(0, 55)}..."`);

    // Presenter sets screen to this poll
    send(presenter, {
      type: 'set_screen',
      screenIndex: 0,
      sessionType: 'main',
      poll: {
        questionId: poll.questionId,
        question: poll.question,
        options: poll.options,
      },
    });
    await sleep(TICK);

    // All audience clients should receive show_poll for THIS question
    for (const c of audience) {
      const showPoll = [...c.messages].reverse().find(
        (m) => m.type === 'show_poll' && m.questionId === poll.questionId,
      );
      assert(
        `${c.name} receives show_poll`,
        showPoll !== undefined,
      );
    }

    // Clear old messages AFTER asserting show_poll
    clearMessages(presenter);
    for (const c of audience) clearMessages(c);

    // Each client votes for a random option
    const expectedTally = {};
    const clientVotes = {};
    for (const c of audience) {
      const opt = pick(poll.options);
      clientVotes[c.name] = opt.id;
      expectedTally[opt.id] = (expectedTally[opt.id] ?? 0) + 1;
      send(c, { type: 'vote', questionId: poll.questionId, optionId: opt.id });
    }
    await sleep(TICK * 2);

    // Vote confirmations
    for (const c of audience) {
      const conf = latestMessage(c, 'vote_confirmed');
      assert(
        `${c.name} receives vote_confirmed`,
        conf?.questionId === poll.questionId && conf?.optionId === clientVotes[c.name],
        `expected optionId=${clientVotes[c.name]}, got ${conf?.optionId}`,
      );
    }

    // Presenter tally accuracy — match by questionId, not just latest message
    const tallyMsg = [...presenter.messages]
      .reverse()
      .find((m) => m.type === 'vote_update' && m.questionId === poll.questionId);
    let tallyCorrect = tallyMsg !== undefined;
    if (tallyCorrect) {
      for (const [optId, count] of Object.entries(expectedTally)) {
        if ((tallyMsg.votes?.[optId] ?? 0) !== count) {
          tallyCorrect = false;
          break;
        }
      }
    }
    assert(
      `Presenter tally matches expected counts for ${poll.questionId}`,
      tallyCorrect,
      `expected ${JSON.stringify(expectedTally)}, got ${JSON.stringify(tallyMsg?.votes)}`,
    );
  }

  // ── 6. Duplicate vote / vote change ───────────────────────────────────────

  console.log('');
  console.log('[ 5 ] Vote Change (Re-vote)');

  const testPoll = POLLS[0];
  const testClient = audience[0];
  clearMessages(presenter);
  clearMessages(testClient);

  // Set screen back to first poll
  send(presenter, {
    type: 'set_screen',
    screenIndex: 0,
    sessionType: 'main',
    poll: {
      questionId: testPoll.questionId,
      question: testPoll.question,
      options: testPoll.options,
    },
  });
  await sleep(TICK);

  const firstOption = testPoll.options[0].id;
  const secondOption = testPoll.options[1].id;

  send(testClient, { type: 'vote', questionId: testPoll.questionId, optionId: firstOption });
  await sleep(TICK);

  // Snapshot total votes after the first vote
  const tallyAfterFirst = [...presenter.messages]
    .reverse()
    .find((m) => m.type === 'vote_update' && m.questionId === testPoll.questionId);
  const totalAfterFirst = Object.values(tallyAfterFirst?.votes ?? {}).reduce((a, b) => a + b, 0);

  clearMessages(presenter);
  send(testClient, { type: 'vote', questionId: testPoll.questionId, optionId: secondOption });
  await sleep(TICK);

  const reVoteTally = [...presenter.messages]
    .reverse()
    .find((m) => m.type === 'vote_update' && m.questionId === testPoll.questionId);
  const totalAfterRevote = Object.values(reVoteTally?.votes ?? {}).reduce((a, b) => a + b, 0);
  const secondCount = reVoteTally?.votes?.[secondOption] ?? 0;

  // Total vote count must stay the same — re-vote moves a vote, doesn't add one
  assert(
    'Re-vote: total count unchanged (no double-counting)',
    totalAfterRevote === totalAfterFirst,
    `before=${totalAfterFirst}, after=${totalAfterRevote}`,
  );
  assert(
    'Re-vote: new option received the test client vote',
    secondCount >= 1,
    `secondCount=${secondCount}`,
  );

  // ── 7. Vote reset ─────────────────────────────────────────────────────────

  console.log('');
  console.log('[ 6 ] Vote Reset');

  clearMessages(presenter);
  send(presenter, { type: 'reset_votes', questionId: testPoll.questionId });
  await sleep(TICK);

  const afterReset = latestMessage(presenter, 'vote_update');
  const totalAfterReset = Object.values(afterReset?.votes ?? {}).reduce((a, b) => a + b, 0);
  assert('Reset clears all votes to 0', totalAfterReset === 0, `total=${totalAfterReset}`);

  // ── 8. Disconnect + reconnect ─────────────────────────────────────────────

  console.log('');
  console.log('[ 7 ] Disconnect & Reconnect');

  const dropClient = audience[audience.length - 1];

  // Get the real current count from the server (avoids stale cached messages)
  const countRes = await fetch(`${httpBase}/test/count`);
  const countBefore = (await countRes.json()).count;
  clearMessages(presenter);

  // Kick the client server-side — guarantees the close event fires immediately
  const kickRes = await fetch(`${httpBase}/test/kick/${dropClient.clientId}`, { method: 'POST' });
  assert('Server-side kick request succeeded', (await kickRes.json()).ok === true);
  await sleep(TICK * 2);

  // Check for a decrement of exactly 1 from the baseline (robust against extra browser tabs)
  const countAfterDrop = await waitForCount(presenter, countBefore - 1, 5000);
  assert(
    `Audience count decrements by 1 on disconnect (${countBefore} → ${countBefore - 1})`,
    countAfterDrop === countBefore - 1,
    `got ${countAfterDrop}`,
  );

  // Reconnect
  clearMessages(presenter);
  const rejoined = await connectClient(`${dropClient.name}-rejoined`);
  send(rejoined, { type: 'register', role: 'audience' });

  const countAfterRejoin = await waitForCount(presenter, countBefore, 5000);
  assert(
    `Audience count increments back to ${countBefore} on reconnect`,
    countAfterRejoin === countBefore,
    `got ${countAfterRejoin}`,
  );

  const rejoinedWaiting = latestMessage(rejoined, 'show_poll') ?? latestMessage(rejoined, 'waiting');
  assert(
    'Reconnected client receives current state (show_poll or waiting)',
    rejoinedWaiting !== null,
  );

  // ── 9. Non-poll screen clears poll from audience ──────────────────────────

  console.log('');
  console.log('[ 8 ] Non-poll Screen → Audience Sees Waiting');

  for (const c of [...audience, rejoined]) clearMessages(c);
  send(presenter, { type: 'set_screen', screenIndex: 0, sessionType: 'main' });
  await sleep(TICK);

  let waitingCount = 0;
  for (const c of [...audience.slice(0, -1), rejoined]) {
    if (latestMessage(c, 'waiting')) waitingCount++;
  }
  assert(
    'All connected audience clients receive waiting on non-poll screen',
    waitingCount === NUM_CLIENTS,
    `got ${waitingCount} / ${NUM_CLIENTS}`,
  );

  // ── Teardown ──────────────────────────────────────────────────────────────

  presenter.ws.close();
  for (const c of audience) c.ws.close();
  rejoined.ws.close();

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('  🎉  All tests passed — voting is working correctly');
  } else {
    console.log('  ⚠️   Some tests failed — check output above');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('');
  console.error('Fatal error:', err.message);
  console.error('Is the server running?  →  npm start');
  console.error('');
  process.exit(1);
});
