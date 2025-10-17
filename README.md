# Delinyah Koning — Portfolio Site

This is my personal portfolio playground, built entirely with **vanilla HTML / CSS / JavaScript** — no frameworks, no build tools. The visuals may be chaotic, but the structure underneath is intentionally organized so I (or future me) can expand things without pain.

Key features:

- ✨ **Animated Liquify / Prism Hero Effect** — mouse-responsive distortion using a custom normal map
- 🎥 **Lightbox with video autoplay + loop**
- 🪐 **Tri-Position Cursor Switch** — dot / solar system orbit / native system cursor
- 🧱 **CSS and JS modularized** — visuals and logic separated for clarity
- 🚀 **GitHub Pages-ready** — no build step required, just push to `main`

---

## 📁 Project Structure

```
/ 
├─ index.html              # Main homepage
├─ assets/                # Media & files
│  ├─ greenplanet.mp4
│  ├─ spiderwaving.mp4
│  ├─ md.mp4
│  └─ resume.pdf
├─ css/
│  ├─ base.css           # Root variables, typography
│  ├─ layout.css         # Header, grids, tabs, cards
│  ├─ hero.css           # Hero SVG + poetic line styling
│  ├─ lightbox.css       # Lightbox visuals
│  ├─ cursor.css         # Cursor visuals (dot + solar)
│  └─ switch.css         # Tri-position switch
├─ js/
│  ├─ config.js          # Global parameters (colors, cursor modes, hero settings)
│  ├─ main.js            # Entry; sets year + hover/down handling
│  ├─ lightbox.js        # Opens/closes lightbox
│  ├─ cursor.js          # Cursor tracking
│  ├─ switch.js          # Cursor toggle + localStorage
│  └─ hero-liquify.js    # Canvas normal map + displacement loop
```

---

## ⚙️ Editable Parameters

These are the main tuning spots.

### 🎨 Colors & Theme (`css/base.css`)

```css
:root{
  --bg:#0a0b0f;
  --ink:#ffffff;
  --muted:#9aa0b3;
  --panel:#10121a;
  --accent:#9bd4ff;
  --mint:#a8ffd3;
  --peach:#ffd6a5;
}
```

### 🪐 Cursor Modes (`js/config.js`)

```js
window.APP = {
  cursorModes: ['dot','solar','native'],
  defaultCursorMode: 'dot',
  ...
};
```

### Hero Liquify Effect — Full Parameter Breakdown

The hero effect is configured in `js/config.js` under the `hero` object:

hero: {
  MAX_IMPRINTS: 150,
  LIFE: 9000,
  BASE: 128,
  BASE_RADIUS: 110,
  STRETCH: 3.0,
  TWIRL: 1.8,
  POWER: 1.5
}

Parameter meanings:

- MAX_IMPRINTS → How many mouse trail “ripples” are stored. Higher = longer motion memory.
- LIFE → Time (in ms) before each ripple fades out. Lower = fades fast / more “fresh”, Higher = long echo trail.
- BASE → Base lightness value of the normal map (RGB). Lower = darker center, Higher = brighter.
- BASE_RADIUS → The circular radius of each ripple before distortion. Controls how large each pulse starts.
- STRETCH → Horizontal scaling of the ripple. 1.0 = round, 3.0 = wide streaks.
- TWIRL → Rotational force applied to the ripples. 0.0 = straight motion, 3.0+ = spirals.
- POWER → How strong the displacement is overall. Master intensity control.

### Prism Effect (RGB Separation)

The RGB split happens inside `js/hero-liquify.js` when offsets are applied:

offR.setAttribute('dx', valueX);
offR.setAttribute('dy', valueY);

offG.setAttribute('dx', valueX);
offG.setAttribute('dy', valueY);

offB.setAttribute('dx', valueX);
offB.setAttribute('dy', valueY);

To INCREASE color separation:
- Multiply offsets by a larger number (e.g. change 1.30 to 2.00).
- You can also flip direction by swapping `dirX` and `dirY` or negating them.

To DISABLE prism effect entirely:
- Set all dx and dy to "0".

### Solar Cursor Customization

Each orbit and planet is defined in HTML like:

<span class="orbit orbit--mars">
  <span class="track">
    <span class="planet"></span>
  </span>
</span>

The visual behavior is controlled using these CSS variables:

--r        = Orbit radius (distance from center)
--duration = Rotation speed (lower = faster spin)
--theta    = Starting rotation angle
--size     = Planet size
--color    = Planet color (can be a solid or gradient)

Example from cursor.css:

.cursor--solar .orbit--mars .track{
  --r: 30px;
  --theta: 200deg;
  --duration: 15s;
}

.cursor--solar .orbit--mars .planet{
  --size: 4px;
  --color: #ff7b6b;
}

To ADD a planet:

1. Duplicate an existing orbit in the HTML.
2. Change the class name (e.g. orbit--pluto).
3. Define its style in cursor.css with new --r, --duration, --size, --color.

To CHANGE the sun glow:

In `.cursor__sun`, edit the box-shadow. Increase the blur values or add more layers for stronger glow.

To DISABLE solar cursor entirely:

Remove `"solar"` from `cursorModes` in `config.js`.

### Lightbox Customization (Video & Image Popups)

The lightbox is initialized in `js/lightbox.js`. It activates when elements have `data-lightbox` on their `.thumb` container.

To make something open in the lightbox:

<div class="thumb" data-lightbox>
  <button class="fs-btn">⤢</button>
  <video src="assets/example.mp4" autoplay muted loop playsinline></video>
</div>

Key behaviors:

- Clicking the video, the thumbnail, or the ⤢ button opens the popup.
- ESC or clicking the dark background closes it.
- Videos inside the lightbox loop automatically and restart from 0 every time.

Customization options:

- To disable autoplay inside the popup, remove `clone.autoplay = true` in `lightbox.js`.
- To disable loop, remove `clone.loop = true`.
- To add next/prev navigation, wrap multiple media in an array and change openWithMedia() to accept index tracking.

To change popup size:

Adjust in `css/lightbox.css`:

.lightbox__frame{
  max-width: min(1000px, 84vw);
  max-height: 84vh;
}

Change the 84vw / 84vh values to control how large it opens. 

### Adding New Media Cards / Thumbnails

Each card follows this pattern:

<article class="card">
  <div class="thumb" data-lightbox>
    <button class="fs-btn" type="button">⤢</button>
    <video src="assets/example.mp4" autoplay muted loop playsinline></video>
  </div>
  <strong>Title Here</strong>
  <div class="sub">Description here</div>
</article>

To add an image instead of a video:

<div class="thumb" data-lightbox>
  <button class="fs-btn">⤢</button>
  <img src="assets/example.jpg" alt="Something">
</div>

Place as many cards as needed inside:

<div class="grid cards"> ... </div>

Optional: If you want cards to be clickable without the ⤢ button, remove the button entirely and rely on the click listener already attached to the `.thumb`.

### Deployment (GitHub Pages)

This site is deployed at `https://delinyahkoning.github.io/`.

Because it is a **User Site** (not a `/project` path), absolute links like `/3d/` and `/photos/` work correctly.

To update the site live:

1. git add .
2. git commit -m "Update"
3. git push

GitHub Pages auto-updates within ~30 seconds.

If changes do not show:

- Hard refresh with CTRL+SHIFT+R (browser cache)
- Make sure `.nojekyll` is not needed (only for folders starting with underscores)
