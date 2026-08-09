import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, ArrowClockwise, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "@phosphor-icons/react";

const SIZE = 17;
const SPEED = 110;

function randCell(snake) {
  let c;
  do {
    c = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
  } while (snake.some((s) => s.x === c.x && s.y === c.y));
  return c;
}

export default function SnakeGame({ accent, onGameOver }) {
  const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
  const [food, setFood] = useState({ x: 12, y: 8 });
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const dirRef = useRef({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  snakeRef.current = snake;
  foodRef.current = food;

  const setDir = useCallback((nd) => {
    const cur = dirRef.current;
    if (cur.x + nd.x === 0 && cur.y + nd.y === 0) return; // no reverse
    nextDirRef.current = nd;
  }, []);

  const start = () => {
    const s = [{ x: 8, y: 8 }];
    setSnake(s);
    setFood(randCell(s));
    setScore(0);
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    setOver(false);
    setRunning(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      };
      if (map[e.key]) {
        e.preventDefault();
        setDir(map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDir]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      dirRef.current = nextDirRef.current;
      const d = dirRef.current;
      const cur = snakeRef.current;
      const head = { x: cur[0].x + d.x, y: cur[0].y + d.y };

      if (
        head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE ||
        cur.some((s) => s.x === head.x && s.y === head.y)
      ) {
        setRunning(false);
        setOver(true);
        return;
      }

      const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
      const newSnake = [head, ...cur];
      if (!ate) newSnake.pop();
      else {
        setScore((sc) => sc + 10);
        setFood(randCell(newSnake));
      }
      setSnake(newSnake);
    }, SPEED);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (over && score > 0) onGameOver(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#0d0d0d] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Puncte
        </div>
        <div className="font-mono text-2xl font-bold" style={{ color: accent }} data-testid="snake-score">
          {score}
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-md">
        <div
          className="grid h-full w-full overflow-hidden rounded-md border border-zinc-800 bg-black"
          style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gridTemplateRows: `repeat(${SIZE}, 1fr)` }}
          data-testid="snake-board"
        >
          {Array.from({ length: SIZE * SIZE }).map((_, idx) => {
            const x = idx % SIZE;
            const y = Math.floor(idx / SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;
            return (
              <div
                key={idx}
                className="rounded-[2px]"
                style={{
                  backgroundColor: isHead
                    ? accent
                    : isBody
                    ? "#15803d"
                    : isFood
                    ? "#ef4444"
                    : "transparent",
                  margin: "1px",
                }}
              />
            );
          })}
        </div>

        {(!running && !over) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md bg-black/80 backdrop-blur-sm">
            <p className="text-sm text-zinc-400">Folosește săgețile / WASD sau butoanele</p>
            <Button data-testid="snake-start" onClick={start} className="gap-2 bg-cyan-500 font-semibold text-black hover:bg-cyan-400">
              <Play weight="fill" size={16} /> Începe
            </Button>
          </div>
        )}
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md bg-black/85 backdrop-blur-sm">
            <p className="font-display text-2xl font-bold text-red-400">Game Over</p>
            <p className="font-mono text-lg text-zinc-200">{score} puncte</p>
            <Button data-testid="snake-restart" onClick={start} className="gap-2 bg-cyan-500 font-semibold text-black hover:bg-cyan-400">
              <ArrowClockwise weight="bold" size={16} /> Din nou
            </Button>
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 grid w-40 grid-cols-3 gap-2 sm:hidden">
        <div />
        <DPad testid="snake-up" onClick={() => setDir({ x: 0, y: -1 })}><ArrowUp weight="bold" /></DPad>
        <div />
        <DPad testid="snake-left" onClick={() => setDir({ x: -1, y: 0 })}><ArrowLeft weight="bold" /></DPad>
        <DPad testid="snake-down" onClick={() => setDir({ x: 0, y: 1 })}><ArrowDown weight="bold" /></DPad>
        <DPad testid="snake-right" onClick={() => setDir({ x: 1, y: 0 })}><ArrowRight weight="bold" /></DPad>
      </div>
    </div>
  );
}

function DPad({ children, onClick, testid }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="flex aspect-square items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 transition-colors duration-150 active:bg-zinc-700"
    >
      {children}
    </button>
  );
}
