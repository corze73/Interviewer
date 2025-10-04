# Installation & Setup Guide

## Prerequisites

Before setting up the Interviewer AI project, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
- **Redis** (optional, for scaling) - [Download here](https://redis.io/download)
- **Git** - [Download here](https://git-scm.com/downloads)

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/corze73/Interviewer.git
cd Interviewer
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Required Environment Variables

You'll need to configure the following essential variables in your `.env` file:

#### Core Application
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://interviewer:password@localhost:5432/interviewer_dev
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

#### AI Services (choose one LLM provider)
```bash
# OpenAI (recommended)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# OR Anthropic
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

#### Avatar Provider (choose one)
```bash
# HeyGen (recommended for real-time)
HEYGEN_API_KEY=your-heygen-api-key
HEYGEN_AVATAR_ID=your-avatar-id
HEYGEN_VOICE_ID=your-voice-id

# OR D-ID
DID_API_KEY=your-did-api-key
DID_PRESENTER_ID=your-presenter-id
```

#### Speech Services (choose one)
```bash
# Azure Cognitive Services (recommended)
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_LANGUAGE=en-US

# OR Google Cloud Speech
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### 5. Database Setup

```bash
# Create PostgreSQL database
createdb interviewer_dev

# Run database migrations
npm run db:migrate

# Seed with initial data (optional)
npm run db:seed
```

### 6. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# OR start individually
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000
```

## API Keys Setup Guide

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account or sign in
3. Navigate to API Keys section
4. Create new secret key
5. Copy the key to your `.env` file

### HeyGen API Key
1. Sign up at [HeyGen](https://www.heygen.com/)
2. Go to API section in dashboard
3. Generate API key
4. Choose an avatar from their library
5. Copy API key and avatar ID to `.env`

### Azure Speech Services
1. Create [Azure account](https://azure.microsoft.com/)
2. Create Speech Service resource
3. Get API key and region from resource
4. Copy to `.env` file

## Production Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=3001
DATABASE_URL=your-production-database-url
REDIS_URL=your-production-redis-url

# Security
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret

# HTTPS and domains
CORS_ORIGIN=https://yourapp.com
WEBRTC_TURN_SERVER=turn:your-turn-server.com:3478
```

### Build and Deploy
```bash
# Build all packages
npm run build

# Start production server
npm start
```

### Database Migration
```bash
# Run migrations in production
NODE_ENV=production npm run db:migrate
```

## Docker Setup (Alternative)

### Using Docker Compose
```bash
# Copy docker environment
cp .env.example .env.docker

# Edit docker-specific variables
nano .env.docker

# Start with Docker
docker-compose up -d
```

### Docker Environment
```yaml
# docker-compose.yml already configured with:
# - PostgreSQL database
# - Redis cache
# - Backend API
# - Frontend app
# - Nginx reverse proxy
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on ports 3000-3001
npx kill-port 3000 3001
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify database exists
psql -h localhost -p 5432 -l
```

#### Avatar Service Not Working
```bash
# Test avatar provider connection
curl -H "Authorization: Bearer $HEYGEN_API_KEY" https://api.heygen.com/v1/status
```

#### WebRTC Connection Issues
- Ensure HTTPS in production (required for microphone access)
- Configure STUN/TURN servers for NAT traversal
- Check firewall settings for WebRTC ports

### Logs and Debugging
```bash
# View application logs
npm run logs

# Enable verbose logging
VERBOSE_LOGGING=true npm run dev

# Check database queries
LOG_LEVEL=debug npm run dev
```

## Development Workflow

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Run tests
npm test
```

### Database Management
```bash
# Create new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

### Feature Flags
Toggle features via environment variables:
```bash
AVATAR_ENABLED=true          # Enable/disable avatar
AUDIO_ONLY_FALLBACK=true     # Fallback to audio-only
VERBOSE_LOGGING=false        # Detailed request logging
ENABLE_METRICS=true          # Performance metrics
```

## Performance Optimization

### Database
- Use connection pooling (configured by default)
- Add database indexes for frequent queries
- Enable query logging for optimization

### Caching
- Redis for session data and WebSocket scaling
- CDN for static assets
- Browser caching headers

### Monitoring
- Sentry for error tracking
- DataDog for performance metrics
- Custom logging for interview analytics

## Security Checklist

- [ ] Change default JWT/session secrets
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Secure database connections
- [ ] Rotate API keys regularly
- [ ] Set up security headers

## Support

If you encounter issues during setup:

1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs
3. Verify all environment variables are set
4. Test individual services (database, Redis, API providers)
5. Create an issue on GitHub with detailed error information

For additional help:
- **Documentation**: `/docs` folder
- **GitHub Issues**: Report bugs and feature requests
- **Email**: support@interviewer-ai.com