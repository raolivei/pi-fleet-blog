# Building Eldertree - Podcast Cover Art

Cover art assets for the Building Eldertree podcast on Spotify.

## Files

| File | Description | Size |
|------|-------------|------|
| `podcast-cover.svg` | Vector cover art (recommended) | 1400x1400 |
| `podcast-cover.html` | Interactive HTML version with effects | 3000x3000 / 600x600 |

## Spotify Requirements

- **Format:** JPEG or PNG
- **Minimum size:** 1400x1400 pixels
- **Recommended:** 3000x3000 pixels
- **Aspect ratio:** 1:1 (square)

## How to Export

### Option 1: Export SVG (Recommended)

1. Open `podcast-cover.svg` in a browser or image editor
2. Export/save as PNG at desired resolution

**Using Inkscape (free):**
```bash
inkscape podcast-cover.svg --export-type=png --export-width=3000 --export-filename=podcast-cover.png
```

**Using ImageMagick:**
```bash
convert -density 300 podcast-cover.svg -resize 3000x3000 podcast-cover.png
```

**Using rsvg-convert:**
```bash
rsvg-convert -w 3000 -h 3000 podcast-cover.svg > podcast-cover.png
```

### Option 2: Screenshot HTML Version

1. Open `podcast-cover.html` in Chrome/Firefox
2. For full resolution:
   - Edit the HTML, change `class="cover preview"` to `class="cover"`
   - Use browser zoom to fit on screen
   - Take screenshot or use DevTools to capture full element
3. For preview (600x600):
   - Simply screenshot as-is

**Using Chrome DevTools:**
1. Open `podcast-cover.html`
2. Right-click → Inspect
3. Select the `.cover` element
4. Right-click element → Capture node screenshot

### Option 3: Online Converter

1. Upload `podcast-cover.svg` to [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Set output size to 3000x3000
3. Download PNG

## Customization

### Change Colors

Edit the gradient definitions in the SVG:

```xml
<!-- Main accent gradient -->
<linearGradient id="accentGrad">
  <stop offset="0%" stop-color="#818cf8"/>   <!-- Indigo -->
  <stop offset="50%" stop-color="#c084fc"/>  <!-- Purple -->
  <stop offset="100%" stop-color="#22d3ee"/> <!-- Cyan -->
</linearGradient>
```

### Add Episode Number

Uncomment the episode badge section at the bottom of the SVG and customize:

```xml
<g transform="translate(1280, 120)">
  <circle r="60" fill="url(#piGrad)" opacity="0.9"/>
  <text y="8" text-anchor="middle" ...>EP</text>
  <text y="45" text-anchor="middle" ...>1</text>
</g>
```

### Create Episode-Specific Covers

For individual episode covers:
1. Copy `podcast-cover.svg` to `episode-XX-cover.svg`
2. Uncomment and modify the episode number badge
3. Optionally change the subtitle to episode title

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | `#0f0f1a` | Background gradient start |
| Background Mid | `#1a1a2e` | Background gradient mid |
| Background Light | `#16213e` | Background gradient end |
| Indigo | `#6366f1` | Primary accent |
| Purple | `#a855f7` | Secondary accent |
| Cyan | `#22d3ee` | Highlight accent |
| Pink | `#c026d3` | Raspberry Pi nodes |
| Gray Light | `#94a3b8` | Subtitle text |
| Gray Dark | `#64748b` | Tagline text |
