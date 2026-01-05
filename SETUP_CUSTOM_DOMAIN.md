# Setup Steps: blog.eldertree.xyz

Quick guide to make https://raolivei.github.io/pi-fleet-blog/ available at https://blog.eldertree.xyz

## Prerequisites

- ✅ Cloudflare account with `eldertree.xyz` domain
- ✅ GitHub repository: `raolivei/pi-fleet-blog`
- ✅ GitHub Pages enabled (via GitHub Actions)
- ✅ Terraform configured with Cloudflare API token

## Step 1: Create DNS Record (Terraform)

The DNS record is already configured in Terraform. Apply it:

```bash
cd /Users/roliveira/WORKSPACE/raolivei/pi-fleet/terraform

# Review what will be created
./run-terraform.sh plan

# Apply the DNS record
./run-terraform.sh apply
```

This creates a CNAME record: `blog` → `raolivei.github.io` (proxied via Cloudflare)

**Verify DNS:**

```bash
dig blog.eldertree.xyz +short
# Should return: raolivei.github.io (or Cloudflare IP if proxied)
```

Wait 5-15 minutes for DNS propagation.

## Step 2: Configure GitHub Pages

1. Go to: https://github.com/raolivei/pi-fleet-blog/settings/pages
2. Scroll to **"Custom domain"** section
3. Enter: `blog.eldertree.xyz`
4. Click **Save**

GitHub will verify the DNS record (may take a few minutes).

## Step 3: Enable HTTPS

After GitHub verifies the domain:

1. In the same GitHub Pages settings page
2. Check the box: ✅ **Enforce HTTPS**
3. Click **Save**

**Note:** GitHub may take up to 24 hours to provision the SSL certificate.

## Step 4: Configure Cloudflare SSL Mode

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `eldertree.xyz` domain
3. Go to **SSL/TLS** → **Overview**
4. Set encryption mode to: **Full** or **Full (strict)**

This ensures HTTPS works correctly between Cloudflare and GitHub.

## Step 5: Verify Everything Works

```bash
# Test DNS resolution
dig blog.eldertree.xyz +short

# Test HTTP (should redirect to HTTPS)
curl -I http://blog.eldertree.xyz

# Test HTTPS
curl -I https://blog.eldertree.xyz
```

**Browser Test:**

1. Open: https://blog.eldertree.xyz
2. Verify:
   - ✅ Site loads correctly
   - ✅ HTTPS lock icon in browser
   - ✅ All assets (CSS, JS, images) load
   - ✅ No mixed content warnings

## Troubleshooting

### DNS Not Resolving

- Wait 5-15 minutes for propagation
- Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)
- Try different DNS: `dig @8.8.8.8 blog.eldertree.xyz`

### GitHub Pages Not Detecting Domain

- Verify DNS: `dig blog.eldertree.xyz +short`
- Ensure CNAME points to `raolivei.github.io` (not `*.github.io`)
- Wait a few minutes and refresh GitHub Pages settings
- Check Cloudflare proxy is enabled (orange cloud icon)

### HTTPS Not Working

- Check Cloudflare SSL mode is "Full" or "Full (strict)"
- Wait for GitHub to provision SSL certificate (up to 24 hours)
- Clear browser cache and try incognito mode

## Current Status

- ✅ CNAME file: `public/CNAME` contains `blog.eldertree.xyz`
- ✅ Terraform resource: `cloudflare_record.blog_eldertree_xyz_github_pages` configured
- ⏳ DNS record: Needs to be applied via Terraform
- ⏳ GitHub Pages: Needs custom domain configured
- ⏳ HTTPS: Will be enabled after DNS propagates

## Architecture

```
User → Cloudflare (HTTPS) → GitHub Pages (HTTPS) → Blog Content
```

1. User requests `https://blog.eldertree.xyz`
2. Cloudflare terminates SSL/TLS and proxies to `raolivei.github.io`
3. GitHub Pages serves the blog content using the CNAME file

---

**For detailed documentation, see:** `docs/CUSTOM_DOMAIN_SETUP.md`
