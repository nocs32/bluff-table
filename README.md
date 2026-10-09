# Bluff Table

[![CI](https://github.com/nocs32/bluff-table/actions/workflows/ci.yml/badge.svg)](https://github.com/nocs32/bluff-table/actions/workflows/ci.yml)

A bluffing card game you play with friends in the browser, in a cardboard Western saloon.

- **The table card:** each round a King, a Queen or an Ace is drawn, and everyone gets 5 cards.
- **Bluff:** on your turn, put 1 to 3 cards face down and claim they're all the table card, whether they are or not. Jokers count as the table card.
- **Liar!** Don't believe the player before you? Call it. The cards flip: if any was a lie, the liar pulls the trigger. If they were all true, you do.
- **The revolver:** everyone has their own, six chambers and one bullet, never re-spun, so every pull you survive makes the next one more likely to be the last. The last player alive wins, and their bounty goes up on the wanted posters.
- **Two twists to switch on:** the barkeep's whisper (one player learns whether the house is crooked, and then must lie) and the double call (once a game, Liar! twice over).
- **Heads that move:** where your pointer goes, your head turns, so everyone sees you stare, nod and shake. On a phone, drag your own head in the mirror.
- **No accounts, no leftovers:** share the table link to play, in English or Ukrainian, on a computer or a phone held sideways. Bots fill empty seats. A table disappears about 10 minutes after the last person leaves.

It's a sibling of [Felt Table](https://github.com/nocs32/felt-table-jigsaw), the multiplayer jigsaw, [Scribble Table](https://github.com/nocs32/scribble-table), the drawing-and-guessing game, [Telephone Table](https://github.com/nocs32/telephone-table), the telephone drawing game, and [Wild Table](https://github.com/nocs32/wild-table), the card game on a 3D table, and shares their stack and rules.

> **Status:** whole games play at live tables and at the demo table. The saloon, the characters and their builder, the lobby, the rounds, Liar! and the reveal, the revolver's tense pull with its BAM!, ghosts, faces, the whisper and the double call, the end of a game and the rule book are built (M1); the server runs the rules and the pace, keeps every hand private, plays bots' seats and stands in for people who leave or run out of time (M2). Every pull request and every push to `main` runs CI (M3); hosting on bluff.timnox.dev comes next (M4).

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite, Panda CSS, MobX, Ark UI, i18next, and React Three Fiber, drei and postprocessing for the 3D stage |
| API (`modules/core-api`) | Node.js, Express 5 and Colyseus 0.18 (run with `tsx`) |
| Shared | `modules/protocol` (the contract between the two) and `modules/engine` (pure game logic) |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server runs the game. It keeps the deck, the hands and the revolvers, and sends each person only what they may see: your own cards, never anyone else's (only ghosts see every hand), and never where a bullet is. Tables live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and pnpm 11+.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

| App | URL |
|---|---|
| Web | http://localhost:5177 |
| API | http://localhost:2571 — the web dev server forwards `/api/*`, and `/live` for tables, to it |

Open the web URL to get a table, then share its link: everyone who opens it sits down at the same table. To try it alone, open the link in a few browser tabs.

`pnpm demo` runs the web app alone against a demo table in the browser, with no API: three sample players sit down with you and a fourth joins a little later. The **Demo** buttons in the top bar add or remove a sample player.

Saving a file in `modules/core-api` restarts the API, which clears every table: open a new one afterwards.

The ports sit one above Wild Table's (5176 and 2570), and above Telephone, Scribble and Felt Table's, so all five games can run at the same time.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm demo` | Runs the web app alone against the demo table (sample players, no server), for working on the UI |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm test` | Runs the engine and core-api tests; one module: `pnpm --filter @bluff-table/core-api test` |
| `pnpm build` | Builds the web app for production |
| `pnpm play` | Builds, then serves the game at https://bluff.timnox.dev from this computer (set up in M4, see below) |

**CI:** GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on every pull request and every push to `main`.

## Play with friends

There's no cloud server: `pnpm play` will run Bluff Table on your own computer, and a free [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) puts it on **https://bluff.timnox.dev**. A tunnel is a connection your computer opens out to Cloudflare, so no router ports are opened, and your home address stays hidden behind Cloudflare.

```bash
pnpm play
```

- It builds the web app, then starts core-api, the production web server (`vite preview` on `127.0.0.1:4177`) and the tunnel. Ctrl+C stops all three.
- Stop `pnpm dev` first: both use core-api's port 2571.
- It runs alongside the siblings' `pnpm play`: each game has its own ports and its own tunnel.
- Keep the computer awake while you play. Closing the terminal or restarting wipes the tables, like any server restart.
- To ship a change, stop `pnpm play` and start it again. It rebuilds from what's checked out.

**One-time setup** (M4): the `bluff-table` tunnel and its address don't exist yet. With `cloudflared` installed (`winget install Cloudflare.cloudflared`, then a new terminal so it's on PATH), it takes two commands:

```bash
cloudflared tunnel create bluff-table
```

```bash
cloudflared tunnel route dns bluff-table bluff.timnox.dev
```

`cloudflared tunnel login` is needed only once per computer, and Felt Table's setup already did it on this PC. The tunnel's credentials live in `~/.cloudflared/`, outside the repo. Keep them private.

## Project layout

```
modules/
├─ web/          React frontend
├─ core-api/     Express + Colyseus backend
├─ protocol/     shared contract: messages, events, error codes
└─ engine/       pure game logic, shared by both apps
eslint.config.mjs   house lint rules
eslint-rules/       custom lint rules used by the config
```

## Conventions

**Code style** (enforced by `pnpm lint`):
- **Size:** at most 40 lines per function (components included) and 300 lines per file.
- **Nested functions:** inside a function, only arrow functions.
- **Names:** camelCase. PascalCase only for React components and for types and classes.
- **Return types:** every function that returns a value declares its return type.
- **Blank lines:** one before and after every code block.

**Web**
- **Component names follow their parent:** `Room` → `RoomLobby` → `RoomLobbyGame`.
- **One component per `.tsx` file.** Components only render.
  - Logic lives in custom hooks and small MobX stores, which are modelled as state machines.
  - Styles live in `styled-components.ts` files written with Panda CSS.
- **Everything is drawn by code:** the people, the cards, the revolver and the saloon. No downloaded art.
- **All UI text is translated** into English and Ukrainian. What players write is shown as typed, in whatever language they wrote it.

**API**
- **Thin handlers:** they validate, call one service, and respond.
- **Logic** lives in small state-machine classes.
- **The server decides:** browsers send intents (play these cards, call Liar!, pull the trigger) and never results.

**Sounds** are CC0 recordings from [Freesound](https://freesound.org), credited in `modules/web/src/assets/sounds/credits.md`. No music.

**TypeScript** stays on **6.0** until typescript-eslint supports TypeScript 7.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `CORE_API_PORT` | core-api | `2571` |
