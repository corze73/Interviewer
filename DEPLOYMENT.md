# 🚀 Netlify Deployment Guide

Your Full-Realism AI Interviewer is now ready for deployment to Netlify with serverless functions!

## 🏗️ What's Been Set Up

### ✅ Frontend (React + Vite)
- **Build Command**: `npm run build`
- **Publish Directory**: `frontend/dist`
- **PWA Support**: Service worker and manifest configured
- **Environment Variables**: Configured for Netlify Functions

### ✅ Backend (Netlify Functions)
- **API Endpoints**:
  - `/.netlify/functions/api-health` - Health check & database test
  - `/.netlify/functions/api-users` - User management (GET, POST)
  - `/.netlify/functions/api-sessions` - Interview sessions (GET, POST)
- **Database**: Connected to your Neon PostgreSQL
- **CORS**: Configured for cross-origin requests

### ✅ Database (Neon PostgreSQL)
- **Connection**: Configured with SSL
- **Tables**: All schema migrated successfully
- **Environment**: Production-ready

## 🌐 Deploy to Netlify

### Step 1: Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select your **`Interviewer`** repository
5. Netlify will automatically detect your `netlify.toml` configuration

### Step 2: Environment Variables
In your Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```bash
# Database Connection (REQUIRED)
DATABASE_URL=postgresql://neondb_owner:npg_Mcar4VRKH9dD@ep-damp-cherry-abojz2ck-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Frontend Build Variables
VITE_API_URL=https://your-site-name.netlify.app/.netlify/functions
VITE_APP_NAME=AI Interviewer
VITE_APP_VERSION=1.0.0

# Optional: AI Services (add when ready)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Step 3: Deploy
1. Click **"Deploy site"**
2. Netlify will build and deploy automatically
3. Your site will be available at `https://your-site-name.netlify.app`

## 🧪 Testing Your API

Once deployed, test your endpoints:

### Health Check
```bash
curl https://your-site-name.netlify.app/.netlify/functions/api-health
```

### Create a User
```bash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/api-users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

### Get Users
```bash
curl https://your-site-name.netlify.app/.netlify/functions/api-users
```

### Create an Interview Session
```bash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/api-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Software Engineer",
    "jobCompany": "Tech Corp",
    "jobDescription": "Full-stack development role",
    "jobAnalysis": {"skills": ["React", "Node.js"], "questions": []}
  }'
```

## 🔧 Local Development

### Option 1: Netlify Dev (Recommended)
```bash
# Install Netlify CLI globally (already done)
npm install -g netlify-cli

# Run with Netlify Functions
npm run dev:netlify
```

### Option 2: Separate Development
```bash
# Run frontend and backend separately
npm run dev
```

## 📊 Monitoring

After deployment, monitor your application:

1. **Netlify Dashboard**: Build logs, function invocations, bandwidth
2. **Neon Dashboard**: Database usage, connection monitoring
3. **Browser Dev Tools**: Frontend performance and errors

## 🚨 Important Notes

### WebSocket Limitations
- Netlify Functions don't support persistent WebSocket connections
- For real-time features, consider:
  - **Pusher** or **Ably** for real-time messaging
  - **WebRTC** for peer-to-peer audio/video
  - **Server-Sent Events** for one-way real-time updates

### Function Limits
- **Execution Time**: 10 seconds max per function call
- **Payload Size**: 6MB max request/response
- **Concurrent Executions**: 1000 per account (can be increased)

### Production Optimizations
1. Add authentication to API endpoints
2. Implement rate limiting
3. Add input validation and sanitization
4. Set up error monitoring (Sentry)
5. Configure custom domain

## 🎉 You're Ready!

Your AI Interviewer application is now configured for production deployment on Netlify with:
- ✅ Serverless backend (Netlify Functions)
- ✅ PostgreSQL database (Neon)
- ✅ PWA frontend (React + Vite)
- ✅ Automatic deployments from GitHub
- ✅ HTTPS and global CDN

Deploy and start interviewing! 🎯