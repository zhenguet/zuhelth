# Zuhelth — Gym Form Checker

Zuhelth is a browser-based workout companion designed to help people review exercise technique. The initial milestone focuses on bodyweight squat pose preview using MediaPipe Pose Landmarker; exercise scoring and repetition counting are separate later milestones.

## Technology

- Next.js App Router and React
- TypeScript with strict checking
- Tailwind CSS 4 and PostCSS
- ESLint flat config
- MediaPipe Tasks Vision `1.1.1` for browser-based pose landmark detection
- Vitest `3.2.4` for unit tests of geometry and the squat state machine

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
- `npm test` — run unit tests for angles and squat repetition analysis

## Pose preview

The route `/workout/squat` requests webcam permission only after the user presses **Start camera**. It loads the pinned MediaPipe Tasks Vision runtime and the Pose Landmarker Lite model, then draws detected landmarks over the live preview. GPU initialization is attempted first, with CPU fallback.

The application does not upload the camera stream to its own server. The browser downloads the MediaPipe WASM runtime and model from the URLs configured in `src/components/pose/pose-camera-panel.tsx`. The runtime can send usage/performance metrics according to MediaPipe's current terms and privacy notice; review these requirements before public release.

The squat preview uses a state machine to identify standing, descending, bottom and ascending phases; it counts a rep only when the user returns to a near-standing knee angle. It estimates knee angle in the 2D image plane, applies temporal smoothing, selects a clearer leg when bilateral estimates disagree substantially, and avoids producing an aggregate angle when disagreement is ambiguous. A rep's depth target is fixed when the rep starts and must be seen across consecutive frames before it is marked reached. Reps can still be counted when the selected target was not confirmed, and the UI reports that separately. Prolonged pose loss resets an incomplete rep and requires standing calibration again. Torso lean is shown only as an estimate, not graded. These heuristics are not personalized biomechanical advice and do not determine whether an exercise is safe. Use a side-on camera view and validate thresholds with a qualified coach before relying on the feedback.

## Squat analysis and test coverage

The initial unit tests cover:
- Joint-angle calculations in pixel space, including non-square camera frames
- Rejection of low-confidence, degenerate, and invalid-dimension inputs
- Choosing the clearer side or rejecting ambiguous bilateral knee-angle disagreement
- Full squat rep counting with consecutive-frame depth confirmation
- Counting a shallow rep and rejecting a one-frame noisy depth dip
- Locking the depth threshold for an active rep
- Missing landmarks, prolonged pose loss, target-threshold clamping, and session reset

The current thresholds are heuristics for a side-view camera and should be validated with a qualified coach before public use. A passing unit test checks the code's logic, not real-world biomechanical accuracy.

## Continuous integration

GitHub Actions validates dependency installation, ESLint, unit tests, TypeScript checking, and a production build on pushes and pull requests targeting `master`. It uses `npm ci` when the committed lockfile matches the manifest. If dependencies change, CI generates an updated lockfile and commits it on a successful push to `master`.

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
├── features/
│   └── squat/
│       ├── geometry.ts
│       ├── squat-analyzer.ts
│       ├── squat-analyzer.test.ts
│       └── types.ts
└── components/
    ├── landing/
    └── pose/
        ├── pose-camera-panel.tsx
        └── squat-analysis-panel.tsx
```

## Privacy and safety

Camera frames are processed locally by the browser implementation and are not sent to the app server by this feature. The model and WASM assets are still downloaded from their configured public hosts. The app is a technique-review aid, not a medical or safety assessment.
