# Deployment Guide

## GitHub Pages Setup

Your blog is now on GitHub at: https://github.com/raolivei/pi-fleet-blog

### Enable GitHub Pages

1. Go to: https://github.com/raolivei/pi-fleet-blog/settings/pages
2. Under "Source", select: **GitHub Actions**
3. Save

The `.github/workflows/deploy.yml` workflow will automatically:
- Build the site on every push to `main`
- Deploy to GitHub Pages
- Your blog will be available at: `https://raolivei.github.io/pi-fleet-blog/`

### Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
npm run build
npx gh-pages -d dist
```

## Local Development

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file in `public/`:
   ```
   blog.eldertree.local
   # or
   blog.yourdomain.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to `raolivei.github.io`

3. Update GitHub Pages settings:
   - Go to repository settings → Pages
   - Add your custom domain

## Troubleshooting

### Build Fails

Check that:
- Node.js 18+ is installed: `node --version`
- Dependencies are installed: `npm install`
- Markdown file exists: `public/content/BLOG.md`

### GitHub Pages Not Updating

- Check Actions tab for workflow status
- Ensure GitHub Pages is set to "GitHub Actions" source
- Check workflow file: `.github/workflows/deploy.yml`

### Markdown Not Loading

- Ensure `public/content/BLOG.md` exists
- Check browser console for errors
- Verify file path in `src/main.js`

## Next Steps

1. ✅ Repository created
2. ✅ Code pushed to GitHub
3. ⏳ Install dependencies: `npm install`
4. ⏳ Enable GitHub Pages (Settings → Pages → GitHub Actions)
5. ⏳ Test locally: `npm run dev`
6. ⏳ Push updates to trigger deployment

---

**Your blog URL:** https://raolivei.github.io/pi-fleet-blog/ (after enabling Pages)

