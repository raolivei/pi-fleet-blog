# Deployment Guide

## Overview

The blog is hosted on GitHub Pages at **https://blog.eldertree.xyz**.

- **Public URL**: `blog.eldertree.xyz` (via Cloudflare DNS → GitHub Pages)
- **Local URL**: `blog.eldertree.local` (via Pi-hole CNAME → `blog.eldertree.xyz`)

## GitHub Pages Setup

### 1. Enable GitHub Pages

1. Go to: https://github.com/raolivei/pi-fleet-blog/settings/pages
2. Under **Build and deployment**:
   - Source: **GitHub Actions**
3. Under **Custom domain**:
   - Enter: `blog.eldertree.xyz`
   - Click **Save**
4. Wait for DNS check to complete
5. Check **Enforce HTTPS** (after DNS propagates)

### 2. Verify Deployment

After pushing changes to `main`, the GitHub Action will:
- Build the VitePress site
- Deploy to GitHub Pages
- Site becomes available at `blog.eldertree.xyz`

Check status at: https://github.com/raolivei/pi-fleet-blog/actions

## DNS Configuration

### Public Domain (blog.eldertree.xyz)

**Already configured** in Terraform at `pi-fleet/terraform/cloudflare.tf`:

```hcl
resource "cloudflare_record" "blog_eldertree_xyz_github_pages" {
  zone_id = data.cloudflare_zone.eldertree_xyz[0].id
  name    = "blog"
  content = "raolivei.github.io"
  type    = "CNAME"
  proxied = true
}
```

To apply/verify:
```bash
cd ~/WORKSPACE/raolivei/pi-fleet/terraform
./run-terraform.sh plan   # Review
./run-terraform.sh apply  # Apply
```

### Local Domain (blog.eldertree.local)

**Configured** in Pi-hole via dnsmasq:
- File: `pi-fleet/helm/pi-hole/templates/configmaps.yaml`
- Record: `cname=blog.eldertree.local,blog.eldertree.xyz`

This redirects local network requests to the public blog.

## Local Development

```bash
cd ~/WORKSPACE/raolivei/pi-fleet-blog

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Verification

```bash
# Check DNS resolution
dig blog.eldertree.xyz +short
# Expected: raolivei.github.io (or Cloudflare IPs if proxied)

# Test public site
curl -I https://blog.eldertree.xyz
# Expected: HTTP/2 200

# Test local resolution (from local network)
dig blog.eldertree.local @192.168.2.201 +short
# Expected: blog.eldertree.xyz
```

## Troubleshooting

### Build Fails

- Check Node.js 18+ installed: `node --version`
- Clear and reinstall: `rm -rf node_modules && npm install`
- Check GitHub Actions logs for errors

### Custom Domain Not Working

1. Verify CNAME file exists: `public/CNAME` contains `blog.eldertree.xyz`
2. Check GitHub Pages settings has custom domain configured
3. Verify DNS propagation: `dig blog.eldertree.xyz +short`
4. Wait for GitHub to issue SSL certificate (can take up to 24 hours)

### Local Domain Not Resolving

1. Verify Pi-hole is running: `kubectl get pods -n dns-services`
2. Check dnsmasq config is applied
3. Restart Pi-hole pods if config was updated
