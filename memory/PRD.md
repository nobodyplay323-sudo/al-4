# PRD — Arcade (Jocuri Simple)

## Problem Statement
"fa un site cu jocuri simple" — a website with simple browser games, in Romanian.

## User Choices
- Games: Tic-Tac-Toe ("X și 0"), Snake, Memory ("Memorie"), 2048
- Global leaderboard with saved scores
- No login / accounts (nickname only)
- Modern minimalist dark theme
- Romanian language UI

## Architecture
- Frontend: React (CRA + craco), Tailwind, shadcn/ui, framer-motion, @phosphor-icons/react, sonner. Routing via react-router (/ and /joc/:slug).
- Backend: FastAPI, all routes under /api. MongoDB via motor.
- Score submission: POST /api/scores; leaderboard: GET /api/scores/{game}; home stats: GET /api/stats.

## User Personas
- Casual player who wants a quick game and to chase a high score without signing up.

## Core Requirements (static)
- 4 playable games fully client-side.
- Global leaderboard per game (top 10, sorted by score desc).
- Nickname stored in localStorage, prompted on game over when score > 0.

## Implemented (2026-08-09)
- Home page with bento game cards + live records/stats.
- Games: X și 0 (beatable AI, win-streak scoring), Snake (keyboard + on-screen dpad), Memorie (4x4 pairs, move/time scoring), 2048 (keyboard + swipe).
- Global leaderboard with highlight of freshly submitted score + toast feedback.
- Dark minimalist theme (Outfit/DM Sans/JetBrains Mono), grain overlay, entrance animations.
- Backend endpoints for scores + stats with validation. Tested 100% backend + frontend.

## Backlog (P1/P2)
- P1: Daily vs All-time leaderboard tabs.
- P2: Dedup leaderboard so one nickname holds only its best score.
- P2: Difficulty selector for Snake / Tic-Tac-Toe.
- P2: Sound effects / mute toggle.

## Next Tasks
- Await user feedback after first review.
