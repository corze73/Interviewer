# Netlify Environment Variables Configuration
# Add these to your Netlify dashboard under Site settings > Environment variables

## Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_Mcar4VRKH9dD@ep-damp-cherry-abojz2ck-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

## Authentication & Security  
JWT_SECRET=production-super-secret-jwt-key-generate-a-new-32-character-string
SESSION_SECRET=production-super-secret-session-key-generate-a-new-32-character-string

## Application Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-netlify-app-name.netlify.app

## WebRTC Configuration (keep the same)
WEBRTC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302

## Frontend Environment Variables (for build time)
VITE_API_URL=https://your-backend-api-url.com
VITE_WS_URL=wss://your-backend-api-url.com
VITE_APP_NAME=AI Interviewer
VITE_APP_VERSION=1.0.0

# Optional: Add when you're ready to use AI features
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key