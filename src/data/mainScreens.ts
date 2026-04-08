import type { Screen } from '../types';

export const mainScreens: Screen[] = [
  {
    id: 'intro',
    type: 'intro',
    title:
      'Thanks for making time this week.\nThis is an open conversation — no right answers, no performance review.\nWe want to understand what\'s actually happening with AI tools at LBS — what\'s working, what\'s not, and what would make it better.',
    facilitatorNote: 'Get eye contact before moving. Don\'t rush this.',
  },
  {
    id: 'q1',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'How often do you use AI tools in your work?',
    pollOptions: [
      { id: 'q1-daily', label: 'Every day' },
      { id: 'q1-weekly', label: 'A few times a week' },
      { id: 'q1-occasionally', label: 'Occasionally / experimenting' },
      { id: 'q1-rarely', label: 'Rarely or never' },
    ],
  },
  {
    id: 'q5',
    type: 'poll',
    sectionLabel: 'Baseline',
    title: 'How much of the work you produce today is AI-assisted?',
    pollOptions: [
      { id: 'q5-none', label: 'None — I do it myself' },
      { id: 'q5-lt25', label: 'Less than 25%' },
      { id: 'q5-25to50', label: '25–50%' },
      { id: 'q5-50to75', label: '50–75%' },
      { id: 'q5-gt75', label: 'More than 75%' },
      { id: 'q5-na', label: 'Not applicable to my role' },
    ],
  },
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
    title: 'What do you like about the AI tools you\'ve received?',
    subtitle: 'What does it actually give you that you didn\'t have before?',
    facilitatorNote: 'Open floor. Don\'t prompt with examples yet — let them lead.',
  },
  {
    id: 'disc-beyond-code',
    type: 'discussion',
    sectionLabel: '01 — What\'s already working',
    title: 'What have people been using AI for outside of writing code?',
    subtitle: 'Documentation, analysis, testing, planning?',
    facilitatorNote:
      'This is where non-devs find their voice. Don\'t let devs dominate.',
  },
  {
    id: 'q2',
    type: 'poll',
    sectionLabel: '01 — What\'s already working',
    title: 'Where do you use AI tools most right now?',
    pollOptions: [
      { id: 'q2-code', label: 'Writing or reviewing code' },
      { id: 'q2-docs', label: 'Documentation or writing' },
      { id: 'q2-research', label: 'Research / answering questions' },
      { id: 'q2-agents', label: 'I\'ve built custom tools or agents' },
      { id: 'q2-none', label: 'I\'m not using them yet' },
    ],
  },
  {
    id: 'divider-02',
    type: 'divider',
    dividerTitle: '02 — What\'s getting in the way',
    dividerDuration: '~20 minutes',
    facilitatorNote:
      'Keith\'s framing: what\'s holding you back from a deep dive? Is there anything that scares you?\nGoal is honest answers — not a troubleshooting session. Listen and capture. Don\'t defend, explain, or problem-solve in the moment.',
  },
  {
    id: 'disc-roadblocks',
    type: 'discussion',
    sectionLabel: '02 — What\'s getting in the way',
    title:
      'If you haven\'t fully adopted the tools or feel your usage could be higher — what roadblocks are you facing?',
    subtitle: 'What would it take for this to feel like a normal part of your day?',
    facilitatorNote:
      'Looking for: time, training, examples, permission, trust, tool fit. Don\'t fill silences too fast.',
  },
  {
    id: 'disc-didnt-help',
    type: 'discussion',
    sectionLabel: '02 — What\'s getting in the way',
    title:
      'Is there a type of work where you tried it and it just didn\'t help?',
    subtitle: 'What happened?',
    facilitatorNote:
      'This often surfaces the regulated workflow friction and legacy codebase pain Ty flagged.',
  },
  {
    id: 'q3',
    type: 'poll',
    sectionLabel: '02 — What\'s getting in the way',
    title: 'What\'s your single biggest blocker to using AI tools more?',
    pollOptions: [
      { id: 'q3-access', label: 'I don\'t have the right access or tools' },
      { id: 'q3-usecase', label: 'I don\'t know what I\'d actually use it for' },
      { id: 'q3-time', label: 'Too busy — no time to experiment' },
      { id: 'q3-trust', label: 'I don\'t trust the output enough to rely on it' },
      { id: 'q3-none', label: 'No real blocker — I use it freely' },
    ],
    facilitatorNote:
      'Most important poll of the session. People will vote what they won\'t say out loud.',
  },
  {
    id: 'divider-03',
    type: 'divider',
    dividerTitle: '03 — Use cases and what\'s getting blocked',
    dividerDuration: '~30 minutes',
  },
  {
    id: 'disc-hand-off',
    type: 'discussion',
    sectionLabel: '03 — Use cases',
    title:
      'What\'s the most repetitive or painful part of your job you wish you could hand off?',
    facilitatorNote:
      'Best single use case detection question. Frames AI as relief, not productivity theatre.\nLog parsing, documentation, image analysis, scan QA, requirements traceability — all surfaced this way before.',
  },
  {
    id: 'disc-legacy',
    type: 'discussion',
    sectionLabel: '03 — Use cases',
    title:
      'Where in the codebase do you think AI could genuinely help — that nobody\'s actually tried yet?',
    facilitatorNote:
      'The legacy code question. Specific enough that engineers who\'ve been quietly thinking about it will have a real answer.',
  },
  {
    id: 'disc-code-review',
    type: 'discussion',
    sectionLabel: '03 — Use cases',
    title: 'How are you using AI for code review, if at all?',
    subtitle:
      'Where do the tools you have fall short — not because of access, but because they just don\'t map well to how LBS works?',
    facilitatorNote:
      'BitBucket vs GitHub, regulated workflows, C legacy code — this is where fit vs permission surfaces.',
  },
  {
    id: 'disc-six-months',
    type: 'discussion',
    sectionLabel: '03 — Use cases',
    title:
      'If you could map out what a well-built AI setup looks like for this team six months from now —',
    subtitle: 'what\'s there that isn\'t today?',
    facilitatorNote:
      'Let them paint it. Don\'t correct or narrow. This is use case and tooling gap gold.',
  },
  {
    id: 'q6',
    type: 'poll',
    sectionLabel: '03 — Use cases',
    title: 'How do you feel about AI doing the majority of your work?',
    pollOptions: [
      { id: 'q6-excited', label: 'Excited — I want to get there' },
      { id: 'q6-open', label: 'Open to it, with the right guardrails' },
      { id: 'q6-nervous', label: 'Nervous — quality and review are real concerns' },
      { id: 'q6-no', label: 'Not for me — I prefer doing it myself' },
      { id: 'q6-depends', label: 'Depends entirely on the type of work' },
      { id: 'q6-na', label: 'Not applicable to my role' },
    ],
  },
  {
    id: 'q7',
    type: 'poll',
    sectionLabel: '03 — Use cases',
    title: 'What does your role look like in two years?',
    pollOptions: [
      { id: 'q7-same', label: 'Mostly the same, with better tools alongside me' },
      { id: 'q7-strategic', label: 'More strategic / directing work, less doing it manually' },
      { id: 'q7-early', label: 'Too early to say — things are moving too fast' },
      { id: 'q7-uncertain', label: 'I\'m genuinely uncertain / worried' },
      { id: 'q7-new', label: 'I\'ll be doing things that don\'t exist yet' },
    ],
  },
  {
    id: 'divider-04',
    type: 'divider',
    dividerTitle: '04 — Staying connected after this week',
    dividerDuration: '~10 minutes',
    facilitatorNote:
      'Keep this short. The open door has to be named explicitly or people won\'t use it.\nAnish only admitted he\'d been rationing tokens after the offer was made directly.\nKeith flagged that the Teams channel doesn\'t get checked — don\'t just point people there.',
  },
  {
    id: 'disc-where-go',
    type: 'discussion',
    sectionLabel: '04 — Staying connected',
    title:
      'If you have an idea or a question after this week — where do you naturally go to raise it?',
    facilitatorNote:
      'Let them name it. Find out where they actually land, then build the channel around that.',
  },
  {
    id: 'q-read',
    type: 'poll',
    sectionLabel: '04 — Staying connected',
    title:
      'Would a monthly update — here\'s what\'s new, here\'s what other teams are doing — be something you\'d actually read?',
    pollOptions: [
      { id: 'qr-yes', label: 'Yes, absolutely' },
      { id: 'qr-maybe', label: 'Maybe — depends on the format' },
      { id: 'qr-no', label: 'Probably not' },
      { id: 'qr-short', label: 'Only if it\'s very short' },
    ],
  },
  {
    id: 'close',
    type: 'close',
    title:
      'Thank you.\nEverything you shared today goes back to the team.\nIf something comes up after this week — reach out directly.',
  },
];
