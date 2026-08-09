import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Circle, ArrowClockwise } from "@phosphor-icons/react";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

function minimax(b, isAI) {
  const w = winner(b);
  if (w === "O") return { score: 1 };
  if (w === "X") return { score: -1 };
  if (b.every(Boolean)) return { score: 0 };

  let best = isAI ? { score: -Infinity } : { score: Infinity };
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = isAI ? "O" : "X";
      const res = minimax(b, !isAI);
      b[i] = null;
      if (isAI ? res.score > best.score : res.score < best.score) {
        best = { score: res.score, move: i };
      }
    }
  }
  return best;
}

export default function TicTacToe({ accent, onGameOver }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | won | lost | draw
  const [locked, setLocked] = useState(false);

  const win = winner(board);

  const finishRun = useCallback(
    (finalStreak) => {
      if (finalStreak > 0) onGameOver(finalStreak, { streak: finalStreak });
    },
    [onGameOver]
  );

  const newRound = () => {
    setBoard(Array(9).fill(null));
    setStatus("playing");
    setLocked(false);
  };

  const resetAll = () => {
    setStreak(0);
    newRound();
  };

  const play = (i) => {
    if (locked || board[i] || status !== "playing") return;
    const b = board.slice();
    b[i] = "X";

    if (winner(b) === "X") {
      const ns = streak + 1;
      setBoard(b);
      setStreak(ns);
      setStatus("won");
      return;
    }
    if (b.every(Boolean)) {
      setBoard(b);
      setStatus("draw");
      finishRun(streak);
      return;
    }

    setLocked(true);
    const empties = b.map((v, idx) => (v ? null : idx)).filter((v) => v !== null);
    // Beatable AI: plays optimally ~70% of the time, otherwise a random move.
    let move;
    if (Math.random() < 0.7) {
      move = minimax(b.slice(), true).move;
    } else {
      move = empties[Math.floor(Math.random() * empties.length)];
    }
    setTimeout(() => {
      const nb = b.slice();
      if (move != null) nb[move] = "O";
      setBoard(nb);
      if (winner(nb) === "O") {
        setStatus("lost");
        finishRun(streak);
      } else if (nb.every(Boolean)) {
        setStatus("draw");
        finishRun(streak);
      } else {
        setLocked(false);
      }
    }, 350);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#0d0d0d] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Serie de victorii
        </div>
        <div
          className="font-mono text-2xl font-bold"
          style={{ color: accent }}
          data-testid="ttt-streak"
        >
          {streak}
        </div>
      </div>

      <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            data-testid={`ttt-cell-${i}`}
            onClick={() => play(i)}
            className="flex aspect-square items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 transition-colors duration-200 hover:border-zinc-600 disabled:cursor-not-allowed"
            disabled={!!cell || status !== "playing" || locked}
          >
            {cell === "X" && (
              <X weight="bold" size={44} className="pop-in text-cyan-400" />
            )}
            {cell === "O" && (
              <Circle weight="bold" size={38} className="pop-in text-zinc-400" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {status === "won" && (
          <>
            <p className="font-display text-lg font-bold text-green-400">
              Ai câștigat! Seria continuă.
            </p>
            <Button
              data-testid="ttt-next-round"
              onClick={newRound}
              className="bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
            >
              Runda următoare
            </Button>
          </>
        )}
        {status === "lost" && (
          <p className="font-display text-lg font-bold text-red-400">
            Ai pierdut! Seria s-a oprit la {streak}.
          </p>
        )}
        {status === "draw" && (
          <p className="font-display text-lg font-bold text-zinc-300">
            Egalitate! Seria s-a oprit la {streak}.
          </p>
        )}
        {(status === "lost" || status === "draw") && (
          <Button
            data-testid="ttt-restart"
            onClick={resetAll}
            variant="outline"
            className="gap-2 border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800"
          >
            <ArrowClockwise weight="bold" size={16} /> Joc nou
          </Button>
        )}
        {status === "playing" && (
          <p className="text-sm text-zinc-500">
            {win ? "" : "Tu ești X. Bate calculatorul!"}
          </p>
        )}
      </div>
    </div>
  );
}
