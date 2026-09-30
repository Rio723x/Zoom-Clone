import { useState } from "react";
import { BarChart3, Plus, X } from "lucide-react";
import SidePanel from "./SidePanel";
import type { Poll, PollResults, MyVotes } from "@/lib/polls";

interface PollsPanelProps {
  isHost: boolean;
  polls: Poll[];
  results: PollResults;
  myVotes: MyVotes;
  onCreate: (question: string, options: string[]) => void;
  onVote: (pollId: string, optionIndex: number) => void;
  onClose: () => void;
}

export default function PollsPanel({
  isHost,
  polls,
  results,
  myVotes,
  onCreate,
  onVote,
  onClose,
}: PollsPanelProps) {
  const [creating, setCreating] = useState(false);

  return (
    <SidePanel
      title="Polls"
      onClose={onClose}
      footer={
        isHost && !creating ? (
          <button
            onClick={() => setCreating(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zoom-blue px-3 py-2 text-sm font-medium text-white hover:bg-zoom-blue-hover"
          >
            <Plus className="h-4 w-4" /> Create a Poll
          </button>
        ) : undefined
      }
    >
      {creating ? (
        <CreatePollForm
          onCancel={() => setCreating(false)}
          onCreate={(q, o) => {
            onCreate(q, o);
            setCreating(false);
          }}
        />
      ) : polls.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <BarChart3 className="h-12 w-12 text-text-muted" strokeWidth={1.25} />
          <p className="text-sm text-text-secondary">
            {isHost
              ? "No polls yet. Create a poll to engage participants."
              : "The host has not started any polls yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {polls.map((poll) => {
            const counts = results[poll.id] ?? poll.options.map(() => 0);
            const total = counts.reduce((a, b) => a + b, 0);
            const myVote = myVotes[poll.id];
            const voted = myVote !== undefined;
            const showResults = voted || isHost;
            return (
              <div
                key={poll.id}
                className="rounded-lg bg-tile p-3 text-text-primary"
              >
                <p className="mb-2 text-sm font-medium">{poll.question}</p>
                <div className="flex flex-col gap-2">
                  {poll.options.map((opt, i) => {
                    const pct = total ? Math.round((counts[i] / total) * 100) : 0;
                    return (
                      <button
                        key={i}
                        disabled={voted}
                        onClick={() => onVote(poll.id, i)}
                        className="relative overflow-hidden rounded-md border border-panel-border px-3 py-2 text-left text-sm disabled:cursor-default"
                      >
                        {showResults && (
                          <span
                            className="absolute inset-y-0 left-0 bg-zoom-blue/25"
                            style={{ width: `${pct}%` }}
                          />
                        )}
                        <span className="relative flex justify-between">
                          <span className={myVote === i ? "font-semibold" : ""}>
                            {opt}
                          </span>
                          {showResults && (
                            <span className="text-text-secondary">{pct}%</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {showResults && (
                  <p className="mt-2 text-xs text-text-secondary">
                    {total} vote{total === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SidePanel>
  );
}

function CreatePollForm({
  onCreate,
  onCancel,
}: {
  onCreate: (question: string, options: string[]) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const valid =
    question.trim().length > 0 &&
    options.filter((o) => o.trim().length > 0).length >= 2;

  return (
    <div className="flex flex-col gap-3 p-4 text-text-primary">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll question"
        className="rounded-md border border-panel-border bg-tile px-3 py-2 text-sm outline-none focus:border-zoom-blue"
      />
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={opt}
            onChange={(e) =>
              setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
            }
            placeholder={`Option ${i + 1}`}
            className="flex-1 rounded-md border border-panel-border bg-tile px-3 py-2 text-sm outline-none focus:border-zoom-blue"
          />
          {options.length > 2 && (
            <button
              onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
              className="text-text-secondary hover:text-leave-hover"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => setOptions((prev) => [...prev, ""])}
        className="self-start text-xs text-zoom-blue hover:underline"
      >
        + Add option
      </button>
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="rounded-md border border-panel-border px-3 py-1.5 text-sm hover:bg-hover"
        >
          Cancel
        </button>
        <button
          disabled={!valid}
          onClick={() =>
            onCreate(
              question.trim(),
              options.map((o) => o.trim()).filter(Boolean),
            )
          }
          className="rounded-md bg-zoom-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-zoom-blue-hover disabled:opacity-50"
        >
          Launch
        </button>
      </div>
    </div>
  );
}
