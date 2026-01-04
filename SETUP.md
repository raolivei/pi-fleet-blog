# Blog Setup Guide

## Quick Start

### 1. Initialize Git Repository

```bash
cd /Users/roliveira/WORKSPACE/raolivei/pi-fleet-blog

# Initialize git (if not already done)
git init

# Create initial commit
git add .
git commit -m "Initial commit: Blog setup with Vite"
```

### 2. Create GitHub Repository

```bash
# Create repo on GitHub (via web or gh CLI)
gh repo create raolivei/pi-fleet-blog --public --source=. --remote=origin

# Or manually:
# 1. Go to https://github.com/new
# 2. Create repository: raolivei/pi-fleet-blog
# 3. Don't initialize with README (we already have one)
# 4. Then run:
git remote add origin git@github.com:raolivei/pi-fleet-blog.git
git push -u origin main
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

This will:

- Start Vite dev server on http://localhost:3000
- Hot reload on file changes
- Load blog content from `public/content/BLOG.md`

### 5. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with static files ready to deploy.

### 6. Preview Production Build

```bash
npm run preview
```

## Deployment Options

### GitHub Pages (Recommended)

The `.github/workflows/deploy.yml` workflow automatically deploys on push to main:

1. Push to main branch
2. GitHub Actions builds and deploys
3. Blog available at: `https://raolivei.github.io/pi-fleet-blog/`

**Manual deployment:**

```bash
npm run build
npx gh-pages -d dist
```

### Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy automatically on push

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

## Content Management

### Adding/Editing Content

1. Edit `content/BLOG.md` (main blog content)
2. The dev server will hot-reload
3. Commit and push when ready

### Blog Structure

- `content/BLOG.md` - Main blog content (all chapters)
- `content/BLOG_GUIDE.md` - Writing guide
- `content/BLOG_README.md` - Quick start
- `content/BLOG_PROGRESS.md` - Progress tracker
- `content/BLOG_NEXT_STEPS.md` - Next steps

## Customization

### Styling

Edit `src/styles.css` to customize:

- Colors (CSS variables in `:root`)
- Typography
- Layout
- Dark mode support

### Features

The blog uses:

- **Vite** - Fast build tool
- **Marked** - Markdown parser
- **Highlight.js** - Code syntax highlighting
- **Vanilla JS** - No framework, just modern JavaScript

### Adding Features

You can easily add:

- Table of contents generation
- Search functionality
- RSS feed
- Comments (via Disqus or similar)
- Analytics (Google Analytics, Plausible, etc.)

## Next Steps

1. ✅ Initialize git repository
2. ✅ Create GitHub repository
3. ✅ Install dependencies: `npm install`
4. ✅ Start dev server: `npm run dev`
5. ✅ Customize styles in `src/styles.css`
6. ✅ Continue writing blog content in `content/BLOG.md`
7. ✅ Deploy to GitHub Pages

---

**Need help?** Check the main README.md for more details.
