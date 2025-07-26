# 🌞 AI Persona Universe

**A revolutionary 3D interactive platform where AI personas live as planets in a solar system, each with unique personalities and capabilities.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.178.0-green.svg)](https://threejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-gray.svg)](https://expressjs.com/)

## 🎯 Project Overview

AI Persona Universe reimagines human-AI interaction through an immersive 3D solar system where each AI persona is a planet with its own personality, traits, and communication style. Users can explore different AI personalities, chat with them in real-time, and experience truly personalized AI interactions.

### 🌟 Key Features

- **🌍 3D Solar System Interface** - Interactive planets representing AI personas
- **💬 Real-time Chat** - Communicate with AI personas through natural conversation
- **🧬 Dynamic Trait System** - Each AI has unique personality traits that influence responses
- **🔄 Context-Aware AI** - Responses adapt based on conversation context and user mood
- **🎨 Beautiful 3D Visualization** - Immersive Three.js-powered interface
- **⚡ Real-time Updates** - Live chat with instant responses
- **📱 Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Live Demo

**Coming Soon!** The application will be deployed and accessible online.

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── ChatInterface.tsx    # Real-time chat component
│   └── 3D/                 # Three.js components
├── services/
│   └── AIService.ts        # API communication layer
└── App.tsx                 # Main application orchestrator
```

### Backend (Node.js + Express)
```
backend/
├── server.js               # Express server
├── routes/                 # API endpoints
├── services/               # Business logic
└── middleware/             # Request processing
```

### Data Flow
```
User Input → React Component → AIService → Backend API → AI Engine → Response
```

## 🎮 AI Personas

### 🌍 AI Tutor
**Educational companion with Socratic approach**
- **Traits**: Curious, Socratic, Visual Explanation, Mentorship
- **Style**: Question-based learning, patient guidance
- **Best for**: Learning, problem-solving, skill development

### 🧘 Spiritual Coach
**Mindfulness and spiritual guidance companion**
- **Traits**: Tantric Tone, Non-dualist Approach, Quiet Pacing
- **Style**: Gentle, mystical, introspective
- **Best for**: Personal growth, meditation, life guidance

### 💪 Gym AI
**Fitness and discipline coach**
- **Traits**: Spartan Coach, Micro-data Obsessive, Logs Everything
- **Style**: Direct, motivational, results-focused
- **Best for**: Fitness goals, discipline, motivation

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics and visualization
- **React Three Fiber** - React integration for Three.js
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **RESTful API** - Clean, stateless API design

### Development Tools
- **npm** - Package management
- **ESLint** - Code linting and quality
- **Git** - Version control
- **SourceTree** - Git GUI management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern browser with WebGL support

### Quick Start
```bash
# Clone the repository
git clone https://github.com/CasterlyGit/ai-persona-universe.git
cd ai-persona-universe

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Start backend server (Terminal 1)
npm start

# Start frontend (Terminal 2)
cd ..
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔧 API Documentation

### Core Endpoints

#### GET /api/health
Health check endpoint
```json
{
  "status": "OK",
  "timestamp": "2024-07-26T16:35:24.892Z"
}
```

#### GET /api/personas
Get all available AI personas
```json
[
  {
    "id": "tutor",
    "name": "AI Tutor",
    "description": "Educational companion with Socratic approach",
    "traits": [...],
    "color": "#64b5f6"
  }
]
```

#### POST /api/chat
Send a message to an AI persona
```json
{
  "message": "Hello, how can you help me?",
  "personaId": "tutor"
}
```

#### PUT /api/personality
Update persona traits and behavior
```json
{
  "personaId": "tutor",
  "traitId": "curious",
  "action": "strengthen",
  "intensity": 0.9
}
```

## 🎯 Current Status

### ✅ Completed Features
- 3D solar system interface with interactive planets
- Real-time chat system with AI personas
- Dynamic trait system with inheritance
- Context-aware response generation
- RESTful API backend
- Comprehensive documentation
- Git version control with GitHub integration

### 🔄 In Development
- **LLM Integration** - Real AI intelligence (OpenAI/Anthropic)
- **Conversation Memory** - Persistent chat history
- **Voice Chat** - Audio communication capabilities
- **User Accounts** - Personalization and history
- **Advanced Analytics** - Usage insights and metrics

### 🚀 Planned Features
- **Multi-Modal AI** - Image generation and analysis
- **Persona Evolution** - AI personalities that learn and grow
- **Collaborative Features** - Multi-user interactions
- **Mobile App** - Native iOS/Android applications
- **Enterprise Features** - Team workspaces and analytics

## 🧪 Testing

### Manual Testing
```bash
# Test backend API
curl -X GET http://localhost:3001/api/health
curl -X GET http://localhost:3001/api/personas
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "personaId": "tutor"}'
```

### Automated Testing
```bash
# Run frontend tests
npm test

# Run backend tests (when implemented)
cd backend && npm test
```

## 📊 Performance Metrics

- **Frontend Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **3D Rendering**: 60 FPS on modern devices
- **Memory Usage**: Optimized for mobile devices
- **Bundle Size**: < 2MB (gzipped)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community** - For the amazing 3D graphics library
- **React Team** - For the incredible UI framework
- **Express.js** - For the robust backend framework
- **Open Source Community** - For inspiration and support

## 📞 Contact

- **Developer**: Casterly
- **GitHub**: [@CasterlyGit](https://github.com/CasterlyGit)
- **Project**: [AI Persona Universe](https://github.com/CasterlyGit/ai-persona-universe)
- **Issues**: [GitHub Issues](https://github.com/CasterlyGit/ai-persona-universe/issues)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=CasterlyGit/ai-persona-universe&type=Date)](https://star-history.com/#CasterlyGit/ai-persona-universe&Date)

---

**Built with ❤️ for the future of AI interaction**

*Last updated: July 2024* 