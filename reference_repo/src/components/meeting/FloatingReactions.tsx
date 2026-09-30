interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
}

/** Renders emoji reactions floating up from the bottom of the stage. */
export default function FloatingReactions({
  reactions,
}: {
  reactions: FloatingReaction[];
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {reactions.map((r) => (
        <span
          key={r.id}
          className="absolute bottom-24 text-4xl"
          style={{
            left: `${r.left}%`,
            animation: "float-up 3s ease-out forwards",
          }}
        >
          {r.emoji}
        </span>
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { transform: translateY(-320px) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export type { FloatingReaction };
