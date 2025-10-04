# Full-Realism Human-AI Interviewer

A production-grade, browser-based AI interviewer with photoreal avatar, real-time conversation, and comprehensive assessment capabilities.

## 🎯 Project Overview

This system delivers a human-like interview experience with:

- **Photoreal Avatar**: WebRTC-based video with lip-sync and micro-gestures
- **Real-time Conversation**: Sub-150ms barge-in, natural turn-taking
- **Adaptive Assessment**: STAR-method follow-ups, competency-based scoring
- **Professional Reporting**: Detailed strengths/gaps analysis with actionable insights

## 🏗️ Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Services      │
│   (React PWA)   │◄──►│   (Node.js)     │◄──►│   (LLM/STT/TTS) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebRTC        │    │   PostgreSQL    │    │   Avatar        │
│   Media Stream  │    │   Database      │    │   Provider      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for scaling)
- Modern browser with WebRTC support

### Environment Setup

```bash
# Clone and install dependencies
git clone <repo-url>
cd Interviewer
npm install

# Setup environment variables
cp .env.example .env
# Fill in your API keys and configuration

# Initialize database
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

### Required API Keys
- **LLM Provider**: OpenAI/Anthropic/etc.
- **Avatar Provider**: HeyGen/D-ID/Synthesia
- **STT/TTS**: Azure Cognitive Services/Google Cloud
- **Database**: PostgreSQL connection string

## 📋 Features

### Core Capabilities
- [x] Job description intake and analysis
- [x] Photoreal avatar with lip-sync
- [x] Real-time speech recognition with barge-in
- [x] Adaptive follow-up questioning
- [x] Hidden per-turn scoring
- [x] Comprehensive final reporting
- [x] PWA support for mobile/desktop

### Assessment Framework
- **Communication**: Clarity, structure, engagement
- **Problem-Solving**: Analytical thinking, approach
- **Ownership**: Initiative, accountability, results
- **Teamwork**: Collaboration, leadership, influence
- **Role Fit**: Technical skills, domain knowledge

### Performance Targets
- **Latency**: <400ms ear-to-mouth perceived
- **Barge-in**: <150ms avatar speech interruption
- **TTS Start**: <300ms initial speech generation
- **Uptime**: 99.5% availability target

## 🏃‍♂️ Development Workflow

### Project Structure
```
Interviewer/
├── frontend/           # React PWA application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page-level components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API and WebRTC services
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── backend/            # Node.js API server
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Business logic services
│   │   ├── models/     # Database models
│   │   ├── middleware/ # Express middleware
│   │   └── utils/      # Server utilities
│   └── migrations/     # Database migrations
├── shared/             # Shared types and utilities
│   ├── types/          # TypeScript definitions
│   └── constants/      # Shared constants
└── docs/               # Additional documentation
```

### Sprint Milestones

#### Sprint 1: Foundations ✅
- [x] JD intake and session management
- [x] WebRTC infrastructure
- [x] Basic avatar integration
- [x] Database schema and persistence

#### Sprint 2: Realtime Conversation 🔄
- [ ] Streaming STT with partial results
- [ ] Barge-in detection and handling
- [ ] Live captions and transcript
- [ ] Adaptive follow-up logic

#### Sprint 3: Avatar & Scoring 📋
- [ ] Viseme-driven lip synchronization
- [ ] Idle gestures and micro-expressions
- [ ] Per-turn competency scoring
- [ ] Observability and metrics

#### Sprint 4: Reporting & Hardening 🎯
- [ ] Final report generation
- [ ] Export capabilities (JSON/PDF)
- [ ] Error handling and fallbacks
- [ ] Performance optimization

## 🔧 Configuration

### Environment Variables
```bash
# Core Application
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/interviewer
REDIS_URL=redis://localhost:6379

# Authentication & Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Avatar Provider
HEYGEN_API_KEY=your-heygen-key
HEYGEN_AVATAR_ID=your-avatar-id

# Speech Services
AZURE_SPEECH_KEY=your-azure-key
AZURE_SPEECH_REGION=eastus

# Feature Flags
AVATAR_ENABLED=true
AUDIO_ONLY_FALLBACK=true
VERBOSE_LOGGING=false
```

### Feature Flags
- `AVATAR_ENABLED`: Toggle photoreal avatar vs. audio-only
- `AUDIO_ONLY_FALLBACK`: Auto-fallback when avatar fails
- `VERBOSE_LOGGING`: Detailed request/response logging

## 📊 Monitoring & Observability

### Key Metrics
- **Latency**: End-to-end response times
- **Barge-in Performance**: Interruption detection speed
- **Avatar Uptime**: Provider availability
- **Session Completion**: Success/abandonment rates
- **Assessment Quality**: Score distribution and consistency

### Logging Structure
```json
{
  "timestamp": "2024-10-04T12:00:00Z",
  "level": "info",
  "service": "realtime-orchestrator",
  "session_id": "sess_123",
  "event": "barge_in_detected",
  "latency_ms": 147,
  "context": {
    "user_speech_confidence": 0.89,
    "avatar_speech_position": "mid-sentence"
  }
}
```

## 🔒 Security & Compliance

### Data Handling
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Retention**: Configurable (0/7/30 days)
- **PII Minimization**: No unnecessary personal data stored
- **Consent**: Clear disclosure and opt-in flows

### Privacy Controls
- User data export (JSON format)
- Right to deletion (GDPR compliance)
- Audio processing disclosure
- Session recording policies

## 🚨 Troubleshooting

### Common Issues

#### Avatar Not Loading
```bash
# Check avatar provider status
curl -H "Authorization: Bearer $HEYGEN_API_KEY" https://api.heygen.com/v1/status

# Verify WebRTC connectivity
npm run debug:webrtc
```

#### High Latency
```bash
# Check service response times
npm run test:latency

# Monitor database performance
npm run db:analyze
```

#### Barge-in Not Working
```bash
# Test microphone permissions
npm run test:microphone

# Verify VAD sensitivity
npm run debug:vad
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Jest for unit testing
- Cypress for E2E testing
- Comprehensive JSDoc comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Discord**: [Community Channel]
- **Email**: support@interviewer-ai.com

---

Built with ❤️ for better interview experiences
