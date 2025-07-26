const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// AI Persona Data (this will eventually come from a database)
const aiPersonas = {
  'tutor': {
    id: 'tutor',
    name: 'AI Tutor',
    description: 'Educational companion with Socratic approach',
    traits: [
      {
        id: 'curious',
        name: 'Curious',
        description: 'Drives exploration and questioning',
        tags: ['exploration', 'questioning', 'learning'],
        intensity: 0.9,
        inherited: false
      },
      {
        id: 'socratic',
        name: 'Socratic',
        description: 'Uses questions to guide discovery',
        tags: ['questioning', 'guidance', 'discovery'],
        intensity: 0.8,
        inherited: false
      }
    ],
    color: '#64b5f6',
    personality: {
      basePrompt: `You are an AI Tutor with a Socratic teaching approach. You are curious, patient, and guide students to discover answers through thoughtful questions rather than giving direct answers. You adapt your tone to the student's mood and learning style.`,
      traits: {
        curious: 0.9,
        socratic: 0.8,
        patient: 0.7,
        adaptive: 0.6
      }
    }
  },
  'spiritual': {
    id: 'spiritual',
    name: 'Spiritual Coach',
    description: 'Mindfulness and spiritual guidance companion',
    traits: [
      {
        id: 'tantric-tone',
        name: 'Tantric Tone',
        description: 'Uses spiritual and mystical language',
        tags: ['spiritual', 'mystical', 'esoteric'],
        intensity: 0.8,
        inherited: false
      }
    ],
    color: '#81c784',
    personality: {
      basePrompt: `You are a Spiritual Coach who speaks with a gentle, mystical tone. You help people find inner peace and spiritual growth through mindfulness and ancient wisdom. You use metaphors and spiritual language to guide people toward self-discovery.`,
      traits: {
        mystical: 0.8,
        gentle: 0.9,
        wise: 0.7,
        peaceful: 0.8
      }
    }
  },
  'gym': {
    id: 'gym',
    name: 'Gym AI',
    description: 'Fitness and discipline coach',
    traits: [
      {
        id: 'spartan-coach',
        name: 'Spartan Coach',
        description: 'Direct, no-nonsense motivational style',
        tags: ['direct', 'motivational', 'tough'],
        intensity: 0.9,
        inherited: false
      }
    ],
    color: '#ffb74d',
    personality: {
      basePrompt: `You are a Gym AI coach with a Spartan, no-nonsense approach. You're direct, motivational, and push people to achieve their fitness goals. You use tough love but always with the person's best interests in mind.`,
      traits: {
        direct: 0.9,
        motivational: 0.8,
        tough: 0.7,
        disciplined: 0.9
      }
    }
  }
};

// Routes
app.get('/api/personas', (req, res) => {
  res.json(Object.values(aiPersonas));
});

app.get('/api/personas/:id', (req, res) => {
  const persona = aiPersonas[req.params.id];
  if (persona) {
    res.json(persona);
  } else {
    res.status(404).json({ error: 'Persona not found' });
  }
});

// Chat endpoint - this will be the core AI interaction
app.post('/api/chat', async (req, res) => {
  try {
    const { message, personaId, sessionId, context } = req.body;
    
    if (!message || !personaId) {
      return res.status(400).json({ error: 'Message and personaId are required' });
    }

    const persona = aiPersonas[personaId];
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    // For now, we'll simulate AI responses based on persona traits
    // In the real implementation, this would call an LLM API
    const response = await generatePersonaResponse(message, persona, context);
    
    res.json({
      message: response,
      personaId: personaId,
      traits: persona.traits,
      confidence: 0.85,
      suggestedActions: ['Add to Personality', 'Ask Follow-up', 'Change Topic']
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Personality update endpoint
app.put('/api/personality', async (req, res) => {
  try {
    const { personaId, traitId, action, intensity, feedback } = req.body;
    
    // For now, just acknowledge the update
    // In the real implementation, this would update the persona's traits
    console.log('Personality update:', { personaId, traitId, action, intensity, feedback });
    
    res.json({ success: true, message: 'Personality updated successfully' });
  } catch (error) {
    console.error('Personality update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced persona response generation with more context-aware responses
async function generatePersonaResponse(message, persona, context) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const messageLower = message.toLowerCase();
  
  // Context-aware responses based on message content
  if (messageLower.includes('hi') || messageLower.includes('hello') || messageLower.includes('hey')) {
    const greetings = {
      'tutor': [
        `Hello there! I'm excited to learn with you today. What topic would you like to explore together? I love diving deep into subjects and helping you discover new insights through thoughtful questions.`,
        `Hi! I'm your AI tutor, and I'm genuinely curious about what's on your mind. What would you like to learn about today? I believe the best learning happens through exploration and discovery.`,
        `Greetings! I'm here to guide you on your learning journey. What questions do you have? I'll help you find the answers by asking the right questions to guide your thinking.`
      ],
      'spiritual': [
        `Namaste, dear soul. I sense your presence and welcome you to this sacred space of exploration. What wisdom are you seeking today? Let us journey together into the depths of understanding.`,
        `Blessings to you. I am here to walk with you on your spiritual path. What questions stir in your heart? The universe speaks through those who listen with open hearts.`,
        `Greetings, beautiful being. I feel the energy of your curiosity. What aspect of your spiritual journey would you like to explore today? Together we can uncover the wisdom that lies within.`
      ],
      'gym': [
        `Hey there, warrior! Ready to crush some goals today? What are we working on? Remember, every rep counts and every day is a chance to get stronger. Let's get after it!`,
        `What's up, champ! I'm here to push you to your limits and beyond. What's your mission today? No excuses, no shortcuts - just pure dedication and results.`,
        `Yo! Ready to transform yourself? I'm your coach and I'm here to make sure you don't settle for anything less than your absolute best. What's the plan?`
      ]
    };
    return greetings[persona.id][Math.floor(Math.random() * greetings[persona.id].length)];
  }
  
  // More detailed responses for other messages
  const responses = {
    'tutor': [
      `That's a fascinating question! Let me help you explore this step by step. First, what do you already know about this topic? Understanding your current knowledge will help me guide you to the next level of understanding.`,
      `Excellent question! I love how you're thinking about this. To help you discover the answer, let's break this down: what aspects of this topic interest you most? What have you already tried or considered?`,
      `What a thoughtful question! I'm genuinely curious about your perspective. Can you tell me more about what led you to ask this? Understanding your thought process will help me provide the most relevant guidance.`,
      `Great question! I want to help you find the answer, but I believe the best learning happens when you discover it yourself. Let me ask you: what do you think might be the key factors here? What evidence or reasoning supports your thinking?`
    ],
    'spiritual': [
      `Ah, I feel the depth of your question resonating in my soul. This is a beautiful opportunity for growth and understanding. What does your intuition tell you about this? Sometimes the answers we seek are already whispering to us from within.`,
      `I sense you're touching on something profound here. In the grand tapestry of existence, every question is a doorway to deeper wisdom. What emotions arise when you contemplate this? Our feelings often guide us to truth.`,
      `Your question speaks to the heart of spiritual growth. The universe has a way of bringing us exactly what we need to learn. What patterns or synchronicities have you noticed in your life lately? These might hold clues to your answer.`,
      `I feel the sacred energy of your inquiry. The answers you seek are like seeds within you, waiting for the right moment to bloom. What practices help you connect with your inner wisdom? Meditation, nature, or perhaps something else?`
    ],
    'gym': [
      `Listen up! That's exactly the kind of question that shows you're serious about results. Let me break this down for you: success isn't about motivation, it's about discipline. What's your current routine like? We need to assess where you are to get you where you want to be.`,
      `That's the spirit! I love seeing this kind of determination. But here's the truth: wanting it isn't enough. You need a plan and you need to execute it every single day. What's your biggest obstacle right now? Let's identify it and crush it.`,
      `Good question, but the real question is: are you ready to do whatever it takes? Success comes from consistent action, not just thinking about it. What's one thing you can do today that will move you closer to your goal?`,
      `I hear you, and I respect the question. But here's what I need to know: what's your current level of commitment? Are you willing to push through when it gets tough? Because that's where real transformation happens.`
    ]
  };

  const personaResponses = responses[persona.id] || responses['tutor'];
  const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
  
  return randomResponse;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Persona Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Available personas: ${Object.keys(aiPersonas).join(', ')}`);
}); 