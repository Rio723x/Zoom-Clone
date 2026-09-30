import { usePubSub } from "@videosdk.live/react-sdk";
import type { Poll, PollResults, MyVotes } from "@/lib/polls";

interface LivePolls {
  polls: Poll[];
  results: PollResults;
  myVotes: MyVotes;
  createPoll: (question: string, options: string[]) => void;
  vote: (pollId: string, optionIndex: number) => void;
}

/**
 * App-side polls over pubsub. Poll definitions and votes are persisted so late
 * joiners receive them. Votes are deduped per sender (last vote wins).
 */
export function useLivePolls(localId: string | undefined): LivePolls {
  const { publish: publishPoll, messages: pollMsgs } = usePubSub("POLL_CREATE");
  const { publish: publishVote, messages: voteMsgs } = usePubSub("POLL_VOTE");

  const polls: Poll[] = pollMsgs
    .map((m) => {
      try {
        const p = JSON.parse(m.message) as Omit<Poll, "launched">;
        return { ...p, launched: true } as Poll;
      } catch {
        return null;
      }
    })
    .filter((p): p is Poll => p !== null);

  // Last vote per (pollId, senderId) wins.
  const latestVote = new Map<string, number>(); // key `${pollId}:${senderId}`
  for (const m of voteMsgs) {
    try {
      const v = JSON.parse(m.message) as { pollId: string; optionIndex: number };
      latestVote.set(`${v.pollId}:${m.senderId}`, v.optionIndex);
    } catch {
      /* ignore malformed */
    }
  }

  const results: PollResults = {};
  const myVotes: MyVotes = {};
  for (const poll of polls) {
    results[poll.id] = poll.options.map(() => 0);
  }
  for (const [key, optionIndex] of latestVote) {
    const sep = key.lastIndexOf(":");
    const pollId = key.slice(0, sep);
    const senderId = key.slice(sep + 1);
    if (results[pollId]?.[optionIndex] !== undefined) {
      results[pollId][optionIndex] += 1;
    }
    if (senderId === localId) myVotes[pollId] = optionIndex;
  }

  return {
    polls,
    results,
    myVotes,
    createPoll: (question, options) => {
      const id = `poll-${pollMsgs.length}-${question.length}`;
      publishPoll(JSON.stringify({ id, question, options }), { persist: true });
    },
    vote: (pollId, optionIndex) => {
      publishVote(JSON.stringify({ pollId, optionIndex }), { persist: true });
    },
  };
}
