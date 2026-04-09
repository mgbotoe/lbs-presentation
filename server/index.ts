import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// ---- State ----

interface Client {
  id: string;
  role: 'presenter' | 'audience';
  ws: WebSocket;
}

interface PollState {
  questionId: string;
  question: string;
  options: { id: string; label: string }[];
}

let clients: Client[] = [];
let votes: Record<string, Record<string, string>> = {};
// votes[questionId][clientId] = optionId  (one vote per client per question)
let currentPoll: PollState | null = null;
let clientCounter = 0;

// ---- Poll metadata (question text + options, keyed by questionId) ----
const pollMeta: Record<string, { question: string; options: { id: string; label: string }[] }> = {};

// ---- Persistence ----
const RESULTS_FILE = path.join(__dirname, '..', 'results.json');

function persistVotes() {
  try {
    const snapshot = {
      savedAt: new Date().toISOString(),
      polls: Object.entries(pollMeta).map(([questionId, meta]) => ({
        questionId,
        question: meta.question,
        options: meta.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          votes: Object.values(votes[questionId] ?? {}).filter((v) => v === opt.id).length,
        })),
        totalVotes: Object.keys(votes[questionId] ?? {}).length,
      })),
    };
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(snapshot, null, 2));
  } catch (err) {
    console.error('  Could not persist results:', err);
  }
}

// ---- Helpers ----

function getVoteTally(questionId: string): Record<string, number> {
  const tally: Record<string, number> = {};
  const questionVotes = votes[questionId] ?? {};
  for (const optionId of Object.values(questionVotes)) {
    tally[optionId] = (tally[optionId] ?? 0) + 1;
  }
  return tally;
}

function broadcast(role: 'presenter' | 'audience' | 'all', message: unknown) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (role === 'all' || client.role === role) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }
}

function audienceCount(): number {
  return clients.filter((c) => c.role === 'audience' && c.ws.readyState === WebSocket.OPEN).length;
}

function broadcastAudienceCount() {
  broadcast('presenter', { type: 'audience_count', count: audienceCount() });
}

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ---- WebSocket ----

wss.on('connection', (ws) => {
  const clientId = `c${++clientCounter}`;
  let client: Client = { id: clientId, role: 'audience', ws };
  clients.push(client);

  ws.on('message', (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case 'register': {
        client.role = msg.role;
        ws.send(JSON.stringify({ type: 'registered', role: msg.role, clientId }));

        if (msg.role === 'audience') {
          broadcastAudienceCount();
          if (currentPoll) {
            ws.send(JSON.stringify({ type: 'show_poll', ...currentPoll }));
          } else {
            ws.send(JSON.stringify({ type: 'waiting', message: 'Waiting for the next question...' }));
          }
        }

        if (msg.role === 'presenter') {
          // Send current audience count immediately so presenter doesn't see stale 0
          ws.send(JSON.stringify({ type: 'audience_count', count: audienceCount() }));
          // Send current vote tally for any active poll
          if (currentPoll) {
            ws.send(JSON.stringify({
              type: 'vote_update',
              questionId: currentPoll.questionId,
              votes: getVoteTally(currentPoll.questionId),
            }));
          }
        }
        break;
      }

      case 'set_screen': {
        // Presenter changed screen -- check if it's a poll
        if (msg.poll) {
          currentPoll = {
            questionId: msg.poll.questionId,
            question: msg.poll.question,
            options: msg.poll.options,
          };
          // Store question text + options so we can include them in exports
          pollMeta[msg.poll.questionId] = {
            question: msg.poll.question,
            options: msg.poll.options,
          };
          broadcast('audience', { type: 'show_poll', ...currentPoll });
        } else {
          currentPoll = null;
          broadcast('audience', { type: 'waiting', message: 'Waiting for the next question...' });
        }
        // Send current vote tally for this screen's poll
        if (msg.poll) {
          broadcast('presenter', {
            type: 'vote_update',
            questionId: msg.poll.questionId,
            votes: getVoteTally(msg.poll.questionId),
          });
        }
        break;
      }

      case 'vote': {
        const { questionId, optionId } = msg;
        if (!questionId || !optionId) break;
        if (!votes[questionId]) votes[questionId] = {};
        votes[questionId][clientId] = optionId;
        broadcast('presenter', {
          type: 'vote_update',
          questionId,
          votes: getVoteTally(questionId),
        });
        ws.send(JSON.stringify({ type: 'vote_confirmed', questionId, optionId }));
        persistVotes();
        break;
      }

      case 'reset_votes': {
        const { questionId } = msg;
        if (questionId) {
          votes[questionId] = {};
          broadcast('presenter', {
            type: 'vote_update',
            questionId,
            votes: {},
          });
          persistVotes();
        }
        break;
      }

      case 'manual_vote': {
        // Fallback manual tally from presenter
        const { questionId: qId, optionId: oId } = msg;
        if (!qId || !oId) break;
        const manualId = `manual_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        if (!votes[qId]) votes[qId] = {};
        votes[qId][manualId] = oId;
        broadcast('presenter', {
          type: 'vote_update',
          questionId: qId,
          votes: getVoteTally(qId),
        });
        persistVotes();
        break;
      }
    }
  });

  ws.on('close', () => {
    clients = clients.filter((c) => c.id !== clientId);
    broadcastAudienceCount();
  });
});

// ---- Results export ----

app.get('/results/summary', (_req, res) => {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const pollsHtml = Object.entries(pollMeta).map(([questionId, meta]) => {
    const total = Object.keys(votes[questionId] ?? {}).length;
    const rows = meta.options.map((opt) => {
      const count = Object.values(votes[questionId] ?? {}).filter((v) => v === opt.id).length;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return `
        <tr>
          <td class="opt-label">${opt.label}</td>
          <td class="opt-bar">
            <div class="bar-wrap">
              <div class="bar-fill" style="width:${pct.toFixed(1)}%"></div>
            </div>
          </td>
          <td class="opt-count">${count}</td>
          <td class="opt-pct">${pct.toFixed(0)}%</td>
        </tr>`;
    }).join('');
    return `
      <div class="poll-block">
        <h2 class="poll-q">${meta.question}</h2>
        <p class="poll-meta">${total} response${total !== 1 ? 's' : ''}</p>
        <table class="results-table">
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).join('') || '<p class="no-data">No poll data recorded yet.</p>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LBS AI Pulse — Results</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #f5f4fa;
      color: #1a1a1a;
      padding: 2rem 1.5rem 4rem;
    }
    .page { max-width: 760px; margin: 0 auto; }
    .header { border-top: 4px solid #4000a5; padding-top: 1.5rem; margin-bottom: 2.5rem; }
    .header-label {
      font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.18em; color: #7523ff; margin-bottom: 0.5rem;
    }
    h1 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; color: #1a1a1a; }
    .header-date { font-size: 0.9375rem; color: #848484; margin-top: 0.375rem; }
    .poll-block {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e0dcea;
      padding: 1.5rem 1.75rem;
      margin-bottom: 1.25rem;
    }
    .poll-q {
      font-size: 1.0625rem; font-weight: 600; color: #1a1a1a;
      letter-spacing: -0.015em; margin-bottom: 0.25rem;
    }
    .poll-meta { font-size: 0.8125rem; color: #848484; margin-bottom: 1.25rem; }
    .results-table { width: 100%; border-collapse: collapse; }
    .results-table td { padding: 0.5rem 0; vertical-align: middle; }
    .opt-label { font-size: 0.9375rem; color: #333; width: 42%; padding-right: 1rem; }
    .opt-bar { width: 38%; }
    .bar-wrap {
      height: 8px; background: #ede9f8; border-radius: 99px; overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #4000a5 0%, #7523ff 55%, #36b8ff 100%);
      border-radius: 99px;
      min-width: 2px;
    }
    .opt-count {
      width: 10%; text-align: right; font-size: 0.9375rem;
      font-weight: 600; color: #4000a5; font-variant-numeric: tabular-nums;
    }
    .opt-pct {
      width: 10%; text-align: right; font-size: 0.8125rem;
      color: #848484; padding-left: 0.5rem; font-variant-numeric: tabular-nums;
    }
    .no-data { color: #848484; font-size: 0.9375rem; padding: 1rem 0; }
    .footer {
      margin-top: 2.5rem; font-size: 0.75rem; color: #848484;
      text-align: center; border-top: 1px solid #e0dcea; padding-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <p class="header-label">LBS AI Pulse</p>
      <h1>Session Results</h1>
      <p class="header-date">${date}</p>
    </div>
    ${pollsHtml}
    <p class="footer">Generated ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;

  const filename = `lbs-fireside-results-${new Date().toISOString().slice(0, 10)}.html`;
  // Save to disk
  try {
    fs.writeFileSync(path.join(__dirname, '..', filename), html);
    console.log(`  Results saved → ${filename}`);
  } catch {}

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.get('/results.json', (_req, res) => {
  const snapshot = {
    exportedAt: new Date().toISOString(),
    polls: Object.entries(pollMeta).map(([questionId, meta]) => ({
      questionId,
      question: meta.question,
      options: meta.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        votes: Object.values(votes[questionId] ?? {}).filter((v) => v === opt.id).length,
      })),
      totalVotes: Object.keys(votes[questionId] ?? {}).length,
    })),
  };
  res.setHeader('Content-Disposition', 'attachment; filename="lbs-fireside-results.json"');
  res.json(snapshot);
});

app.get('/results.csv', (_req, res) => {
  const rows: string[] = ['Question,Option,Votes,Percentage'];
  for (const [questionId, meta] of Object.entries(pollMeta)) {
    const total = Object.keys(votes[questionId] ?? {}).length;
    for (const opt of meta.options) {
      const count = Object.values(votes[questionId] ?? {}).filter((v) => v === opt.id).length;
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      rows.push(`"${meta.question}","${opt.label}",${count},${pct}%`);
    }
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="lbs-fireside-results.csv"');
  res.send(rows.join('\n'));
});

// ---- Test helpers (dev / CI only) ----

app.post('/test/reset', (_req, res) => {
  votes = {};
  currentPoll = null;
  for (const c of clients) {
    if (c.ws.readyState === WebSocket.OPEN) c.ws.terminate();
  }
  clients = [];
  clientCounter = 0;
  res.json({ ok: true });
});

app.get('/test/count', (_req, res) => {
  res.json({ count: audienceCount() });
});

app.post('/test/kick/:clientId', (req, res) => {
  const c = clients.find((cl) => cl.id === req.params.clientId);
  if (c && c.ws.readyState === WebSocket.OPEN) {
    c.ws.terminate(); // server-side termination — fires 'close' immediately
    res.json({ ok: true, kicked: req.params.clientId });
  } else {
    res.status(404).json({ ok: false, reason: 'client not found or already closed' });
  }
});

// ---- Static files (production) ----

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---- Start ----

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log('');
  console.log('  LBS AI Pulse — Polling Server');
  console.log('  ─────────────────────────────');
  console.log(`  Presenter:  http://localhost:${PORT}`);
  console.log(`  Audience:   http://${ip}:${PORT}/audience`);
  console.log(`  Power User: http://localhost:${PORT}/poweruser`);
  console.log('');
  console.log('  Audience members: scan the QR code or go to the audience URL above');
  console.log('');
});
