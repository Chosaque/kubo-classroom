# Kubo's Classroom

A Thai/English learning website for explaining AI agents and coordinated sub-agents, with Kubo as the central orchestrator and an office demonstration.

## Project direction

- Explain ideas visually, with short text suitable for beginners.
- Keep Thai and English experiences consistent.
- Use character actions and demonstrations to support the lesson.
- Preserve the office demonstration when changing the course.

## Version status

As of September 21, 2026, this repository contains the classroom application and office demonstration. A newer Cosmic Guesthouse prototype, including lesson-linked character animations and camera zooms, is being developed separately and has **not yet been synced into this repository**. Do not assume this checkout matches that local preview or the deployed website.

## Run locally

Requirements: Git, Node.js **22.13.0 or newer**, npm, and access to this private repository.

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
