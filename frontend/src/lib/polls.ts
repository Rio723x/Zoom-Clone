export interface Poll {
  id: string;
  question: string;
  options: string[];
  launched: boolean;
}

/** Per-poll vote tallies, indexed by option position. */
export type PollResults = Record<string, number[]>;

/** The local user's chosen option index per poll. */
export type MyVotes = Record<string, number>;
