import { Link, useLocation } from "react-router-dom";
import { GameController } from "@phosphor-icons/react";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <Link
          to="/"
          data-testid="nav-logo"
          className="group flex items-center gap-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 transition-colors duration-200 group-hover:bg-cyan-500/20">
            <GameController weight="fill" size={22} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-zinc-50">
            ARCADE<span className="text-cyan-400">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-zinc-400">
          <Link
            to="/"
            data-testid="nav-home"
            className={`rounded px-3 py-2 transition-colors duration-200 hover:text-cyan-400 ${
              pathname === "/" ? "text-zinc-50" : ""
            }`}
          >
            Acasă
          </Link>
          <a
            href="/#jocuri"
            data-testid="nav-games"
            className="rounded px-3 py-2 transition-colors duration-200 hover:text-cyan-400"
          >
            Jocuri
          </a>
        </nav>
      </div>
    </header>
  );
}
