import { GameController, Waves, Cards, GridFour } from "@phosphor-icons/react";

export const GAMES = [
  {
    id: "tic-tac-toe",
    slug: "x-si-0",
    name: "X și 0",
    tagline: "Învinge inteligența artificială",
    scoreLabel: "Serie de victorii",
    accent: "#06B6D4",
    Icon: GridFour,
  },
  {
    id: "snake",
    slug: "snake",
    name: "Snake",
    tagline: "Mănâncă și crește fără să te lovești",
    scoreLabel: "Puncte",
    accent: "#22C55E",
    Icon: Waves,
  },
  {
    id: "memory",
    slug: "memory",
    name: "Memorie",
    tagline: "Găsește toate perechile",
    scoreLabel: "Scor",
    accent: "#EAB308",
    Icon: Cards,
  },
  {
    id: "2048",
    slug: "2048",
    name: "2048",
    tagline: "Combină plăcile până la 2048",
    scoreLabel: "Scor",
    accent: "#A855F7",
    Icon: GameController,
  },
];

export function getGameBySlug(slug) {
  return GAMES.find((g) => g.slug === slug);
}
