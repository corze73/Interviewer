# Development Guide

## Project Architecture Overview

The Interviewer AI project is built as a monorepo with three main packages:

```
Interviewer/
├── frontend/           # React PWA (Vite + TypeScript)
├── backend/            # Node.js API (Express + TypeScript)  
├── shared/             # Shared types and utilities
└── docs/               # Documentation
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Query** - Data fetching
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js 18+** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Socket.IO** - WebSocket server
- **Winston** - Logging

### AI & Media Services
- **OpenAI/Anthropic** - LLM for conversation
- **HeyGen/D-ID** - Avatar providers
- **Azure/Google** - Speech services
- **WebRTC** - Real-time media

## Development Workflow

### Getting Started

1. **Clone and setup**
   ```bash
   git clone https://github.com/corze73/Interviewer.git
   cd Interviewer
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Database setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

### Package Scripts

#### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint all packages
npm run type-check       # TypeScript checking
```

#### Backend Specific
```bash
cd backend
npm run dev              # Start backend with hot reload
npm run build            # Build backend
npm run start            # Start production server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run test             # Run backend tests
```

#### Frontend Specific
```bash
cd frontend
npm run dev              # Start frontend dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run frontend tests
npm run test:e2e         # Run E2E tests
```

## Code Organization

### Shared Package (`/shared`)
Contains types, constants, and utilities used by both frontend and backend:

```typescript
// shared/src/types/index.ts
export interface InterviewSession {
  id: string;
  jobTitle: string;
  status: SessionStatus;
  // ...
}

// shared/src/constants/index.ts
export const PERFORMANCE_THRESHOLDS = {
  EAR_TO_MOUTH_MAX_MS: 400,
  // ...
}
```

### Backend Structure (`/backend`)
```
backend/src/
├── routes/              # API route handlers
├── services/            # Business logic services
├── middleware/          # Express middleware
├── database/            # Database schema and migrations
├── utils/               # Utility functions
└── scripts/             # Database and deployment scripts
```

Key patterns:
- **Route handlers** - Handle HTTP requests and validation
- **Services** - Contain business logic and external API calls
- **Middleware** - Authentication, error handling, logging
- **Database** - Drizzle ORM schema and migrations

### Frontend Structure (`/frontend`)
```
frontend/src/
├── components/          # Reusable UI components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── services/            # API clients and WebSocket
├── store/               # Zustand state stores
├── utils/               # Helper functions
└── types/               # Frontend-specific types
```

Key patterns:
- **Component composition** - Small, reusable components
- **Custom hooks** - Encapsulate logic and state
- **Service layer** - API calls and WebSocket management
- **State management** - Zustand for global state

## Key Features Implementation

### 1. Real-time Interview Flow

#### WebSocket Communication
```typescript
// Backend: WebSocket manager
class WebSocketManager {
  setupSessionHandlers(socket: AuthenticatedSocket) {
    socket.on('audio_chunk', (data) => {
      this.processAudioChunk(sessionId, data);
    });
    
    socket.on('barge_in', () => {
      this.io.to(sessionId).emit('avatar_stop');
    });
  }
}

// Frontend: WebSocket hook
const useWebSocket = (sessionId: string) => {
  const socket = useRef<Socket>();
  
  const sendAudioChunk = (chunk: ArrayBuffer) => {
    socket.current?.emit('audio_chunk', chunk);
  };
  
  return { sendAudioChunk, isConnected };
};
```

#### Audio Processing Pipeline
```
User Speech → VAD Detection → STT → LLM → TTS → Avatar
     ↓              ↓           ↓      ↓      ↓       ↓
  Recording    Barge-in    Transcript  Response  Visemes  Lip-sync
```

### 2. Avatar Integration

#### HeyGen Integration
```typescript
class HeyGenService {
  async createSession(avatarId: string): Promise<string> {
    const response = await axios.post('/v1/streaming.new', {
      avatar_id: avatarId,
      voice_id: this.voiceId,
    });
    return response.data.session_id;
  }
  
  async speak(sessionId: string, text: string) {
    await axios.post('/v1/streaming.task', {
      session_id: sessionId,
      text,
    });
  }
}
```

#### WebRTC Video Stream
```typescript
const useAvatarStream = () => {
  const [stream, setStream] = useState<MediaStream>();
  
  useEffect(() => {
    const peerConnection = new RTCPeerConnection(webrtcConfig);
    
    peerConnection.ontrack = (event) => {
      setStream(event.streams[0]);
    };
    
    return () => peerConnection.close();
  }, []);
  
  return stream;
};
```

### 3. Interview Assessment System

#### Scoring Pipeline
```typescript
class AssessmentService {
  async scoreResponse(
    response: string,
    competency: CompetencyType,
    context: InterviewContext
  ): Promise<Score> {
    const prompt = this.buildScoringPrompt(response, competency);
    const llmResponse = await this.llmService.complete(prompt);
    
    return {
      value: llmResponse.score,
      rationale: llmResponse.rationale,
      improvementTip: llmResponse.tip,
    };
  }
}
```

#### STAR Method Detection
```typescript
const detectSTARElements = (response: string): STARElements => {
  // Use LLM to detect Situation, Task, Action, Result
  return {
    situation: hasSituation,
    task: hasTask,
    action: hasAction,
    result: hasResult,
  };
};
```

## Testing Strategy

### Unit Tests
```typescript
// Backend service test
describe('AssessmentService', () => {
  it('should score communication competency', async () => {
    const service = new AssessmentService();
    const score = await service.scoreResponse(
      'I clearly communicated the project requirements...',
      'communication',
      mockContext
    );
    
    expect(score.value).toBeGreaterThan(3);
    expect(score.rationale).toContain('clear communication');
  });
});

// Frontend component test
describe('AvatarVideo', () => {
  it('should display video stream when connected', () => {
    render(<AvatarVideo stream={mockStream} />);
    expect(screen.getByRole('video')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// E2E interview flow test
test('complete interview flow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="job-title"]', 'Software Engineer');
  await page.click('[data-testid="start-interview"]');
  
  // Wait for avatar to load
  await page.waitForSelector('[data-testid="avatar-video"]');
  
  // Simulate audio recording
  await page.click('[data-testid="record-button"]');
  await page.waitForTimeout(3000);
  await page.click('[data-testid="record-button"]');
  
  // Check for transcript
  await expect(page.locator('[data-testid="transcript"]')).toContainText('Thank you');
});
```

## Performance Optimization

### Database Queries
```typescript
// Use indexes for frequent queries
await db.select()
  .from(interviewSessions)
  .where(eq(interviewSessions.userId, userId))
  .orderBy(desc(interviewSessions.createdAt))
  .limit(10);
```

### Caching Strategy
```typescript
// Redis caching for session data
class SessionService {
  async getSession(id: string): Promise<InterviewSession> {
    const cached = await redis.get(`session:${id}`);
    if (cached) return JSON.parse(cached);
    
    const session = await db.query.interviewSessions.findFirst({
      where: eq(interviewSessions.id, id),
    });
    
    await redis.setex(`session:${id}`, 3600, JSON.stringify(session));
    return session;
  }
}
```

### Frontend Optimization
```typescript
// Code splitting by route
const Interview = lazy(() => import('./pages/Interview'));
const Report = lazy(() => import('./pages/Report'));

// Audio processing in Web Worker
const audioWorker = new Worker('/audio-processor.js');
audioWorker.postMessage({ type: 'process', data: audioChunk });
```

## Deployment Guide

### Environment Configuration
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/interviewer
REDIS_URL=redis://prod-redis:6379

# SSL and security
CORS_ORIGIN=https://interviewer.ai
JWT_SECRET=production-secret
```

### Docker Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Health checks
docker-compose ps
curl http://localhost/health
```

### Monitoring Setup
```typescript
// Structured logging
logger.info('Interview completed', {
  sessionId,
  duration,
  turnCount,
  avgLatency,
});

// Performance metrics
const startTime = Date.now();
await processAudioChunk(data);
const latency = Date.now() - startTime;

metrics.histogram('audio_processing_latency', latency);
```

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Run full test suite
5. Create PR with detailed description

### Security Considerations
- Never commit API keys
- Use environment variables for secrets
- Validate all user inputs
- Implement rate limiting
- Use HTTPS in production
- Sanitize database queries

This architecture provides a solid foundation for building a production-ready AI interviewer with real-time capabilities, comprehensive assessment, and professional user experience.