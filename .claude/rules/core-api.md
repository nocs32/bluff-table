---
paths:
  - "modules/core-api/**"
---

# Core API rules (`modules/core-api`)

Node + Express 5 for HTTP, and Colyseus 0.18 for the live multiplayer rooms. These rules come on top of the lint rules in `eslint.config.mjs` and follow the same ideas as the web rules: thin edges, small named units, and logic in small state machines.

**Colyseus specifics:**
- One process serves both: `new Server({ transport: new WebSocketTransport(), express: (app) => … })` in `src/index.ts`. Colyseus answers `/matchmake/*` and the WebSocket upgrades; everything else falls through to Express. No Redis (one process).
- Room classes extend Colyseus `Room<{ client }>`. Class fields like `maxClients` and `autoDispose` are fine (Colyseus re-installs its accessors in `__init`).
- **No Schema state, and no peeking** (spec D24, §10.4). The room sends each person their own messages, through `TableRoomOutbox` (the shapes are `TableEvents` in the protocol): `view` (the shared table plus that person's own `secret`: their hand, a ghost's sight, their whisper; sent when it changed), `play` (what just happened, as everyone may see it: a play is a count), `feed`, and through the heads `look` and `face`; `reaction` and `error` go straight out. Messages arrive in order, which state patches don't promise. A browser gets nothing until it sends `sync`.
- **Nobody sees another hand,** not even in pieces: the living get a card count, and a card's face only once a Liar! flips it. Nobody but the whispered player learns the house before the round ends, and nobody is ever sent where a bullet is. `no-peeking.test.ts` records every message each player and a spectator get and checks all three (spec §11).
- Message handlers follow rule 3 through the room's `#on(type, handle)`: valibot schema from the protocol, then the rate limit, then one call. Don't pass a schema to Colyseus's own `onMessage`/`validate`: a failed check there disconnects the sender. Refusals go back as an `error` event (`{ code }`).
- Join options are checked in `onJoin`; a refused join throws `ServerError` with the typed code as its message.
- Tests: unit tests per part (`*.test.ts` next to it) and room tests through a real server with `@colyseus/testing`: the lobby (`index.test.ts`, port 2594), and with the game a round with the no-peeking check (`no-peeking.test.ts`, port 2595). Run `pnpm --filter @bluff-table/core-api test`.

## 1. Names follow the owner
A unit that belongs to another starts with its owner's name:
- `TableRoom` → `TableRoomGame` → `TableRoomGameClock`
- `TableRoom` → `TableRoomHeads` → `TableRoomHeadsBots`

Shared building blocks are named for what they are: `logger`, `limits`.

## 2. One unit per file
- One class, one router or one handler group per file.
- Files and folders are kebab-case, named after what they hold: `table-room-cards.ts` (`TableRoomCards`), `health-router.ts` (`healthRouter`). The lint rule `local/kebab-case-filenames` enforces it.
- A unit with sub-units becomes a folder: `index.ts` holds the main unit, and each sub-unit gets a short-named file next to it (`table-room/index.ts`, `table-room/cards.ts`).

## 3. Edges are thin
This is the backend version of "components only render". Express route handlers and live message handlers do exactly three things:
1. Validate the input with the shared schema.
2. Call **one** method on a service or room class.
3. Send the result, or a typed error.

No game rules, storage or calculations inside handlers.

## 4. Logic lives in small state-machine classes
- **Composed rooms** (spec §10.3). A room is built from small classes, each owning one concern: the game (`TableRoomGame`, with its seats `TableRoomGameSeats`, its match and pace `TableRoomGameMatch`, and its clock `TableRoomGameClock`), looks and faces with their throttled relay (`TableRoomHeads`, with the bots' heads in `TableRoomHeadsBots`), the bots (`TableRoomBots`), members, feed/chat, lifecycle (the 10-minute empty timer), rate limits, the outbox. `TableRoom` only wires them together. The cards, the revolvers and the whisper are all in the engine's one game state, so they need no room classes of their own.
- **Explicit states.** Each class has a fixed set of states:
  - room lifecycle: `'active' | 'emptyGrace' | 'closed'`;
  - the game: `lobby → round → over → (Play again) round | lobby`; within a round, the match's steps `turn → reveal → pull → pulling → roundOver → next deal`.
- **Transitions** are methods named after events: `join`, `leave`, `deal`, `play`, `call`, `pull`, `expire`. An invalid transition is rejected with a typed error code.
- **Pure game logic** (the decks and dealing, what's truthful, legal moves, the forced call, who pulls, the whisper's crook, the revolver, who starts next, the bots' choices) lives in the shared engine module and has no I/O.
- **Tests.** Each state-machine class has unit tests for its transitions, including the rejected ones.

## 5. The server decides; clients only ask
- **Intents, not results.** Clients send intents such as `play` or `call`, and the server works out the result. Never accept a finished result from a client, like "I survived the pull" or "my play was true".
- **Validate everything.** Check every message and request body against its schema:
  - reject unknown fields;
  - clamp numbers to sane ranges;
  - check the sender is allowed (only the player whose turn it is plays or calls; a card must be in the sender's own hand; only whoever pulls presses the trigger).
- **Limits in one place.** Rate limits and size caps are constants in a single `limits.ts` (spec §10.5).

## 6. Every piece of memory has an owner
- **No database.** Tables, decks, hands and revolvers live in memory.
- **Cleanup.** Every `Map`, timer and interval belongs to a class that clears it in `dispose()`.
- **No module-level mutable state**, except the composition root (`src/index.ts`), which creates the long-lived instances.

## 7. Config, errors and logs
- **Config:** environment variables are read and validated once in `src/config.ts`. Nothing else reads `process.env`.
- **Errors:** use typed error codes shared with the web app, like `'WRONG_PHASE'` or `'RATE_LIMITED'`. Never use raw strings.
- **Logs:** log through `src/logger.ts` with context such as `roomId` and `sessionId`. No `console.log` anywhere else. Never log a hand's cards, the house, or where a bullet is.

## 8. One shared contract
- Intent schemas, server events, error codes and name rules live in `@bluff-table/protocol`. Both apps import them. Never redefine them in core-api.
- Changing an intent's or an event's shape bumps `tableProtocolVersion`.

## Folder example
```
src/
├─ index.ts                 composition root: config, logger, Express, Colyseus, listen
├─ config.ts
├─ logger.ts
├─ limits.ts
├─ errors/                  ApiErrorException, errorMiddleware, notFoundMiddleware
├─ health/index.ts          healthRouter (/api/health)
└─ table-room/
   ├─ index.ts              TableRoom: wires the parts to Colyseus
   ├─ members.ts            TableRoomMembers (+ member-names.ts: the names it hands out)
   ├─ feed.ts               TableRoomFeed
   ├─ game/                 TableRoomGame: phases and settings (index.ts), seats.ts, match.ts (the pace), clock.ts
   ├─ heads/                TableRoomHeads: the look relay (index.ts), bots.ts (bots' heads)
   ├─ bots.ts               TableRoomBots: lobby seats, playing them, standing in
   ├─ view.ts               the shared view (each person's secret is added in the outbox)
   ├─ outbox.ts             TableRoomOutbox (what each person is sent, and when)
   ├─ rate-limits.ts        TableRoomRateLimits
   ├─ lifecycle.ts          TableRoomLifecycle
   ├─ error.ts              TableRoomError (a typed refusal)
   └─ *.test.ts             (test-table.ts: the parts on a hand-moved clock; test-room.ts: a real room;
                             index.test.ts the lobby on 2594, no-peeking.test.ts games on 2595)
```
