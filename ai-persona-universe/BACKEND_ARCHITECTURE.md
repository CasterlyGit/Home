# 🏗️ AI Persona Universe - Backend Architecture

## 🎯 System Overview

This document outlines the backend architecture for the AI Persona Universe, designed to support multiple AI personas with dynamic personality traits and memory systems.

## 🏛️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  React + Three.js (3D Visualization + Chat Interface)      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│  Express.js + WebSocket Server (Session Management)        │
└─────────────────────┬───────────────────────────────────────┘
                      │ Internal API Calls
┌─────────────────────▼───────────────────────────────────────┐
│                AGENT ORCHESTRATION LAYER                    │
│  Persona Manager + Trait Engine + Memory Router            │
└─────────────────────┬───────────────────────────────────────┘
                      │ LLM API Calls
┌─────────────────────▼───────────────────────────────────────┐
│                   LLM INTEGRATION LAYER                     │
│  OpenAI/Anthropic + Custom Prompt Engine                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Database Operations
┌─────────────────────▼───────────────────────────────────────┐
│                    DATA LAYER                               │
│  PostgreSQL + Redis + Vector Database (Pinecone/Weaviate)  │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Core Components

### 1. API Gateway (Express.js + WebSocket)
```typescript
// server.ts
import express from 'express';
import { Server } from 'socket.io';
import { PersonaManager } from './services/PersonaManager';
import { MemoryEngine } from './services/MemoryEngine';

const app = express();
const io = new Server(server);

// REST API Routes
app.post('/api/chat', async (req, res) => {
  const { message, personaId, sessionId } = req.body;
  const response = await PersonaManager.processMessage(message, personaId, sessionId);
  res.json(response);
});

app.put('/api/personality', async (req, res) => {
  const { personaId, traitId, action, intensity } = req.body;
  const success = await PersonaManager.updateTrait(personaId, traitId, action, intensity);
  res.json({ success });
});

// WebSocket for real-time chat
io.on('connection', (socket) => {
  socket.on('chat_message', async (data) => {
    const response = await PersonaManager.processMessage(data.message, data.personaId, socket.id);
    socket.emit('ai_response', response);
  });
});
```

### 2. Persona Manager
```typescript
// services/PersonaManager.ts
export class PersonaManager {
  private static personas: Map<string, Persona> = new Map();
  private static memoryEngine = new MemoryEngine();

  static async processMessage(message: string, personaId: string, sessionId: string): Promise<ChatResponse> {
    const persona = this.personas.get(personaId);
    if (!persona) throw new Error('Persona not found');

    // Build context-aware prompt
    const context = await this.memoryEngine.getContext(sessionId, personaId);
    const prompt = this.buildPrompt(message, persona, context);

    // Get LLM response
    const llmResponse = await this.callLLM(prompt);

    // Extract and store behavioral traits
    const traits = await this.extractTraits(message, llmResponse);
    await this.memoryEngine.storeInteraction(sessionId, personaId, message, llmResponse, traits);

    return {
      message: llmResponse,
      personaId,
      traits,
      confidence: this.calculateConfidence(traits),
      suggestedActions: this.generateSuggestions(traits)
    };
  }

  private static buildPrompt(message: string, persona: Persona, context: Context): string {
    const traitDescriptions = persona.traits
      .map(trait => `${trait.name}: ${trait.description} (intensity: ${trait.intensity})`)
      .join('\n');

    return `
You are ${persona.name}, an AI with the following personality traits:
${traitDescriptions}

Previous conversation context:
${context.previousMessages.map(m => `${m.sender}: ${m.text}`).join('\n')}

User message: ${message}

Respond in character as ${persona.name}, incorporating your personality traits naturally.
    `.trim();
  }

  private static async extractTraits(userMessage: string, aiResponse: string): Promise<Trait[]> {
    // Use LLM to analyze the interaction and extract behavioral traits
    const analysisPrompt = `
Analyze this conversation and extract behavioral traits:

User: ${userMessage}
AI: ${aiResponse}

Extract traits like: tone, style, approach, metaphors used, etc.
Return as JSON array of traits with name, description, and intensity (0-1).
    `;

    const analysis = await this.callLLM(analysisPrompt);
    return JSON.parse(analysis);
  }
}
```

### 3. Memory Engine
```typescript
// services/MemoryEngine.ts
export class MemoryEngine {
  private db: Database;
  private vectorDb: VectorDatabase;

  async getContext(sessionId: string, personaId: string): Promise<Context> {
    // Get recent messages
    const messages = await this.db.query(
      'SELECT * FROM messages WHERE session_id = $1 AND persona_id = $2 ORDER BY timestamp DESC LIMIT 10',
      [sessionId, personaId]
    );

    // Get relevant memories using vector similarity
    const userEmbedding = await this.getEmbedding(messages[0]?.text || '');
    const relevantMemories = await this.vectorDb.search(userEmbedding, {
      filter: { personaId, sessionId },
      limit: 5
    });

    return {
      previousMessages: messages,
      relevantMemories,
      userPreferences: await this.getUserPreferences(sessionId)
    };
  }

  async storeInteraction(sessionId: string, personaId: string, userMessage: string, aiResponse: string, traits: Trait[]) {
    // Store in relational database
    await this.db.query(
      'INSERT INTO messages (session_id, persona_id, user_message, ai_response, traits) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, personaId, userMessage, aiResponse, JSON.stringify(traits)]
    );

    // Store embeddings for similarity search
    const embedding = await this.getEmbedding(userMessage + ' ' + aiResponse);
    await this.vectorDb.insert({
      id: `${sessionId}_${Date.now()}`,
      embedding,
      metadata: { sessionId, personaId, traits }
    });
  }
}
```

### 4. LLM Integration
```typescript
// services/LLMService.ts
export class LLMService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  async generateResponse(prompt: string, persona: Persona): Promise<string> {
    // Choose LLM based on persona requirements
    const llm = this.selectLLM(persona);
    
    const response = await llm.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: this.buildSystemPrompt(persona) },
        { role: 'user', content: prompt }
      ],
      temperature: this.calculateTemperature(persona),
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  }

  private buildSystemPrompt(persona: Persona): string {
    const coreTraits = persona.traits.filter(t => t.inherited).map(t => t.name).join(', ');
    const specificTraits = persona.traits.filter(t => !t.inherited).map(t => t.name).join(', ');

    return `
You are ${persona.name}. 

Core traits (inherited from all AI agents): ${coreTraits}
Specific traits for ${persona.name}: ${specificTraits}

Always respond in character, incorporating these traits naturally.
    `.trim();
  }
}
```

## 🗄️ Database Schema

### PostgreSQL Tables
```sql
-- Personas table
CREATE TABLE personas (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Traits table
CREATE TABLE traits (
  id VARCHAR(50) PRIMARY KEY,
  persona_id VARCHAR(50) REFERENCES personas(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  intensity DECIMAL(3,2) DEFAULT 0.5,
  inherited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  persona_id VARCHAR(50) REFERENCES personas(id),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  traits JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);
```

### Redis Schema
```redis
# Session data
session:{sessionId}:persona:{personaId}:messages -> List of recent messages
session:{sessionId}:persona:{personaId}:traits -> Hash of current trait intensities
session:{sessionId}:user_preferences -> Hash of user preferences

# Real-time features
chat:{sessionId}:typing -> Boolean (is user typing)
chat:{sessionId}:online -> Boolean (is user online)
```

## 🚀 Deployment Architecture

### Development Setup
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Production Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  api-gateway:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/ai_persona
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_persona
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  vector-db:
    image: weaviate/weaviate:latest
    environment:
      - QUERY_DEFAULTS_LIMIT=25
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    volumes:
      - weaviate_data:/var/lib/weaviate

volumes:
  postgres_data:
  redis_data:
  weaviate_data:
```

## 🔐 Security & Privacy

### Data Protection
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Anonymization**: User data anonymized where possible
- **Consent**: Clear opt-in for data collection and processing
- **Retention**: Configurable data retention policies

### API Security
- **Rate Limiting**: Prevent abuse with rate limiting
- **Authentication**: JWT-based authentication for user sessions
- **CORS**: Proper CORS configuration for frontend integration
- **Input Validation**: Comprehensive input validation and sanitization

## 📈 Scaling Strategy

### Horizontal Scaling
- **Load Balancers**: Multiple API instances behind load balancer
- **Database Sharding**: Shard by user/session for large scale
- **Caching**: Redis cluster for session and frequently accessed data
- **CDN**: Static assets served via CDN

### Performance Optimization
- **Connection Pooling**: Database connection pooling
- **Query Optimization**: Indexed queries and query optimization
- **Async Processing**: Background processing for non-critical operations
- **Monitoring**: Comprehensive monitoring and alerting

## 🧪 Testing Strategy

### Unit Tests
```typescript
// tests/PersonaManager.test.ts
describe('PersonaManager', () => {
  it('should process message with correct persona traits', async () => {
    const response = await PersonaManager.processMessage(
      'Hello, can you help me learn?',
      'tutor',
      'test-session'
    );
    
    expect(response.personaId).toBe('tutor');
    expect(response.traits).toContainEqual(
      expect.objectContaining({ name: 'Socratic' })
    );
  });
});
```

### Integration Tests
- API endpoint testing
- Database integration testing
- LLM integration testing
- End-to-end chat flow testing

## 🎯 Next Steps

1. **MVP Implementation**: Start with single persona and basic chat
2. **Trait Extraction**: Implement LLM-based trait extraction
3. **Memory System**: Add vector database for similarity search
4. **Real-time Features**: WebSocket integration for live chat
5. **Analytics**: User behavior and persona effectiveness tracking
6. **Advanced Features**: Cross-persona conversations, personality cloning

This architecture provides a solid foundation for building a scalable, maintainable AI persona system that can grow with your needs. 