# KCode Turbo Extension

Browser extension that enhances the **Kimi Code Web UI** with quality-of-life improvements.

---

## What This Does

This extension runs inside your browser and improves the Kimi Code Web interface:

| Feature | Description |
|---------|-------------|
| **Grouped Folder View** | Automatically enables "Grouped by folder" session view |
| **Path Truncation** | Replaces long absolute paths with basenames in the sidebar |
| **AFK Cleanup** | Removes `/afk`, `AFK`, and `/AFK` from session titles |
| **Header Rebrand** | Changes "Kimi Code" → "KCode Turbo" |
| **Auto-Scroll** | Automatically scrolls to bottom when switching sessions |
| **Row Striping** | Adds subtle alternating background to session list items |

---

## Browser Support

Works on all **Chromium-based browsers**:

- ✅ Google Chrome
- ✅ Opera
- ✅ Microsoft Edge
- ✅ Brave
- ✅ Vivaldi
- ✅ Chromium

> The extension uses Manifest V3 and targets `localhost` / `127.0.0.1` origins where Kimi Code Web runs.

---

## Project Structure

```
.
├── manifest.json          # Extension manifest (Manifest V3)
├── content.js             # Content script — UI enhancements
├── styles.css             # Extension styles
├── icon16.png             # Icons
├── icon48.png
├── icon128.png
├── launch-browser.sh      # Quick launcher (macOS)
└── README.md
```

---

## Quick Start

### Option A — Launcher (macOS)

```bash
./launch-browser.sh
```

Auto-detects your Chromium browser and loads the extension.

Specify a browser manually:

```bash
./launch-browser.sh --browser "Google Chrome"
./launch-browser.sh --browser "Brave Browser"
```

### Option B — Manual Load

1. Open your browser and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select this folder (`KCode_Turbo_Extension`)
5. Open [http://127.0.0.1:5494](http://127.0.0.1:5494) (or your Kimi Web port)

---

## How It Works

The extension injects a content script into Kimi Code Web pages. It uses DOM mutation observers to:

1. Detect when the session list is rendered and click the "Grouped by folder" toggle
2. Walk text nodes and truncate any absolute paths to their basenames
3. Strip `/afk`, `AFK`, and `/AFK` strings from session titles
4. Replace the header logo text
5. Monitor URL changes to detect session switches and trigger auto-scroll

All changes are purely cosmetic — no data is sent to any external server.

---

## Troubleshooting

**Extension not appearing:**
- Make sure Developer mode is enabled
- If the browser was already running, fully quit it (Cmd+Q on macOS) and reload
- Check `chrome://extensions/` for any errors

**Features not applying:**
- Open DevTools → Console
- Look for `[Kimi Enhancer]` logs
- If DOM selectors fail, Kimi may have updated their UI — the selectors in `content.js` may need adjustment

---

## Tech Stack

- **Extension:** Vanilla JavaScript, Manifest V3
- **Target:** Chromium-based browsers (Chrome, Opera, Edge, Brave, Vivaldi)
- **Compatibility:** macOS, Linux, Windows
