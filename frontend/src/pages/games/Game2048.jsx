import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react";

const N = 4;

const TILE_COLORS = {
  2: ["#1c1c1f", "#a1a1aa"],
  4: ["#26262b", "#d4d4d8"],
  8: ["#0e4b56", "#67e8f9"],
  16: ["#155e75", "#a5f3fc"],
  32: ["#166534", "#86efac"],
  64: ["#15803d", "#bbf7d0"],
  128: ["#854d0e", "#fde68a"],
  256: ["#a16207", "#fef08a"],
  512: ["#b45309", "#fed7aa"],
  1024: ["#9a3412", "#fdba74"],
  2048: ["#06b6d4", "#050505"],
};

function empty() {
  return Array.from({ length: N }, () => Array(N).fill(0));
}
function clone(g) {
  return g.map((r) => r.slice());
}
function addRandom(g) {
  const cells = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] === 0) cells.push([r, c]);
  if (!cells.length) return g;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}
function slide(row) {
  const arr = row.filter((v) => v);
  let gained = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      gained += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < N) arr.push(0);
  return { row: arr, gained };
}
function rotate(g) {
  const res = empty();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) res[c][N - 1 - r] = g[r][c];
  return res;
}
function equal(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function canMove(g) {
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (g[r][c] === 0) return true;
      if (c < N - 1 && g[r][c] === g[r][c + 1]) return true;
      if (r < N - 1 && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
}

function move(grid, dir) {
  // dir: 0 left, 1 up, 2 right, 3 down
  let g = clone(grid);
  for (let i = 0; i < dir; i++) g = rotate(g);
  let gained = 0;
  g = g.map((row) => {
    const { row: nr, gained: gg } = slide(row);
    gained += gg;
    return nr;
  });
  for (let i = 0; i < (4 - dir) % 4; i++) g = rotate(g);
  return { grid: g, gained };
}

export default function Game2048({ accent, onGameOver }) {
  const [grid, setGrid] = useState(() => addRandom(addRandom(empty())));
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const touchRef = useRef(null);
  const reportedRef = useRef(false);

  const doMove = useCallback(
    (dir) => {
      if (over) return;
      setGrid((prev) => {
        const { grid: ng, gained } = move(prev, dir);
        if (equal(ng, prev)) return prev;
        addRandom(ng);
        if (gained) setScore((s) => s + gained);
        if (!won && ng.some((row) => row.includes(2048))) setWon(true);
        if (!canMove(ng)) setOver(true);
        return ng;
      });
    },
    [over, won]
  );

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3, a: 0, w: 1, d: 2, s: 3 };
      if (map[e.key] !== undefined) {
        e.preventDefault();
        doMove(map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  useEffect(() => {
    if (over && score > 0 && !reportedRef.current) {
      reportedRef.current = true;
      onGameOver(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  const reset = () => {
    reportedRef.current = false;
    setGrid(addRandom(addRandom(empty())));
    setScore(0);
    setOver(false);
    setWon(false);
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 2 : 0);
    else doMove(dy > 0 ? 3 : 1);
    touchRef.current = null;
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#0d0d0d] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">Scor</div>
          <div className="font-mono text-2xl font-bold" style={{ color: accent }} data-testid="g2048-score">
            {score}
          </div>
        </div>
        <Button data-testid="g2048-reset" onClick={reset} variant="outline" className="gap-1.5 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800">
          <ArrowClockwise weight="bold" size={16} /> Joc nou
        </Button>
      </div>

      <div
        className="relative mx-auto aspect-square w-full max-w-md touch-none rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        data-testid="g2048-board"
      >
        <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-2.5">
          {grid.flat().map((v, i) => {
            const [bg, fg] = TILE_COLORS[v] || ["#0a0a0a", "#fff"];
            return (
              <div
                key={i}
                className="flex items-center justify-center rounded-md font-mono font-bold transition-colors duration-150"
                style={{
                  backgroundColor: v ? bg : "rgba(255,255,255,0.03)",
                  color: fg,
                  fontSize: v >= 1024 ? "1.25rem" : v >= 128 ? "1.5rem" : "1.9rem",
                }}
              >
                {v ? <span className="pop-in">{v}</span> : ""}
              </div>
            );
          })}
        </div>

        {won && !over && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-cyan-500/50 bg-cyan-500/15 px-4 py-1 font-mono text-xs uppercase tracking-widest text-cyan-300">
            Ai atins 2048!
          </div>
        )}

        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-black/85 backdrop-blur-sm">
            <p className="font-display text-2xl font-bold text-zinc-100">Ai rămas blocat!</p>
            <p className="font-mono text-lg" style={{ color: accent }}>{score} puncte</p>
            <Button data-testid="g2048-restart" onClick={reset} className="gap-2 bg-cyan-500 font-semibold text-black hover:bg-cyan-400">
              <ArrowClockwise weight="bold" size={16} /> Din nou
            </Button>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Săgeți / WASD pe desktop · glisează pe telefon
      </p>
    </div>
  );
}
