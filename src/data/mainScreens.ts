import type { Screen } from '../types';

export const mainScreens: Screen[] = [
  // ── INTRO ────────────────────────────────────────────────────────────────
  {
    id: 'intro',
    type: 'intro',
    title:
      'Thanks for making time.\nI just want an honest picture of where things are with AI at LBS — what\'s working, what\'s not, and what would actually help.\nAll votes are anonymous — there are no right answers here.',
    facilitatorNote: 'Get eye contact before moving. Don\'t rush this.',
  },

  // ── BASELINE ─────────────────────────────────────────────────────────────
  {
    id: 'q1',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'How often do you use AI tools in your work?',
    pollOptions: [
      { id: 'q1-daily',         label: 'Every day' },
      { id: 'q1-weekly',        label: 'A few times a week' },
      { id: 'q1-occasionally',  label: 'Occasionally — a few times a month' },
      { id: 'q1-experimenting', label: 'Still experimenting / early days' },
      { id: 'q1-rarely',        label: 'Rarely or never' },
    ],
  },
  {
    id: 'q-sentiment',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'Honestly — how do you feel about AI in your work right now?',
    pollOptions: [
      { id: 'qs-excited',   label: 'Genuinely excited — actively exploring' },
      { id: 'qs-cautious',  label: 'Cautiously optimistic — watching how it develops' },
      { id: 'qs-skeptical', label: 'Skeptical — haven\'t seen enough to believe the hype' },
      { id: 'qs-concerned', label: 'Concerned — about quality, job impact, or direction' },
      { id: 'qs-neutral',   label: 'Neutral — haven\'t thought about it much' },
    ],
  },
  {
    id: 'q-confidence',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'How confident do you feel using AI tools effectively?',
    pollOptions: [
      { id: 'qc-confident', label: 'Very confident — I know how to get good results' },
      { id: 'qc-getting',   label: 'Getting there — trial and error mostly' },
      { id: 'qc-low',       label: 'Not very confident — I have access but struggle to get value' },
      { id: 'qc-none',      label: 'No experience yet to judge' },
    ],
  },
  {
    id: 'q5',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'How much of the work you produce today is AI-assisted?',
    pollOptions: [
      { id: 'q5-lt25',  label: 'Less than 25% of my work' },
      { id: 'q5-25to50', label: 'About 25–50%' },
      { id: 'q5-gt50',  label: 'More than 50%' },
      { id: 'q5-na',    label: 'I don\'t really use AI tools yet' },
    ],
  },

  // ── 01 WHAT'S ALREADY WORKING ────────────────────────────────────────────
  {
    id: 'divider-01',
    type: 'divider',
    dividerTitle: '01 — What\'s already working',
    dividerDuration: '~15 minutes',
    facilitatorNote:
      'Start here to disarm the room. Let it be short if it wants to be short. Don\'t push for depth yet.',
  },
  {
    id: 'disc-like',
    type: 'discussion',
    sectionLabel: '01 — What\'s already working',
    title:
      'For those using AI tools — what\'s working well? For those who haven\'t started — what\'s holding you back from trying?',
    subtitle: 'What does it actually give you that you didn\'t have before?',
    facilitatorNote: 'Open floor. Don\'t prompt with examples yet — let them lead.',
  },
  {
    id: 'disc-beyond-code',
    type: 'discussion',
    sectionLabel: '01 — What\'s already working',
    title: 'What are you using AI for outside of writing code?',
    facilitatorNote:
      'This is where non-devs find their voice. Don\'t let devs dominate.',
  },

  // ── 02 WHAT'S GETTING IN THE WAY ─────────────────────────────────────────
  {
    id: 'divider-02',
    type: 'divider',
    dividerTitle: '02 — What\'s getting in the way',
    dividerDuration: '~20 minutes',
    facilitatorNote:
      'Goal is honest answers — not a troubleshooting session. Listen and capture. Don\'t defend, explain, or problem-solve in the moment.',
  },
  {
    id: 'disc-roadblocks',
    type: 'discussion',
    sectionLabel: '02 — What\'s getting in the way',
    title: 'What\'s getting in the way of using AI tools more?',
    subtitle: 'What would it take for this to feel like a normal part of your day?',
    facilitatorNote:
      'Looking for: time, training, examples, permission, trust, tool fit. Don\'t fill silences too fast.',
  },
  {
    id: 'disc-didnt-help',
    type: 'discussion',
    sectionLabel: '02 — What\'s getting in the way',
    title: 'Is there a type of work where you tried it and it just didn\'t help?',
    subtitle: 'What happened?',
    facilitatorNote:
      'This often surfaces the regulated workflow friction and legacy codebase pain.',
  },
  {
    id: 'q3',
    type: 'poll',
    sectionLabel: '02 — What\'s getting in the way',
    title: 'What\'s your single biggest blocker to using AI tools more?',
    pollOptions: [
      { id: 'q3-access',  label: 'I don\'t have access to the tools I need' },
      { id: 'q3-fit',     label: 'The tools available don\'t fit how I actually work' },
      { id: 'q3-usecase', label: 'I don\'t know what I\'d actually use it for' },
      { id: 'q3-time',    label: 'Too busy — no time to experiment' },
      { id: 'q3-trust',   label: 'I don\'t trust the output enough to rely on it' },
      { id: 'q3-none',    label: 'No real blocker — I use it freely' },
    ],
    facilitatorNote:
      'Most important poll of the session. People will vote what they won\'t say out loud.',
  },

  // ── 03 USE CASES ──────────────────────────────────────────────────────────
  {
    id: 'divider-03',
    type: 'divider',
    dividerTitle: '03 — Use cases',
    dividerDuration: '~20 minutes',
  },
  {
    id: 'disc-hand-off',
    type: 'discussion',
    sectionLabel: '03 — Use cases',
    title:
      'What\'s the most repetitive or painful part of your job you wish you could hand off?',
    facilitatorNote:
      'Best single use case detection question. Frames AI as relief, not productivity theatre.',
  },
  {
    id: 'disc-legacy',
    type: 'discussion',
    sectionLabel: '03 — Use cases',
    title:
      'Where in your work do you think AI could genuinely help — something you haven\'t actually tried yet?',
    facilitatorNote:
      'The legacy workflow question. Specific enough that engineers who\'ve been quietly thinking about it will have a real answer. Also opens it up to non-devs.',
  },
  {
    id: 'disc-code-review',
    type: 'discussion',
    sectionLabel: '03 — Use cases',
    title:
      'Where do the tools fall short — not because of access, but because they just don\'t map to how LBS actually works?',
    facilitatorNote:
      'BitBucket vs GitHub, regulated workflows, C legacy code — this is where fit vs permission surfaces.',
  },

  // ── 04 WHERE WE'RE HEADED ─────────────────────────────────────────────────
  {
    id: 'divider-04',
    type: 'divider',
    dividerTitle: '04 — Where we\'re headed',
    dividerDuration: '~15 minutes',
    facilitatorNote:
      'Let them paint it. Don\'t correct or narrow. This is use case and tooling gap gold.',
  },
  {
    id: 'disc-six-months',
    type: 'discussion',
    sectionLabel: '04 — Where we\'re headed',
    title:
      'If AI was working well for this team six months from now — what would look different from today?',
    facilitatorNote: 'Let them paint it. Don\'t correct or narrow.',
  },
  {
    id: 'disc-agents',
    type: 'discussion',
    sectionLabel: '04 — Where we\'re headed',
    title:
      'AI agents can take a sequence of actions autonomously — browsing, writing code, running tests, filing tickets.',
    subtitle:
      'Where do you see that being useful in LBS products or in how your team works?',
    facilitatorNote:
      'Gauge awareness before diving in. If the room is blank, explain briefly: "Think of it as AI that can do a multi-step task end-to-end without you driving each step."',
  },
  {
    id: 'q-agents',
    type: 'poll',
    sectionLabel: '04 — Where we\'re headed',
    title: 'How familiar are you with AI agents right now?',
    pollOptions: [
      { id: 'qa-heard',    label: 'Heard of them but haven\'t explored' },
      { id: 'qa-used',     label: 'I\'ve used one or experimented with them' },
      { id: 'qa-built',    label: 'I\'ve built or deployed something agentic' },
      { id: 'qa-new',      label: 'First time hearing the term' },
    ],
  },
  {
    id: 'q7',
    type: 'poll',
    sectionLabel: '04 — Where we\'re headed',
    title: 'How do you see AI assisting you with your job in two years?',
    pollOptions: [
      { id: 'q7-same',      label: 'Similar to now, just faster and smoother' },
      { id: 'q7-strategic', label: 'Handling the repetitive parts so I can focus on harder problems' },
      { id: 'q7-new',       label: 'Enabling work I can\'t do today at all' },
      { id: 'q7-unsure',    label: 'Too early to say — still figuring it out' },
    ],
  },

  // ── 05 STAYING CONNECTED ──────────────────────────────────────────────────
  {
    id: 'divider-05',
    type: 'divider',
    dividerTitle: '05 — Staying connected',
    dividerDuration: '~10 minutes',
    facilitatorNote:
      'Keep this short. The open door has to be named explicitly or people won\'t use it.',
  },
  {
    id: 'disc-where-go',
    type: 'discussion',
    sectionLabel: '05 — Staying connected',
    title:
      'If you have an idea or a question after today — where do you naturally go to raise it?',
    facilitatorNote:
      'Let them name it. Find out where they actually land, then build the channel around that.',
  },
  {
    id: 'q-read',
    type: 'poll',
    sectionLabel: '05 — Staying connected',
    title: 'Would you actually read a monthly AI update — what\'s new, what other teams are doing?',
    pollOptions: [
      { id: 'qr-yes',    label: 'Yes' },
      { id: 'qr-maybe',  label: 'Maybe — depends on the format' },
      { id: 'qr-no',     label: 'Probably not' },
    ],
  },

  // ── CLOSE ─────────────────────────────────────────────────────────────────
  {
    id: 'close',
    type: 'close',
    title: 'Thank you.',
  },
];
