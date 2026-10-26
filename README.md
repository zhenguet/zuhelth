# Zuhelth — Gym Form Checker

Zuhelth is a browser-based workout companion designed to help people review exercise technique. The first release will focus on bodyweight squat analysis using pose landmarks and explicit, testable criteria.

## Technology

- Next.js App Router and React
- TypeScript with strict checking
- Tailwind CSS 4
- ESLint flat config
- PostCSS with the Tailwind CSS PostCSS plugin
- MediaPipe Pose Landmarker is planned for a later milestone; it is not wired into the current scaffold

## Requirements

- Node.js 20.9 or later
- npm 10 or later (or a compatible npm version bundled with Node.js)

## Getting started

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

When dependencies change, update them with `npm install <package>` and commit the resulting `package.json` and `package-lock.json` together. Use `npm ci` for clean, reproducible installs.

## Scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — check TypeScript types without emitting files

## Continuous integration

GitHub Actions runs dependency installation, ESLint, TypeScript checking, and a production build on pushes and pull requests targeting `master`. On the initial push only, the workflow commits the generated npm lockfile after all validation steps pass. Subsequent runs use `npm ci`.

## Current scope

The current page is a static product scaffold. It does not request camera access, run pose detection, score exercise form, or save workout history. Those capabilities will be added after the foundation is validated.

## Planned milestones

1. Repository and architecture review
2. Application scaffold and developer tooling
3. Browser camera and MediaPipe Pose Landmarker integration
4. Squat analysis engine and repetition tracking
5. Live feedback, workout summary, and local history
6. Validation and deployment

## Project layout

```text
src/
└── app/
    ├── globals.css   # Tailwind import and global design tokens
    ├── icon.svg      # App icon
    ├── layout.tsx    # Root layout and metadata
    └── page.tsx      # Initial landing page
```

## Privacy and safety direction

The intended MVP architecture processes camera frames in the browser and avoids uploading raw video by default. The app is a technique-review aid, not a medical or safety assessment. Implementation details and model licensing will be reviewed during the MediaPipe integration milestone.
