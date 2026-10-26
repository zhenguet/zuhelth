# Zuhelth — Gym Form Checker

Zuhelth is a browser-based workout companion designed to help people review exercise technique. The initial milestone focuses on bodyweight squat pose preview using MediaPipe Pose Landmarker; exercise scoring and repetition counting are separate later milestones.

## Technology

- Next.js App Router and React
- TypeScript with strict checking
- Tailwind CSS 4 and PostCSS
- ESLint flat config
- MediaPipe Tasks Vision `1.1.1` for browser-based pose landmark detection

## Requirements

- Node.js 20.9 or later (Node.js 22 is used in CI)
- npm compatible with the committed package lock

## Getting started

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The live pose preview is available at [http://localhost:3000/workout/squat](http://localhost:3000/workout/squat). Use localhost or HTTPS so the browser can grant camera access.

## Scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — check TypeScript types without emitting files

## Pose preview

The route `/workout/squat` requests webcam permission only after the user presses **Start camera**. It loads the pinned MediaPipe Tasks Vision runtime and the Pose Landmarker Lite model, then draws detected landmarks over the live preview. GPU initialization is attempted first, with CPU fallback.

The application does not upload the camera stream to its own server. The browser downloads the MediaPipe WASM runtime and model from the URLs configured in `src/components/pose/pose-camera-panel.tsx`. The runtime can send usage/performance metrics according to MediaPipe's current terms and privacy notice; review these requirements before public release.

This stage only displays pose landmarks. It does not count repetitions, grade squat form, or determine whether an exercise is safe. Those rules need separate implementation and validation.

## Continuous integration

GitHub Actions validates dependency installation, ESLint, TypeScript checking, and a production build on pushes and pull requests targeting `master`. It uses `npm ci` when the committed lockfile matches the manifest. If dependencies change, CI generates an updated lockfile and commits it on a successful push to `master`.

## Project layout

```text
src/
├── app/
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   ├── page.tsx
│   └── workout/
│       └── squat/
│           └── page.tsx
└── components/
    ├── landing/
    └── pose/
        └── pose-camera-panel.tsx
```

## Privacy and safety

Camera frames are processed locally by the browser implementation and are not sent to the app server by this feature. The model and WASM assets are still downloaded from their configured public hosts. The app is a technique-review aid, not a medical or safety assessment.
