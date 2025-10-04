# Netlify Deployment Guide

This guide covers deploying the AI Interviewer frontend to Netlify.

## 🚀 Quick Deploy

### Option 1: Deploy from Git (Recommended)

1. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: `20`

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-api.herokuapp.com
   VITE_WS_URL=wss://your-backend-api.herokuapp.com
   VITE_AVATAR_ENABLED=true
   VITE_AUDIO_ONLY_FALLBACK=true
   ```

### Option 2: Manual Deploy

```bash
# Build the frontend
npm run deploy:netlify

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=frontend/dist
```

## 🔧 Configuration

### Environment Variables

Set these in Netlify's dashboard under **Site settings** → **Environment variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.interviewer.com` |
| `VITE_WS_URL` | WebSocket URL | `wss://api.interviewer.com` |
| `VITE_AVATAR_ENABLED` | Enable avatar features | `true` |
| `VITE_AUDIO_ONLY_FALLBACK` | Audio fallback mode | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` |
| `VITE_LOG_LEVEL` | Logging level | `info` |

### Build Configuration

The `netlify.toml` file in the root directory contains:

- **Build settings** for the monorepo structure
- **Redirect rules** for React Router SPA
- **Security headers** for production
- **PWA optimization** with proper caching
- **Environment-specific** configurations

## 🔒 Security Features

### Headers Applied:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `X-Content-Type-Options: nosniff` - MIME sniffing protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy protection
- `Permissions-Policy` - Restricts camera/microphone access

### Caching Strategy:
- **Static assets**: 1 year cache with immutable flag
- **PWA files**: No cache, always fresh
- **HTML**: No cache for index.html

## 🌐 Custom Domain

1. **Add Domain:**
   - Go to **Site settings** → **Domain management**
   - Click **Add custom domain**
   - Follow DNS configuration instructions

2. **SSL Certificate:**
   - Automatically provisioned by Netlify
   - Supports Let's Encrypt certificates

## 📊 Performance Optimization

### Automatic Features:
- **Asset optimization** (minification, compression)
- **Image optimization** with Netlify Image CDN
- **Global CDN** distribution
- **Brotli compression** for better performance

### PWA Features:
- **Service worker** for offline functionality  
- **App manifest** for installability
- **Cache strategies** for optimal performance

## 🔄 Continuous Deployment

### Auto-Deploy Triggers:
- **Main branch** pushes → Production deployment
- **Pull requests** → Deploy previews
- **Branch pushes** → Branch deployments

### Build Hooks:
- Set up webhooks for external trigger deployments
- Configure rebuild schedules if needed

## 🐛 Troubleshooting

### Common Build Issues:

**Build fails with "command not found":**
```bash
# Ensure Node.js version is set correctly
# In netlify.toml: NODE_VERSION = "20"
```

**Environment variables not working:**
```bash
# Check variable names have VITE_ prefix
# Verify they're set in Netlify dashboard
```

**404 errors on page refresh:**
```bash
# Verify redirects in netlify.toml:
# [[redirects]]
#   from = "/*"
#   to = "/index.html"
#   status = 200
```

**PWA not working:**
```bash
# Check service worker registration
# Verify manifest.webmanifest is accessible
# Check HTTPS is enabled
```

### Build Logs:
- Check **Deploys** tab for detailed build logs
- Look for specific error messages
- Verify all dependencies are installed

## 📈 Monitoring

### Netlify Analytics:
- **Page views** and **unique visitors**
- **Top pages** and **traffic sources**
- **Performance metrics** and **Core Web Vitals**

### Integration Options:
- **Google Analytics** via environment variables
- **Sentry** for error monitoring
- **LogRocket** for user session recording

## 🚀 Advanced Features

### Forms (if needed):
```html
<!-- Netlify Forms for contact/feedback -->
<form netlify>
  <input type="email" name="email" />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

### Functions (Serverless):
```bash
# Create functions directory
mkdir netlify/functions

# Deploy serverless functions alongside frontend
```

### A/B Testing:
- Use Netlify's split testing features
- Configure different variants
- Measure conversion rates

---

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [React Router and SPAs](https://docs.netlify.com/routing/redirects/)
- [PWA on Netlify](https://docs.netlify.com/configure-builds/environment-variables/)

## 📧 Support

If you encounter issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Review build logs in Netlify dashboard
3. Consult the [Netlify community forum](https://answers.netlify.com/)
4. Contact support through Netlify dashboard