# Zuhelth — Gym Form Checker

A browser-based gym form checker. The initial milestone establishes the Next.js application foundation; pose detection and exercise analysis will be added in later milestones.

## Requirements

- Node.js 20.9 or later
- npm 10 or later (or a compatible npm version bundled with Node.js)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — check TypeScript types without emitting files

## Project milestones

1. Repository and architecture review
2. Application scaffold and developer tooling
3. Browser camera and MediaPipe Pose Landmarker integration
4. Squat analysis engine and repetition tracking
5. Live feedback, workout summary, and local history
6. Validation and deployment

## Scope of this scaffold

The app processes no camera video yet and does not provide exercise-safety or medical assessments. Camera processing and pose analysis will be introduced and validated in later milestones.
