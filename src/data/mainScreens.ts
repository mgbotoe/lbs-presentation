import type { Screen } from '../types';

export const mainScreens: Screen[] = [
  // ── INTRO ────────────────────────────────────────────────────────────────
  {
    id: 'intro',
    type: 'intro',
    title:
      'Thanks for making time.\nI just want an honest picture of where things are with AI at LBS: what\'s working, what\'s not, and what would actually help.\nAll votes are anonymous. No right answers here.',
    facilitatorNote: 'Get eye contact before moving. Don\'t rush this.',
  },

  // ── BASELINE ─────────────────────────────────────────────────────────────
  {
    id: 'q1',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'How often do you use AI tools in your work?',
    pollOptions: [
      { id: 'q1-daily',        label: 'Every day' },
      { id: 'q1-weekly',       label: 'A few times a week' },
      { id: 'q1-occasionally', label: 'Occasionally or still experimenting' },
      { id: 'q1-rarely',       label: 'Rarely or never' },
    ],
  },
  {
    id: 'q-sentiment',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'Honestly, how do you feel about using AI as part of your work right now?',
    pollOptions: [
      { id: 'qs-excited',   label: 'Excited. I\'m already using it and want to go deeper' },
      { id: 'qs-cautious',  label: 'Open to it. Still figuring out where it fits for me' },
      { id: 'qs-skeptical', label: 'Not convinced yet. Haven\'t seen enough to change how I work' },
      { id: 'qs-concerned', label: 'Worried about the quality or the direction it\'s heading' },
    ],
  },
  {
    id: 'q5',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'How much of your work do you expect AI tools to touch in a typical week going forward? (GitHub Copilot, M365 Copilot, Cursor, etc.)',
    pollOptions: [
      { id: 'q5-alot',   label: 'A lot. I can see it becoming part of most tasks' },
      { id: 'q5-some',   label: 'Some. Specific tasks where it clearly helps' },
      { id: 'q5-little', label: 'A little. Occasional use cases only' },
      { id: 'q5-unsure', label: 'Not sure yet. Need more time to figure it out' },
    ],
  },

  // ── 01 WHAT'S ALREADY WORKING ────────────────────────────────────────────
  {
    id: 'divider-01',
    type: 'divider',
    dividerTitle: '01 - What\'s already working',
    dividerDuration: '~15 minutes',
    facilitatorNote:
      'Start here to disarm the room. Let it be short if it wants to be short. Don\'t push for depth yet.',
  },
  {
    id: 'disc-like',
    type: 'discussion',
    sectionLabel: '01 - What\'s already working',
    title: 'What from this week\'s training actually clicked for you? What surprised you, good or bad?',
    subtitle: 'What does it actually give you that you didn\'t have before?',
    facilitatorNote: 'Open floor. Don\'t prompt with examples yet, let them lead.',
  },
  {
    id: 'disc-beyond-code',
    type: 'discussion',
    sectionLabel: '01 - What\'s already working',
    title: 'What are you using AI tools for beyond writing code, or what would you use them for if you knew how?',
    facilitatorNote:
      'This is where non-devs find their voice. Don\'t let devs dominate.',
  },

  // ── 02 WHAT'S GETTING IN THE WAY ─────────────────────────────────────────
  {
    id: 'divider-02',
    type: 'divider',
    dividerTitle: '02 - What\'s getting in the way',
    dividerDuration: '~20 minutes',
    facilitatorNote:
      'Goal is honest answers, not a troubleshooting session. Listen and capture. Don\'t defend, explain, or problem-solve in the moment.',
  },
  {
    id: 'q-confidence',
    type: 'poll',
    sectionLabel: '02 - What\'s getting in the way',
    title: 'After this week\'s training, how confident are you using GitHub Copilot in your actual day-to-day work?',
    pollOptions: [
      { id: 'qc-confident', label: 'Confident. I can see exactly where to use it' },
      { id: 'qc-getting',   label: 'Getting there. I need more practice with real work' },
      { id: 'qc-low',       label: 'Not very confident. The training helped but I\'m still unsure' },
      { id: 'qc-none',      label: 'Not confident. It didn\'t click for me yet' },
    ],
  },
  {
    id: 'disc-roadblocks',
    type: 'discussion',
    sectionLabel: '02 - What\'s getting in the way',
    title: 'Now that you\'ve had hands-on time, what\'s still getting in the way of going deeper?',
    subtitle: 'What would it take for this to feel like a normal part of your day, and not something you feel forced into?',
    facilitatorNote:
      'Looking for: time, IT constraints, regulated workflows, tool fit, trust. Don\'t fill silences too fast.',
  },
  {
    id: 'disc-didnt-help',
    type: 'discussion',
    sectionLabel: '02 - What\'s getting in the way',
    title: 'Where has GitHub Copilot let you down, during the training or in actual work?',
    subtitle: 'What happened?',
    facilitatorNote:
      'This often surfaces regulated workflow friction and legacy codebase pain.',
  },
  {
    id: 'q3',
    type: 'poll',
    sectionLabel: '02 - What\'s getting in the way',
    title: 'What\'s your single biggest blocker to using AI tools more?',
    pollOptions: [
      { id: 'q3-env',     label: 'The environment makes it hard: regulated workflows, IT, or toolchain' },
      { id: 'q3-usecase', label: 'I\'m not sure what I\'d actually use it for' },
      { id: 'q3-time',    label: 'Too busy, no time to build the habit' },
      { id: 'q3-trust',   label: 'I don\'t trust the output enough to rely on it' },
      { id: 'q3-none',    label: 'No real blocker, I\'m ready to use it' },
    ],
    facilitatorNote:
      'Most important poll of the session. People will vote what they won\'t say out loud.',
  },

  // ── 03 USE CASES ──────────────────────────────────────────────────────────
  {
    id: 'divider-03',
    type: 'divider',
    dividerTitle: '03 - Use cases',
    dividerDuration: '~20 minutes',
  },
  {
    id: 'disc-hand-off',
    type: 'discussion',
    sectionLabel: '03 - Use cases',
    title: 'What\'s the most repetitive or painful part of your job you wish you could hand off?',
    facilitatorNote:
      'Best single use case detection question. Frames AI as relief, not productivity theatre.',
  },
  {
    id: 'disc-code-review',
    type: 'discussion',
    sectionLabel: '03 - Use cases',
    title: 'Where do the tools fall short, not because of access, but because they just don\'t map to how LBS actually works?',
    facilitatorNote:
      'BitBucket vs GitHub, regulated workflows, C legacy code. This is where fit vs permission surfaces.',
  },

  // ── 04 WHERE WE'RE HEADED ─────────────────────────────────────────────────
  {
    id: 'divider-04',
    type: 'divider',
    dividerTitle: '04 - Where we\'re headed',
    dividerDuration: '~15 minutes',
    facilitatorNote:
      'Let them paint it. Don\'t correct or narrow. This is use case and tooling gap gold.',
  },
  {
    id: 'disc-six-months',
    type: 'discussion',
    sectionLabel: '04 - Where we\'re headed',
    title: 'If AI was working well for this team six months from now, what would look different from today?',
    facilitatorNote: 'Let them paint it. Don\'t correct or narrow.',
  },
  {
    id: 'disc-agents',
    type: 'discussion',
    sectionLabel: '04 - Where we\'re headed',
    title: 'AI agents can act on their own: browse, write code, run tests, file tickets. Where does that fit for LBS?',
    facilitatorNote:
      'Gauge awareness before diving in. If the room is blank, explain briefly: think of it as AI that can do a multi-step task end-to-end without you driving each step.',
  },
  {
    id: 'q7',
    type: 'poll',
    sectionLabel: '04 - Where we\'re headed',
    title: 'How do you see AI assisting you with your job in two years?',
    pollOptions: [
      { id: 'q7-same',      label: 'Similar to now, just faster and smoother' },
      { id: 'q7-strategic', label: 'Handling the repetitive parts so I can focus on harder problems' },
      { id: 'q7-new',       label: 'Enabling work I can\'t do today at all' },
      { id: 'q7-unsure',    label: 'Too early to say, still figuring it out' },
    ],
  },

  // ── 05 STAYING CONNECTED ──────────────────────────────────────────────────
  {
    id: 'divider-05',
    type: 'divider',
    dividerTitle: '05 - Staying connected',
    dividerDuration: '~10 minutes',
    facilitatorNote:
      'Keep this short. The open door has to be named explicitly or people won\'t use it.',
  },
  {
    id: 'disc-where-go',
    type: 'discussion',
    sectionLabel: '05 - Staying connected',
    title: 'The enterprise team wants to stay connected with LBS and across OpCos, but we don\'t always know how. What would actually work for you?',
    subtitle: 'What format, cadence, or channel would make it easy to share what\'s working, ask questions, or flag something that needs attention?',
    facilitatorNote:
      'Let them name it. Find out where they actually land, then build the channel around that.',
  },
  {
    id: 'q-read',
    type: 'poll',
    sectionLabel: '05 - Staying connected',
    title: 'Would you actually read a monthly AI update: what\'s new, what other teams are doing?',
    pollOptions: [
      { id: 'qr-yes',   label: 'Yes' },
      { id: 'qr-maybe', label: 'Maybe, depends on the format' },
      { id: 'qr-no',    label: 'Probably not' },
    ],
  },

  // ── CLOSE ─────────────────────────────────────────────────────────────────
  {
    id: 'close',
    type: 'close',
    title: 'Thank you.',
  },
];
