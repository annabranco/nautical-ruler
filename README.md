# Nautical Slide Ruler

An interactive nautical calculator for sailing time, distance, and speed. Use the Cruiser or Speed ruler, or switch to Manual mode to edit values directly.

<p align="center">
  <img src="public/sailboat-emblem.png" alt="Nautical Slide Ruler sailboat emblem" width="180" />
</p>

## AI tools used

Made with the help of AI tools (Claude and ChatGPT)

## Run locally

Requirements: Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Create and preview a production build:

```sh
npm run build
npm run preview
```

## Install as an app

- **iPhone and iPad:** Open the deployed site in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** Open the deployed site in Chrome and choose **Install app** or **Add to Home screen** from the browser menu.

The app shell and its assets are cached after the first successful visit, so the calculator can reopen offline. A connection is needed for the first visit and to receive updates.

## Code formatting

Run `npm run format` to format the source with Prettier. Run `npm run format:check` to check formatting without changing files.
