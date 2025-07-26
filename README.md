# 🌞 AI Persona Universe

A revolutionary 3D interactive platform where AI personas live as planets in a solar system, each with unique personalities and capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with WebGL support

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-persona-universe

# Install frontend dependencies
npm install

# Install backend dependencies
cd ../backend
npm install

# Start backend server
npm start

# In another terminal, start frontend
cd ../ai-persona-universe
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Frontend      │ ◄──────────────────► │    Backend      │
│   (React + 3D)  │                      │   (Express)     │
└─────────────────┘                      └─────────────────┘
         │                                        │
         │                                        │
         ▼                                        ▼
┌─────────────────┐                      ┌─────────────────┐
│  3D Solar       │                      │  AI Persona     │
│  System         │                      │  Engine         │
└─────────────────┘                      └─────────────────┘
```

## 📚 Documentation Index

### Core Documentation
- [📖 **Architecture Guide**](./docs/ARCHITECTURE.md) - System design and technical architecture
- [🔧 **API Documentation**](./docs/API.md) - Complete backend API reference
- [🎨 **Frontend Guide**](./docs/FRONTEND.md) - React components and 3D implementation
- [🤖 **AI Persona System**](./docs/AI_PERSONAS.md) - Persona creation and management

### Development Guides
- [🚀 **Development Setup**](./docs/DEVELOPMENT.md) - Local development environment
- [🧪 **Testing Guide**](./docs/TESTING.md) - Testing strategies and examples
- [📦 **Deployment Guide**](./docs/DEPLOYMENT.md) - Production deployment instructions

### User Guides
- [👥 **User Manual**](./docs/USER_MANUAL.md) - How to use the application
- [🎯 **Feature Guide**](./docs/FEATURES.md) - Detailed feature explanations

## 🌟 Key Features

### Current Features
- ✅ **3D Solar System Interface** - Interactive planets representing AI personas
- ✅ **Real-time Chat** - Communicate with AI personas
- ✅ **Persona Traits** - Each AI has unique personality traits
- ✅ **Context-Aware Responses** - AI adapts based on conversation context
- ✅ **RESTful API** - Complete backend API for all operations

### Planned Features
- 🔄 **LLM Integration** - Real AI intelligence (OpenAI/Anthropic)
- 🔄 **Conversation Memory** - Persistent chat history
- 🔄 **Voice Chat** - Audio communication with AI
- 🔄 **Multi-Modal AI** - Image generation and analysis
- 🔄 **User Accounts** - Personalization and history

## 🏛️ Project Structure

```
ai-persona-universe/
├── src/
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx
│   │   └── 3D/             # Three.js components
│   ├── services/           # API services
│   │   └── AIService.ts
│   └── App.tsx            # Main application
├── docs/                  # Documentation
├── public/               # Static assets
└── package.json

backend/
├── server.js             # Express server
├── routes/               # API routes
├── services/             # Business logic
└── package.json
```

## 🎯 AI Personas

### Current Personas
1. **🌍 AI Tutor** - Educational companion with Socratic approach
2. **🧘 Spiritual Coach** - Mindfulness and spiritual guidance
3. **💪 Gym AI** - Fitness and discipline coach

### Persona Traits
Each persona inherits core traits from the "Sun" and has unique specialized traits:
- **Core Traits**: Empathy-first, Depth-over-speed, Analogies & Stories
- **Specialized Traits**: Persona-specific behaviors and communication styles

## 🔧 Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React Three.js integration
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing

### Development
- **npm** - Package management
- **ESLint** - Code linting
- **TypeScript** - Type checking

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [./docs/](./docs/)

---

**Built with ❤️ for the future of AI interaction**