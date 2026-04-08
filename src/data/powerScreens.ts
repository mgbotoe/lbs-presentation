import type { Screen } from '../types';

export const powerScreens: Screen[] = [
  {
    id: 'q9',
    type: 'poll',
    sectionLabel: 'Power Users',
    title: 'Right now, what % of AI-written code do you actually read before it ships?',
    pollOptions: [
      { id: 'q9-all', label: 'All of it — I review everything' },
      { id: 'q9-most', label: 'Most of it — I spot-check the rest' },
      { id: 'q9-half', label: 'About half' },
      { id: 'q9-small', label: 'A small fraction — I rely on tests' },
      { id: 'q9-zero', label: 'Trying to get to zero review / full test coverage' },
      { id: 'q9-na', label: 'I don\'t write code' },
    ],
  },
  {
    id: 'q10',
    type: 'poll',
    sectionLabel: 'Power Users',
    title: 'What would need to be true for you to trust an agent running on your repos overnight?',
    pollOptions: [
      { id: 'q10-tests', label: 'Solid test coverage that I designed' },
      { id: 'q10-audit', label: 'Audit logs I can review in the morning' },
      { id: 'q10-limits', label: 'Hard limits on what files it can touch' },
      { id: 'q10-no', label: 'Nothing — I\'m not comfortable with that yet' },
      { id: 'q10-partway', label: 'We\'re already partway there, honestly' },
      { id: 'q10-na', label: 'Not relevant to my role' },
    ],
  },
];
