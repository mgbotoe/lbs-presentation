# LBS AI Fireside — Polling App

Real-time audience polling for the LBS AI Fireside chat. Audience votes from their phones; results animate live on the projected screen.

## Quick start (event day)

```bash
npm start
```

This builds the app and starts the server. Open the URL printed in the terminal:

- **Presenter** — `http://localhost:3000` (project this)
- **Audience** — `http://<your-ip>:3000/audience` (phones scan the QR code)
- **Power Users** — `http://localhost:3000/poweruser`

## How it works

1. You open the presenter view on your laptop and project it
2. The intro screen shows a QR code that encodes the audience URL
3. Audience scans the QR code on their phones — they see a waiting screen
4. When you navigate to a poll screen, audience phones automatically show the options
5. Votes stream in real-time — the bar chart animates as votes arrive
6. Manual `+` buttons are always available as fallback (for show-of-hands)
7. Use **Show/Hide Results** to reveal the chart after everyone has voted
8. Use **Reset** to clear votes for a question

## Keyboard shortcuts (presenter)

| Key | Action |
|-----|--------|
| `→` or `Space` | Next screen |
| `←` | Previous screen |

## Development

```bash
# Terminal 1: Start the WebSocket server
npm run server

# Terminal 2: Start Vite dev server
npm run dev
```

Or run both at once:

```bash
npm run dev
```

The dev server runs on port 5173; the WebSocket server runs on port 3000. The app auto-connects to port 3000 for WebSocket in dev mode.

## Requirements

- Node.js 18+
- Everyone (presenter + audience) must be on the same WiFi network
- No internet required — everything runs locally

## No database, no cloud

All state lives in memory on the server. Votes reset when the server restarts. No data leaves the machine. Nothing to configure, no `.env` files, no accounts.
