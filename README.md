# Kurosuke — a game for cats

A single black creature with big eyes and a long whipping tail swoops across a pale
green screen, ducks away, and comes back. Tap it and it pops. Modelled on the
"猫専用動画" cat video by setzerhiro6120 (youtube.com/watch?v=MN14qKuh59A).

## Files

- `catgame.html` — the whole game, one self-contained file. Source of truth.
- `docs/` — the same game as an installable offline web app; this is what GitHub
  Pages serves. Built from `catgame.html`; don't edit it by hand.
  - `index.html` — the game plus a service-worker registration
  - `sw.js` — caches the app on the iPad so it opens with no network
  - `manifest.webmanifest` — makes it install as a standalone app
  - `icon-192.png` — manifest icon
- `artifact.html` — same game, wrapper tags stripped, for hosting as a Claude artifact.
- `icon.png` — 180×180 home-screen icon (also embedded in `catgame.html`).

After editing `catgame.html`, rebuild `docs/` and bump `CACHE` in `docs/sw.js`
(e.g. `kurosuke-v1` → `kurosuke-v2`) so installed copies pick up the new version.

## Put it on the iPad as a real app

Live at **https://arleij.github.io/cat-game/** (served from `docs/` on `main`).
Open it in Safari on the iPad, then Share → **Add to Home Screen**.

It carries `apple-mobile-web-app-capable` and a standalone manifest, so it launches from
the icon with no Safari UI at all — no address bar, no tabs for a paw to hit. The service
worker caches everything on first load, so after that it runs with no network and no
computer involved. Confirm it by turning on Airplane Mode and relaunching.

To try it without hosting: run `python3 -m http.server 8000` in this folder and open
`http://<your-mac-ip>:8000/catgame.html` on the iPad over the same Wi-Fi.

## While the cat plays

Turn on **Guided Access** (Settings → Accessibility → Guided Access), then triple-click
the top button once the game is open. The cat then cannot swipe out of it.

## Settings

Hold the **top-left corner** for one second — long enough that a paw won't do it by accident.
Creatures (1–3), speed, size, colour, catch sound, bird chirps, keep-screen-on, score,
and a **Test sound** button that reports the audio state.

**Creature** colour (`INKS`): Green (default), Blue, Orange, Red, Black.
**Background** (`THEMES`): Sage (the video's look), Paper, Sky, Butter, Night.

Each creature colour has two shades — a deep one for the four pale backgrounds and a
bright one for Night — so the creature is never lost against its ground. All 25
pairings were measured to clear 4:1 WCAG contrast; within that budget the hues are as
vivid as they can be. That split matters because the two audiences want different
things: cats are dichromats who see blue and green well and almost no red, and they
track the light/dark silhouette rather than the hue, so the contrast floor is for the
cat and the hue is for the human. Orange and brown look identical to the cat.

**Sound on iPadOS** needs two things, and the original build had neither:
`navigator.audioSession.type = 'playback'` (Safari 16.4+), or the ringer switch mutes it;
and notes must be scheduled only once the AudioContext is genuinely `running`, since
`resume()` is async and anything scheduled against a suspended context is dropped.
Settings and score persist in the browser.

## How the creature moves

A fixed 60 Hz step drives a small state machine — `swoop` (glide to a point),
`loop` (a wide arc), `dart` (a sudden flick), `hover` (freeze and twitch) — with a
turn-rate limit, so paths are curves rather than zigzags. The tail is a 22-node rope
that follows the head with spring inertia plus a rigid segment-length constraint;
it whips on turns and sways when the creature stops.

Each visit lasts 7–15 s, then it slips off an edge and is gone for 0.3–2.4 s before
returning from a different edge with a freshly rolled body size. About one appearance
in five (`PEEK_CHANCE`) is not a visit at all: it noses into a corner, hovers there for
a second or two with its tail still off-screen, and backs out the way it came. A paw landing within
the catch radius catches it; a near miss triggers a flee burst at 2.3× cruise speed,
and a lifted paw keeps scaring for another 0.4 s so a quick swat still scatters it.

Black on `#EAEFE0` is deliberate: cats are dichromats and see luminance contrast far
better than hue, so a high-contrast silhouette reads to them much better than colour would.
