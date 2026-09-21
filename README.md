# Kubo's Classroom

A Thai/English learning website for explaining AI agents and coordinated sub-agents, with Kubo as the central orchestrator and an office demonstration.

## Live demo

[Open Kubo's Classroom](https://kubo-classroom.vercel.app/)

The published classroom includes the Cosmic Guesthouse and [Live Workshop](https://kubo-classroom.vercel.app/live/), with the original eight-station room.

## Project direction

- Explain ideas visually, with short text suitable for beginners.
- Keep Thai and English experiences consistent.
- Use character actions and demonstrations to support the lesson.
- Preserve the office demonstration when changing the course.

## Version status

`website/` now contains the Cosmic Guesthouse publication source. `live/` contains the integrated workshop UI and uses the original room and animations from `app/`. `npm run build:website` produces the complete static Vercel site, preserving the Guesthouse at `/` and `/guesthouse/` and adding `/live/`. The older presentation source remains in `app/`.

## Run locally

Requirements: Git, Node.js **22.13.0 or newer**, and npm. This repository is public.

```sh
git clone https://github.com/Chosaque/kubo-classroom.git
cd kubo-classroom
npm ci
npm run dev
```

Open the local URL printed in the terminal. A localhost or `127.0.0.1` link only works on the computer running the development server.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vinext development server |
| `npm run build` | Build the application |
| `npm run lint` | Run Oxlint |
| `npm run format` | Format source files with Oxfmt; this modifies files |
| `npm run start` | Preview the built worker locally using Wrangler |

Run the build before `npm run start`. These commands reflect the repository's package scripts; they are not a claim that every check currently passes on every machine. There is no `npm test` script currently defined.

## Code layout

- `app/` — application routes and classroom interface.
- `components/ui/` — reusable interface components.
- `hooks/` — React hooks.
- `lib/` — shared utilities.
- `public/` — static assets, including models where present.
- `package.json` — dependencies and development commands.
- `vite.config.ts` and `next.config.ts` — application configuration.

The stack includes React, TypeScript, Vinext/Vite, Three.js, and Tailwind CSS.

## Working together

1. Accept the GitHub collaborator invitation while signed into the invited account.
2. Pull the latest `main` before starting.
3. Make a branch for your change:

   ```sh
   git switch main
   git pull --ff-only
   git switch -c feature/your-change
   ```

4. Make a focused change. Check Thai and English, narrow and wide screens, and any affected 3D interactions. Respect reduced-motion preferences.
5. Run the relevant checks, review your changes, commit the intended files, and push your branch.
6. Open a pull request for review before merging into `main`. Mention what you tested and any known limitations.

Do not commit passwords, API keys, `.env` secrets, private notes, or machine-specific credentials. Avoid overwriting another contributor's work or force-pushing shared branches.

## Deployment

A GitHub commit is not proof that the live website has updated. Confirm the deployment destination and workflow with the project owner before publishing, and verify the live result afterward.

## Live Workshop

Open the classroom and select **Live Workshop · 8 stations**, or open `/live/` directly. Thai and English are supported. The room uses the classroom's midnight blue and gold theme. Drag to orbit, scroll to zoom, and explore each station while disconnected.

### Windows: no commands needed

Open [Live Workshop](https://kubo-classroom.vercel.app/live/), choose **Connect my Windows PC**, download the Windows ZIP, choose **Extract All**, and double-click **Start Kubo**. The complete classroom opens with the connection already running, in one browser tab. Next time, open **Start Kubo** again. The package includes a checksum-verified Node.js runtime; no admin access, Node installation, firewall changes, or startup service is required. Windows x64 is supported; ARM is not tested. Windows may display an unsigned-download warning; do not disable security protections.

The connected classroom runs at `http://127.0.0.1:4318/`, including `/guesthouse/` and `/live/`. This is a local copy of the website, not a connection to a remote person's PC. The public Vercel classroom remains available. The helper runs until Windows sign-out/restart. To update, close the old helper and extract a fresh download into a new folder.

Sessions can be searched by title, assistant or session ID. They are ordered by latest activity (newest first), with local dates/times shown. Search and live updates preserve the session being watched.

### Developers

For real activity from a source checkout:

```sh
npm ci
npm run build:website
npm run live:bridge
```

Keep that terminal running and open http://127.0.0.1:4318/live/. The workshop connects automatically using a same-origin event stream. No popup, cross-origin localhost request, or browser local-network permission is needed. The bridge binds only to `127.0.0.1:4318` and rejects foreign origins and hostnames. Restart the bridge after changing its code. The old `/connect` URL redirects to `/live/`.

The bridge reads local Codex session events and Claude Code project-session events. If the original dashboard is already running on port 4317, its Codex feed and declared work steps are reused. Otherwise the bridge reads Codex records directly. It never starts Claude or Codex. Cloud tasks with no local session record cannot appear.

Prompts, replies, reasoning contents, command arguments, tool output and file contents are not served. Codex task titles and fixed activity labels are displayed locally in your browser. Activity is **not uploaded to Vercel or shared with visitors**. Another computer needs its own bridge. Disconnection clears the feed and unlocks exploration; old activity is marked stale, never animated as fresh work.

Automatic events identify broad actions. For accurate visits to all eight stations, the agent should declare its actual current step, using its real environment session ID:

```sh
node bridge/report.mjs check "Checking the classroom"
node bridge/report.mjs done "The checked classroom is ready"
```

Stages: `context`, `rules`, `skill`, `references`, `check`, `approval`, `intake`, `plan`, `thinking`, `done`, `clear`. `CODEX_THREAD_ID` or `CLAUDE_SESSION_ID` must identify the running session. Declarations do not execute work, grant permissions or reveal reasoning. Report only real work, and refresh steps that run longer than three minutes.

Verification: `node --test bridge/*.test.mjs live/*.test.mjs`. Build: `npm run build:website`. The build also creates `website/downloads/Kubo-Windows.zip` from an explicit package allowlist and the official checksum-pinned Windows Node runtime. No local session data is packaged. For an unconnected website preview serve `website/` on port 4350. The production build is defined in `vercel.json`.
