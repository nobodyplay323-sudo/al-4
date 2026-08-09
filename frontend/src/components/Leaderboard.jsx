import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { getScores } from "@/lib/api";
import { Trophy, CircleNotch } from "@phosphor-icons/react";

const Leaderboard = forwardRef(({ game, scoreLabel, accent, highlightId }, ref) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getScores(game, 10);
      setRows(data);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [game]);

  useImperativeHandle(ref, () => ({ reload: load }));

  useEffect(() => {
    load();
  }, [load]);

  const medal = (i) => {
    if (i === 0) return "text-yellow-400";
    if (i === 1) return "text-zinc-300";
    if (i === 2) return "text-amber-600";
    return "text-zinc-500";
  };

  return (
    <div
      data-testid="leaderboard"
      className="rounded-lg border border-zinc-800 bg-[#0d0d0d]"
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <Trophy weight="fill" size={18} style={{ color: accent }} />
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-100">
          Clasament global
        </h3>
      </div>
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-zinc-500">
            <CircleNotch className="animate-spin" size={18} />
            <span className="text-sm">Se încarcă...</span>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-zinc-500">
            Niciun scor încă. Fii primul!
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800/70">
            {rows.map((r, i) => (
              <li
                key={r.id}
                data-testid={`leaderboard-row-${i}`}
                className={`flex items-center gap-3 rounded px-3 py-2.5 transition-colors duration-200 ${
                  highlightId === r.id ? "bg-cyan-500/10 ring-1 ring-cyan-500/40" : ""
                }`}
              >
                <span className={`w-6 font-mono text-sm font-bold ${medal(i)}`}>
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-zinc-200">
                  {r.nickname}
                </span>
                <span
                  className="font-mono text-sm font-bold text-zinc-50"
                  data-testid={`leaderboard-score-${i}`}
                >
                  {r.score.toLocaleString("ro-RO")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {scoreLabel && (
        <p className="border-t border-zinc-800 px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          Metrică: {scoreLabel}
        </p>
      )}
    </div>
  );
});

Leaderboard.displayName = "Leaderboard";
export default Leaderboard;
