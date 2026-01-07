# Troubleshooting Guide

## npm Authentication Issues

If you see `npm error code E401`, your npm is configured to use a private registry (like AWS CodeArtifact) that requires authentication.

### Solution 1: Use Public npm Registry (Recommended for this project)

```bash
# Switch to public npm registry
npm config set registry https://registry.npmjs.org/

# Install dependencies
npm install
```

### Solution 2: Use npm with Authentication

If you need to keep your private registry:

```bash
# Login to your registry
npm login

# Or configure authentication token
npm config set //your-registry.com/:_authToken YOUR_TOKEN
```

### Solution 3: Use .npmrc for Project-Specific Registry

Create `.npmrc` in the project root:

```
registry=https://registry.npmjs.org/
```

This overrides your global npm config for this project only.

## Vite Command Not Found

If you see `vite: command not found`, dependencies aren't installed:

```bash
# Make sure you're in the project directory
cd /Users/roliveira/WORKSPACE/raolivei/pi-fleet-blog

# Install dependencies
npm install

# Verify vite is installed
npx vite --version
```

## Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.js
# server: { port: 3001 }
```

## Markdown Not Loading

If the blog content doesn't load:

1. **Check file exists:**
   ```bash
   ls -la public/content/BLOG.md
   ```

2. **Verify file path in main.js:**
   ```javascript
   const response = await fetch('/content/BLOG.md');
   ```

3. **Check browser console** for errors

4. **Ensure file is copied:**
   ```bash
   cp content/BLOG.md public/content/BLOG.md
   ```

## Build Fails

If `npm run build` fails:

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

2. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for syntax errors** in:
   - `vite.config.js`
   - `src/main.js`
   - `package.json`

## GitHub Pages Not Updating

If GitHub Pages isn't updating:

1. **Check Actions tab** - Is workflow running?
2. **Verify Pages settings:**
   - Settings → Pages → Source: **GitHub Actions**
3. **Check workflow file:**
   - `.github/workflows/deploy.yml` exists
4. **Manual trigger:**
   - Actions → Deploy Blog → Run workflow

## Common Issues

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

### Permission Denied

```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

### Outdated Dependencies

```bash
# Update dependencies
npm update

# Or update specific package
npm install vite@latest
```

---

**Still having issues?** Check the main README.md or open an issue on GitHub.






