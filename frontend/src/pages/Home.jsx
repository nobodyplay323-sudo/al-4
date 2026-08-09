import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GAMES } from "@/gamesConfig";
import { getStats } from "@/lib/api";
import { ArrowRight, Lightning } from "@phosphor-icons/react";

export default function Home() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-10">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="max-w-3xl fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-cyan-400">
            <Lightning weight="fill" size={13} />
            Joacă direct în browser
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-zinc-50 sm:text-6xl lg:text-7xl">
            Jocuri simple.
            <br />
            <span className="text-cyan-400">Scoruri reale.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Patru clasice reimaginate. Nicio instalare, niciun cont. Joacă,
            bate recordul și urcă în clasamentul global.
          </p>
        </div>
      </section>

      <section id="jocuri" className="scroll-mt-24">
        <div className="mb-8 flex items-end justify-between border-b border-zinc-800 pb-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-100">
            Alege un joc
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
            {GAMES.length} jocuri
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((g, i) => {
            const s = stats[g.id];
            return (
              <Link
                key={g.id}
                to={`/joc/${g.slug}`}
                data-testid={`game-card-${g.id}`}
                className="group fade-up relative flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-800 bg-[#0d0d0d] p-6 transition-transform duration-200 ease-out hover:-translate-y-1"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
                  style={{ backgroundColor: g.accent }}
                />
                <div>
                  <span
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg border transition-colors duration-200"
                    style={{
                      color: g.accent,
                      borderColor: `${g.accent}40`,
                      backgroundColor: `${g.accent}12`,
                    }}
                  >
                    <g.Icon weight="duotone" size={30} />
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-zinc-50">
                    {g.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    {g.tagline}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-600">
                    {s && s.top_score > 0 ? (
                      <>
                        Record{" "}
                        <span className="text-zinc-300">
                          {s.top_score.toLocaleString("ro-RO")}
                        </span>
                      </>
                    ) : (
                      "Fără record"
                    )}
                  </div>
                  <span
                    className="flex items-center gap-1 text-sm font-semibold transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: g.accent }}
                  >
                    Joacă <ArrowRight weight="bold" size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-24 border-t border-zinc-800 pt-8 text-center font-mono text-xs uppercase tracking-widest text-zinc-700">
        Arcade — construit pentru distracție
      </footer>
    </main>
  );
}
