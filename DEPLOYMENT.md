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

## Custom Domain Setup

The blog is configured to use `blog.eldertree.xyz` as the custom domain.

### Current Configuration

- **CNAME file**: `public/CNAME` contains `blog.eldertree.xyz`
- **Base path**: Automatically uses `/` (root) when CNAME is present
- **GitHub Pages**: Configured to serve from custom domain

### Cloudflare DNS Setup

1. **Add DNS Record in Cloudflare:**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Select `eldertree.xyz` domain
   - Go to **DNS** → **Records**
   - Click **Add record**
   - Configure:
     - **Type**: `CNAME`
     - **Name**: `blog`
     - **Target**: `raolivei.github.io`
     - **Proxy status**: ✅ Proxied (orange cloud)
     - Click **Save**

2. **Configure GitHub Pages:**
   - Go to: https://github.com/raolivei/pi-fleet-blog/settings/pages
   - Under **Custom domain**, enter: `blog.eldertree.xyz`
   - Check **Enforce HTTPS** (after DNS propagates)
   - Click **Save**

3. **SSL/TLS Settings (Cloudflare):**
   - Go to **SSL/TLS** → **Overview**
   - Set encryption mode to: **Full (strict)** or **Full**
   - This ensures HTTPS works correctly

### Verification

After DNS propagates (usually 5-15 minutes):

```bash
# Check DNS resolution
dig blog.eldertree.xyz +short
# Should return: raolivei.github.io

# Test HTTPS
curl -I https://blog.eldertree.xyz
# Should return 200 OK
```

**Your blog will be available at:** https://blog.eldertree.xyz

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

