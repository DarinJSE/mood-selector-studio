## Mood Wallpaper Selector (Personal Project)

**Mood-based fullscreen wallpaper + quotes**, built as a personal playground using React + Vite.

Pick a mood, get a matching gradient wallpaper and a quote that fits the vibe. Click the same mood again to shuffle a new quote without changing the background.

### Features

- **Fullscreen mood wallpaper**  
  - Each mood has its own gradient background (Happy, Chill, Focus, Sleepy, Hype).
  - Smooth background transitions when switching moods.

- **Mood-aware quotes**  
  - Random quote per mood, with a subtle fade-in/out animation.
  - Clicking the same mood again refreshes the quote.

- **Overlay UI that stays out of the way**  
  - Small header bubble in the corner: title + short description.
  - Mood selector as a blurred control bar at the bottom.
  - Layout is optimized to keep the wallpaper as the main focus.

- **Mood-specific typography**  
  - Different Google Fonts per mood (e.g. Poppins for Happy, Roboto Mono for Focus, Montserrat for Hype).
  - Base UI uses Inter for a clean modern look.

### Tech stack

- **React** (via Vite)
- **JavaScript** (no TypeScript for now, this is just a personal project)
- **CSS** (vanilla, no UI framework)

### Running locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

### Notes

- This is a **personal project**, mainly for experimenting with simple UX, animations, and mood-based UI.
- Feel free to fork, tweak the moods/quotes/fonts, or use it as a starting point for your own vibe app.
