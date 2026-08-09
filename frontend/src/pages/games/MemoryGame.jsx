import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowClockwise, Heart, Star, Lightning, Moon, Sun, Cloud, Drop, Fire } from "@phosphor-icons/react";

const ICONS = [
  { C: Heart, color: "#ef4444" },
  { C: Star, color: "#eab308" },
  { C: Lightning, color: "#06b6d4" },
  { C: Moon, color: "#a855f7" },
  { C: Sun, color: "#f97316" },
  { C: Cloud, color: "#38bdf8" },
  { C: Drop, color: "#3b82f6" },
  { C: Fire, color: "#f43f5e" },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  const pairs = ICONS.flatMap((icon, i) => [
    { key: `${i}a`, id: i, ...icon },
    { key: `${i}b`, id: i, ...icon },
  ]);
  return shuffle(pairs);
}

export default function MemoryGame({ accent, onGameOver }) {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (started && !done) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [started, done]);

  const computeScore = () => Math.max(50, 1200 - (moves - ICONS.length) * 25 - seconds * 4);

  useEffect(() => {
    if (matched.length === ICONS.length && started && !reportedRef.current) {
      reportedRef.current = true;
      setDone(true);
      clearInterval(timerRef.current);
      onGameOver(computeScore(), { moves, seconds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const flip = (idx) => {
    if (done) return;
    if (!started) setStarted(true);
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(deck[idx].id)) return;

    const nf = [...flipped, idx];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nf;
      if (deck[a].id === deck[b].id) {
        setMatched((m) => [...m, deck[a].id]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const reset = () => {
    clearInterval(timerRef.current);
    reportedRef.current = false;
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setDone(false);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#0d0d0d] p-6">
      <div className="mb-5 flex items-center justify-between font-mono text-sm">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-500">Mutări </span>
          <span className="font-bold text-zinc-100" data-testid="memory-moves">{moves}</span>
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-500">Timp </span>
          <span className="font-bold text-zinc-100" data-testid="memory-time">{seconds}s</span>
        </div>
        <Button data-testid="memory-reset" onClick={reset} variant="outline" size="sm" className="gap-1.5 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800">
          <ArrowClockwise weight="bold" size={14} /> Reset
        </Button>
      </div>

      <div className="mx-auto grid max-w-md grid-cols-4 gap-3" data-testid="memory-board">
        {deck.map((card, idx) => {
          const isUp = flipped.includes(idx) || matched.includes(card.id);
          const Icon = card.C;
          return (
            <button
              key={card.key}
              data-testid={`memory-card-${idx}`}
              onClick={() => flip(idx)}
              className="relative aspect-square"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative h-full w-full transition-transform duration-300"
                style={{ transformStyle: "preserve-3d", transform: isUp ? "rotateY(180deg)" : "none" }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="font-mono text-xl text-zinc-600">?</span>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-md border"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    borderColor: `${card.color}55`,
                    backgroundColor: `${card.color}18`,
                  }}
                >
                  <Icon weight="fill" size={30} style={{ color: card.color }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="font-display text-xl font-bold" style={{ color: accent }}>
            Felicitări! Scor {computeScore()}
          </p>
          <p className="text-sm text-zinc-500">{moves} mutări · {seconds} secunde</p>
        </div>
      )}
    </div>
  );
}
