export type ScreenType = 'intro' | 'poll' | 'discussion' | 'divider' | 'close';

export interface PollOption {
  id: string;
  label: string;
}

export interface Screen {
  id: string;
  type: ScreenType;
  sectionLabel?: string;
  title?: string;
  subtitle?: string;
  facilitatorNote?: string;
  pollOptions?: PollOption[];
  dividerTitle?: string;
  dividerDuration?: string;
}

export interface VoteTally {
  [optionId: string]: number;
}

export type WSMessageToServer =
  | { type: 'set_screen'; screenIndex: number; sessionType: 'main' | 'poweruser' }
  | { type: 'reset_votes'; questionId: string }
  | { type: 'reveal_results'; questionId: string }
  | { type: 'vote'; questionId: string; optionId: string }
  | { type: 'register'; role: 'presenter' | 'audience' };

export type WSMessageToClient =
  | { type: 'vote_update'; questionId: string; votes: VoteTally }
  | { type: 'audience_count'; count: number }
  | { type: 'show_poll'; questionId: string; question: string; options: PollOption[] }
  | { type: 'waiting'; message: string }
  | { type: 'vote_confirmed'; questionId: string; optionId: string }
  | { type: 'registered'; role: 'presenter' | 'audience'; clientId: string };
