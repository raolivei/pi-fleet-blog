# Custom Domain Setup Guide: blog.eldertree.xyz

This guide walks through setting up `blog.eldertree.xyz` as the custom domain for the GitHub Pages blog.

## Overview

- **Custom Domain**: `blog.eldertree.xyz`
- **GitHub Pages**: `raolivei.github.io`
- **DNS Provider**: Cloudflare
- **SSL/TLS**: Cloudflare SSL (Full/Full Strict)

## Prerequisites

- ✅ Cloudflare account with `eldertree.xyz` domain
- ✅ GitHub repository: `raolivei/pi-fleet-blog`
- ✅ GitHub Pages enabled with GitHub Actions

## Step-by-Step Setup

### 1. Cloudflare DNS Configuration

1. **Log in to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com
   - Select `eldertree.xyz` domain

2. **Add CNAME Record**
   - Navigate to **DNS** → **Records**
   - Click **Add record**
   - Configure:
     ```
     Type:    CNAME
     Name:    blog
     Target:  raolivei.github.io
     Proxy:   ✅ Proxied (orange cloud)
     TTL:     Auto
     ```
   - Click **Save**

3. **Verify DNS Record**
   ```bash
   dig blog.eldertree.xyz +short
   # Should return: raolivei.github.io
   ```

### 2. GitHub Pages Configuration

1. **Add Custom Domain**
   - Go to: https://github.com/raolivei/pi-fleet-blog/settings/pages
   - Scroll to **Custom domain** section
   - Enter: `blog.eldertree.xyz`
   - Click **Save**

2. **Enable HTTPS** (after DNS propagates)
   - Once GitHub detects the DNS record, you'll see a checkbox:
     - ✅ **Enforce HTTPS**
   - Check this box and save

3. **Verify GitHub Pages Detection**
   - GitHub will verify the DNS record
   - This may take a few minutes
   - You'll see a green checkmark when verified

### 3. Cloudflare SSL/TLS Settings

1. **Configure SSL Mode**
   - In Cloudflare Dashboard, go to **SSL/TLS** → **Overview**
   - Set encryption mode to: **Full (strict)** or **Full**
   - This ensures HTTPS works correctly between Cloudflare and GitHub

2. **Why Full/Full Strict?**
   - GitHub Pages provides valid SSL certificates
   - Full mode encrypts traffic between Cloudflare and GitHub
   - Full Strict validates GitHub's certificate

### 4. Verify Setup

After DNS propagates (usually 5-15 minutes):

```bash
# Test DNS resolution
dig blog.eldertree.xyz +short
# Expected: raolivei.github.io

# Test HTTP (should redirect to HTTPS)
curl -I http://blog.eldertree.xyz
# Expected: 301 or 302 redirect to HTTPS

# Test HTTPS
curl -I https://blog.eldertree.xyz
# Expected: 200 OK

# Check SSL certificate
openssl s_client -connect blog.eldertree.xyz:443 -servername blog.eldertree.xyz < /dev/null
# Should show valid certificate
```

### 5. Browser Test

1. Open: https://blog.eldertree.xyz
2. Verify:
   - ✅ Site loads correctly
   - ✅ HTTPS lock icon in browser
   - ✅ All assets (CSS, JS, images) load
   - ✅ No mixed content warnings

## How It Works

### Architecture

```
User → Cloudflare (HTTPS) → GitHub Pages (HTTPS) → Blog Content
```

1. **User requests**: `https://blog.eldertree.xyz`
2. **Cloudflare**: 
   - Terminates SSL/TLS
   - Proxies request to `raolivei.github.io`
   - Caches content (optional)
3. **GitHub Pages**: 
   - Serves the blog content
   - Uses the CNAME file to determine routing

### Base Path Configuration

The VitePress configuration automatically detects the CNAME file and uses root path (`/`) instead of `/pi-fleet-blog/`:

```typescript
// .vitepress/config.ts
const cnamePath = resolve(__dirname, "../public/CNAME");
const hasCustomDomain = existsSync(cnamePath);
const base = hasCustomDomain ? "/" : "/pi-fleet-blog/";
```

This ensures:
- ✅ Custom domain uses root path: `https://blog.eldertree.xyz/`
- ✅ GitHub Pages subpath still works: `https://raolivei.github.io/pi-fleet-blog/`
- ✅ Local development uses root: `http://localhost:5173/`

## Troubleshooting

### DNS Not Resolving

**Issue**: `dig blog.eldertree.xyz` returns nothing or wrong IP

**Solutions**:
1. Check Cloudflare DNS record is saved
2. Wait 5-15 minutes for propagation
3. Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)
4. Try different DNS server: `dig @8.8.8.8 blog.eldertree.xyz`

### GitHub Pages Not Detecting Domain

**Issue**: GitHub shows "DNS check failed" or "Not verified"

**Solutions**:
1. Verify DNS is resolving: `dig blog.eldertree.xyz +short`
2. Ensure CNAME points to `raolivei.github.io` (not `*.github.io`)
3. Wait a few minutes and refresh GitHub Pages settings
4. Check Cloudflare proxy is enabled (orange cloud)

### HTTPS Not Working

**Issue**: Browser shows "Not Secure" or certificate errors

**Solutions**:
1. Check Cloudflare SSL mode is "Full" or "Full (strict)"
2. Wait for GitHub to provision SSL certificate (can take up to 24 hours)
3. Clear browser cache and cookies
4. Try incognito/private browsing mode

### Assets Not Loading (404 errors)

**Issue**: CSS, JS, or images return 404

**Solutions**:
1. Verify base path is `/` (check browser network tab)
2. Ensure CNAME file exists in `public/CNAME`
3. Rebuild and redeploy: push a commit to trigger workflow
4. Check browser console for specific 404 paths

### Mixed Content Warnings

**Issue**: Browser console shows mixed content errors

**Solutions**:
1. Ensure all assets use HTTPS or relative paths
2. Check Cloudflare SSL mode is "Full" or "Full (strict)"
3. Verify GitHub Pages has HTTPS enabled

## Maintenance

### Updating Content

Content updates automatically on every push to `main` branch:
- GitHub Actions builds the site
- Deploys to GitHub Pages
- Available at `https://blog.eldertree.xyz` within minutes

### Changing Domain

To change the custom domain:

1. Update `public/CNAME` with new domain
2. Update Cloudflare DNS record
3. Update GitHub Pages custom domain setting
4. Commit and push changes

### Monitoring

Check site status:
- **GitHub Actions**: https://github.com/raolivei/pi-fleet-blog/actions
- **GitHub Pages**: https://github.com/raolivei/pi-fleet-blog/settings/pages
- **Cloudflare Analytics**: Cloudflare Dashboard → Analytics

## References

- [GitHub Pages Custom Domain Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [VitePress Deployment Guide](https://vitepress.dev/guide/deploy)

---

**Current Status**: ✅ Configured for `blog.eldertree.xyz`

**Last Updated**: 2025-01-03

