import { useParams, Link } from "react-router-dom";
import { useRef, useState } from "react";
import { getGameBySlug } from "@/gamesConfig";
import { submitScore, getNickname, saveNickname } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "@phosphor-icons/react";
import Leaderboard from "@/components/Leaderboard";
import NicknameDialog from "@/components/NicknameDialog";
import TicTacToe from "@/pages/games/TicTacToe";
import SnakeGame from "@/pages/games/SnakeGame";
import MemoryGame from "@/pages/games/MemoryGame";
import Game2048 from "@/pages/games/Game2048";

const REGISTRY = {
  "tic-tac-toe": TicTacToe,
  snake: SnakeGame,
  memory: MemoryGame,
  "2048": Game2048,
};

export default function GamePage() {
  const { slug } = useParams();
  const game = getGameBySlug(slug);
  const boardRef = useRef(null);
  const [dialog, setDialog] = useState({ open: false, score: 0, meta: null });
  const [highlightId, setHighlightId] = useState(null);

  if (!game) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 text-center md:px-10">
        <h1 className="font-display text-3xl font-bold text-zinc-50">
          Joc negăsit
        </h1>
        <Link to="/" className="mt-4 inline-block text-cyan-400 hover:underline">
          Înapoi acasă
        </Link>
      </div>
    );
  }

  const GameComponent = REGISTRY[game.id];

  const requestSubmit = (score, meta = null) => {
    if (score <= 0) return;
    setDialog({ open: true, score, meta });
  };

  const handleSubmit = async (nickname) => {
    saveNickname(nickname);
    try {
      const saved = await submitScore({
        game: game.id,
        nickname,
        score: dialog.score,
        meta: dialog.meta,
      });
      setHighlightId(saved.id);
      toast.success("Scor salvat în clasament!");
      boardRef.current?.reload();
    } catch (e) {
      toast.error("Nu am putut salva scorul.");
    }
    setDialog((d) => ({ ...d, open: false }));
  };

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-10">
      <Link
        to="/"
        data-testid="back-home"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 transition-colors duration-200 hover:text-cyan-400"
      >
        <ArrowLeft weight="bold" size={14} /> Toate jocurile
      </Link>

      <div className="mb-8 flex items-center gap-4">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-lg border"
          style={{
            color: game.accent,
            borderColor: `${game.accent}40`,
            backgroundColor: `${game.accent}12`,
          }}
        >
          <game.Icon weight="duotone" size={30} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-zinc-50">
            {game.name}
          </h1>
          <p className="text-sm text-zinc-500">{game.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <GameComponent accent={game.accent} onGameOver={requestSubmit} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Leaderboard
            ref={boardRef}
            game={game.id}
            scoreLabel={game.scoreLabel}
            accent={game.accent}
            highlightId={highlightId}
          />
        </div>
      </div>

      <NicknameDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        score={dialog.score}
        scoreLabel={game.scoreLabel}
        defaultName={getNickname()}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
