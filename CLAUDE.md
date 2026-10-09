# Bluff Table

A multiplayer bluffing card game in a cardboard Western saloon:
- share a table by URL, add bots if you're short, and play cards face down claiming they're the table card; call **Liar!** on the player before you, and whoever is wrong spins their own six-chamber revolver. The last one alive wins, and their bounty goes up on the wanted posters;
- every piece of the scene is a flat ink drawing on cream card standing in layers in 3D, lit by an oil lamp, with a fixed camera; your pointer moves your head, and everyone sees it. The table is thrown away about 10 minutes after everyone leaves.

It's the fifth sibling of Felt Table (`../felt-table-jigsaw`), Scribble Table (`../drawing-game`), Telephone Table (`../telephone-table`) and Wild Table (`../wild-table`): same stack, same house rules, same way of working. It's its own project, copied from Wild Table (spec D3): fixes to shared parts get copied between the projects by hand. The full spec is in `.scratch/SPEC.md`. Read §0 "Decisions so far" before planning any feature: *Decided* items are settled, *Proposed* ones wait for the user's yes.

The look sketches are in `.scratch/look-sketches.html` (spec §8.7). The user reviewed them and liked all of it: **port their drawing code** (`person()`, the cast and lineup, the table scene, the head springs, the storyboard) rather than starting over.

## How we work
Setup commit first (M0, done), then each phase gets its own branch and PR (spec D27, §12). Stop for the user's review before each PR, and ask before merging.
1. **Web UI** (`feat/web-ui`), on local MobX stores against the demo table. **It starts with the polished cardboard saloon laid out for 6 seats, the heads (pointer, mirror, springs), the characters and their builder, and the lobby screen** (spec §9.1), reviewed together before the rest is built. Then rounds, Liar! and the reveal, the pull and death, ghosts, faces, the whisper and the double call, the end of a game, the rule book, the bots, phones, English and Ukrainian.
2. **Backend, and connecting the UI to it** (`feat/live-tables`): the rules on the server, no-peeking messages, head sync under real lag, bots at live tables. Reviewed and checked together.
3. **CI** (`feat/ci`). The workflow (`.github/workflows/ci.yml`) came with the setup commit and runs on every PR and push to `main`.
4. **Hosting** (`feat/hosting`): `pnpm play` and a `bluff-table` Cloudflare Tunnel on bluff.timnox.dev (spec D26). Neither the tunnel nor the DNS record exists yet.

**Verify end to end in the built-in browser.** Mute the game's sounds in test tabs (`bluffTable.sound.setOn(false)` from the console), and shut down any headless browser you launch. Check every screen on a phone held sideways (812 × 375); after changing the emulated size, reload the tab so the layout watcher sees it.

**Every feature explains itself on screen** (spec D22). People join by link mid-evening and never read docs; the user didn't know what a "table card" was. The table card is always on show, truthful cards are marked in your hand, buttons say what's at stake, every switch and twist has one line saying what it does where it's used, and the rule book is one click away. Check it in every UI review.

**Never use Liar's Bar's name, characters, art or mode names** (spec D2), in either language, in the UI, the rule book or the README. The call is **"Liar!"** in both languages, Ukrainian too (D21).

**Characters** (spec D7, §8.3): one hat, one kind of facial hair, at most one thin scar. Presets and random rolls never stack quirks (a blind eye, a plaster, a toothpick, a monocle, a gold tooth were "too much").

**UI:** nothing tilted, everything straight and consistent.

**Infrastructure in plain words:** the user is new to backends (and knows Docker and tooling), so explain servers, tunnels and networking plainly.

## Scribble Table's word lists stay secret
The user plays Scribble Table, so knowing its words would spoil it. Nothing in this game is secret from the user, and Bluff Table has no word lists, but one rule guards the sibling's: **never open, decode or print** `../drawing-game/modules/core-api/src/words/word-list.b64`, and never show a word from it anywhere.

## Layout
- `modules/web`: frontend. Vite + React 19 + TypeScript, Panda CSS, MobX, Ark UI, i18next (English and Ukrainian), and the 3D stage with React Three Fiber, drei and postprocessing (spec D4, D5, §10.2) in `features/room/table`. The cardboard saloon: every piece a canvas drawing on a plane (`cutout.tsx`), lit by the hanging lantern: the plank wall with the bar, the barkeep and the wanted posters, the swinging doors, five chairs across the table (`layout.ts` has every position), the people as busts (a body plane and a head plane redrawn when the look moves), the table on its legs, everyone's own revolver on the felt in front of them with their cylinder printed on their name tag (brass for the chambers still to pull; yours lies by your gun), and the switches that are on as tent cards either side of the deck. The camera frames it in what the lobby leaves free (its columns and the Deal ticket). The lobby (`features/room/lobby`) has "At the table", "Your character" (your mirror, the parts' arrows, colours, a roll), "The game", the Deal ticket, a line saying what to try, and a notice line (`stores/ui/notice.ts`).
  - **Heads** (spec §7.1): `stores/room/heads.ts` holds everyone's look on springs, outside MobX's reactions, and sends yours (15 a second at most). A look's `x` is a place round the table from the looker's seat; `engine/heads.ts` turns it into the same spot in every layout (between the same two people), and `table/layout.ts` (`facing`) into how the head is drawn. The mirror (`features/room/mirror.tsx`) is you, live; drag your head in it. The demo table's bots glance about and stare back (`services/demo-table/heads.ts`).
  - `src/art`: everything drawn by code (spec §8.6). The people are ported from the sketches' `person()` (`art/people`), the saloon is in `art/saloon`; each piece gets the cut-out edge from `cutOut()` in `art/canvas.ts`. The cards come with the rounds.
  - Per-frame data (the lamp's swing now; heads, springs and drags with the game) lives in plain objects read in `useFrame`, never through React state (spec §8.5).
  - **Lighter graphics** (`stores/graphics.ts`): no shadows, no glow, one pixel per pixel. `use-frame-rate.ts` turns it on by itself after two 5-second stretches under 35 fps in a row, ignoring pauses (a hidden tab, a resize), with a notice saying so; the switch is in the speaker's popover in the top bar.
  - **drei's `Html` renders in a React root of its own:** components inside it can't call `useRootStore()`. Hand them what they need as props.
  - **The design tokens** (`panda/tokens.ts`) are the saloon's: night planks, cream card stock and ink, brass, the red stamp, felt, and the six player colours; the art reads them through `art/palette.ts`. Rubik for text, Roboto Slab (covers Cyrillic) for display. Printed matter (cards, popovers, buttons) is cut out like the scene's pieces (`shadows.cutout`). The user called the UI "perfection": keep it.
  - **Capturing the stage while developing:** the drawing buffer is kept in dev, so the console can copy the WebGL canvas into an overlay for a close look. The built-in browser pane pauses rendering while it's hidden: take a screenshot first to wake it.
- `modules/core-api`: backend. Node + Express 5 + Colyseus 0.18 (live tables), one process on :2571. Today the room has the lobby's parts: members, the feed, bots' seats, the settings, the outbox, rate limits and the lifecycle.
- `modules/protocol`: the shared contract. Intent schemas, server events, error codes.
- `modules/engine`: pure game logic, shared by both apps. Today the seeded random generator, the settings and the bots' names; the rules, the bots and the simulations come in M1 (spec §10.3).
- `eslint.config.mjs` + `eslint-rules/`: the house lint rules for every module.
- `.scratch/`: spec, sketches and notes, ignored by git.

## Still in Wild Table, to bring over when the game needs it
M0 kept only what works without a game. These are in `../wild-table` (spec §10.1), ready to copy and adapt:
- engine: the turn's clock (`round/clock.ts`), the match record and stand-ins (`match.ts`: two timeouts in a row and a bot plays your seat), the simulations harness (`round/simulate.ts`), the bots' layers (`bots.ts`);
- core-api: `TableRoomClock` (`table-room/clock.ts`), bots playing their seats and standing in (`table-room/bots.ts`, with `standInWaitMs`), the no-peeking room test (`no-peeking.test.ts`) and the hand-moved clock in `test-table.ts`;
- web: the deck toy to shuffle and throw (`stores/table/deck.ts`, `body.ts`, `motion.ts`, `features/room/table/deck*.tsx`, `use-deck.ts`), the round's event queue and settling (`stores/table/round`), captions (`stores/room/game/captions.ts`), the turn's fuse along the rail, the camera shake (`use-shake.ts`), the rule book's scaffolding (`features/room/rule-book`: tabs, one continuous scroll, "Try it"), the figures' moods and gaze (`stores/room/game/moods.ts`), the card art service pattern (`services/card-art.ts`), and the Lucide icons dropped here (book, help, play, shuffle, smile, bell).

## Rules: read them before writing code
- **Before** creating or editing anything in `modules/web/**`, read `.claude/rules/web.md` and follow it.
- **Before** creating or editing anything in `modules/core-api/**`, read `.claude/rules/core-api.md` and follow it.
- These rules load automatically only once a matching file is opened. Read them first anyway, especially when creating new files.
- **Before calling a change done,** run `pnpm lint` and `pnpm typecheck` and fix what they report. Don't disable rules or add `eslint-disable` comments without asking.

**House lint rules** (enforced everywhere):
- **Size:** at most 40 lines per function (components included) and 300 lines per file. Blank lines and comments don't count.
- **Nested functions:** inside a function, only arrow functions. No nested `function` declarations or expressions, and no object or class methods.
- **Names:** camelCase for everything. PascalCase only for React components (which must render JSX) and for types and classes.
- **Return types:** required on every function that returns a value. Lambdas passed as arguments or JSX props are exempt.
- **Blank lines:** exactly one before and after every code block (functions, if, loops, switch, try, multi-line statements). `pnpm lint --fix` adds them.

## Commands
```bash
pnpm install
pnpm dev           # web on http://localhost:5177 + core-api on :2571 (Vite forwards /api, and /live for tables)
pnpm lint          # add --fix to auto-fix spacing
pnpm typecheck
pnpm test          # engine + core-api; one module: pnpm --filter @bluff-table/core-api test
pnpm demo          # web only, against the demo table (no server): for UI work
pnpm build         # production web build (CI runs lint, typecheck, test, build on every PR and push to main)
pnpm play          # build + serve at https://bluff.timnox.dev from this PC through the bluff-table Cloudflare Tunnel (from M4)
```

## Gotchas
- **Ports are 5177, 2571 and 4177** (web, core-api, preview), one above Wild Table's (5176, 2570, 4176), so all five games can run at once. All are `strictPort`: a taken port fails loudly instead of moving. The room tests use 2594 (the lobby) and, with the game, 2595 (no peeking); the siblings' use 2591–2593.
- **Never stop the siblings' processes.** Any of them may be running `pnpm play` for a game night. When a port is busy, check which project owns the process before touching it.
- **Never start `pnpm play` for the user.** Give them the command; they start it themselves.
- **No payment card on any service.** Hosting is this PC plus a free Cloudflare Tunnel, as in the siblings.
- **TypeScript is pinned to 6.0.** typescript-eslint doesn't support TypeScript 7 yet. Don't upgrade it.
- **pnpm workspaces:** the packages are listed in `pnpm-workspace.yaml`. Add a dependency with `pnpm --filter @bluff-table/<module> add <pkg>`.
- **pnpm's release-age guard:** pnpm refuses versions published in the last day. Pick the previous version instead of adding exceptions.
- **No shared Colyseus state, and no peeking** (spec D24, §10.4): with the game, the server sends each living player only their own hand, ghosts every hand, the whisper only to the whispered player, and never where a bullet is. After joining or reconnecting, the browser asks for everything with `sync`.
- **Hosting is `pnpm play`, not a cloud host** (free, no payment card), as in the siblings. It runs `vite preview` on `127.0.0.1:4177`, which reuses the dev `/api` + `/live` proxy and only accepts the bluff.timnox.dev host, plus core-api and the `bluff-table` Cloudflare Tunnel (`play-tunnel.mjs`). The tunnel and the DNS record get created in M4. Stop `pnpm dev` first, since both need port 2571.
- **The demo table** (spec D28): `services/demo-table` plays the server's part in the browser, with sample players who sit down and say hello. `pnpm dev` plays at live tables on core-api (`services/live-table`, behind the same `TableClientService`); `pnpm demo` plays at the demo table. The top bar's **Demo** buttons add or remove a sample player.
- **Live tables live in core-api's memory:** `tsx watch` restarts core-api when you save a file there, and every table is gone. Open a new one. To play a live table alone, open its link in several tabs: each tab is its own person (its seat is kept in sessionStorage, so a reload gets it back).
- **A dropped connection** keeps its seat for 20 seconds (`limits.ts`).
- **The protocol version** (`tableProtocolVersion` in `protocol/src/table-messages.ts`) goes up whenever an intent or an event changes shape: an older tab is asked to reload.
- **Phones play in landscape only** (spec D29). The user's group is 3–6 coworkers on a voice call, some on phones: check every screen at phone size, held sideways.
- **Phones held sideways are "compact"** (`ui.layout`, under 900 px wide or 540 px tall): the lobby's cards share one column on the right, the dock stands up as a rail on the left, the top bar drops the table's link (the browser shows it, and Share copies it).
- **The camera never moves on its own** (spec D5): `table/use-camera.ts` frames the table in what the lobby's cards leave free. Only scripted moments move it (a push-in on the pull, a jolt on a bang), from M1.
- **Sounds** are CC0 recordings from Freesound, credited in `modules/web/src/assets/sounds/credits.md` (no music, spec D30). Today the chime, the cards (slap, deal, riffle), the fuse and the lamp's creak, kept from Wild Table for the saloon; new ones (the cylinder, the hammer, the bang, the doors…) come from Freesound too, cut to short mono 16-bit 48 kHz clips. Never synthesize sounds. Stores play them through `SoundsService.play` (and `loop` for the fuse).
- **Dev handle:** in development the root store is `window.bluffTable`, for checking state from the console or a test script, e.g. `bluffTable.room.game.settings.turnSeconds` or `bluffTable.room.presence.count`.
