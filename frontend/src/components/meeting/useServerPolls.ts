import type { MeetingSocket } from "@/hooks/useMeetingSocket";
import type { MyVotes, Poll, PollResults } from "@/lib/polls";

interface ServerPolls {
  polls: Poll[];
  results: PollResults;
  myVotes: MyVotes;
  createPoll: (question: string, options: string[]) => void;
  vote: (pollId: string, optionIndex: number) => void;
}

/**
 * Adapts server-held polls (numeric ids, per-option ids) to the index-based shape the
 * polls panel renders. Votes and results are authoritative on the server, so late joiners
 * and reconnects see the same tallies.
 */
export function useServerPolls({ room, send }: MeetingSocket): ServerPolls {
  const polls: Poll[] = room.polls.map((poll) => ({
    id: String(poll.id),
    question: poll.question,
    options: poll.options.map((option) => option.text),
    launched: true,
  }));

  const results: PollResults = {};
  const myVotes: MyVotes = {};
  for (const poll of room.polls) {
    const key = String(poll.id);
    results[key] = poll.options.map((option) => option.vote_count);
    const chosen = room.myVotes[poll.id];
    if (chosen !== undefined) {
      const index = poll.options.findIndex((option) => option.id === chosen);
      if (index >= 0) myVotes[key] = index;
    }
  }

  return {
    polls,
    results,
    myVotes,
    createPoll: (question, options) => {
      send({ type: "poll-create", question, options });
    },
    vote: (pollId, optionIndex) => {
      const poll = room.polls.find((p) => String(p.id) === pollId);
      const option = poll?.options[optionIndex];
      if (poll && option) send({ type: "poll-vote", poll_id: poll.id, option_id: option.id });
    },
  };
}
