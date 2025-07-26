// AI Service Interface - Clean separation between frontend and backend

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  traits: Trait[];
  position: [number, number, number];
  color: string;
  personality?: {
    basePrompt: string;
    traits: Record<string, number>;
  };
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  tags: string[];
  intensity: number;
  inherited: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  persona?: string;
}

export interface ChatRequest {
  message: string;
  personaId: string;
  sessionId: string;
  context?: {
    previousMessages: ChatMessage[];
    userPreferences: any;
  };
}

export interface ChatResponse {
  message: string;
  personaId: string;
  traits: Trait[];
  confidence: number;
  suggestedActions?: string[];
}

export interface PersonalityUpdate {
  personaId: string;
  traitId: string;
  action: 'strengthen' | 'weaken' | 'remove' | 'add';
  intensity?: number;
  feedback?: string;
}

// Service class for AI interactions
export class AIService {
  private baseUrl: string;
  private sessionId: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send message to AI persona
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to simulated response if backend is not available
      return {
        message: `This is a simulated response from ${request.personaId}. The backend server might not be running. Error: ${error.message}`,
        personaId: request.personaId,
        traits: [],
        confidence: 0.85,
        suggestedActions: ['Add to Personality', 'Ask Follow-up', 'Change Topic']
      };
    }
  }

  // Update personality traits
  async updatePersonality(update: PersonalityUpdate): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/personality`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating personality:', error);
      return false;
    }
  }

  // Get persona details
  async getPersona(personaId: string): Promise<AIPersona | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/personas/${personaId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting persona:', error);
      return null;
    }
  }

  // Get all personas
  async getAllPersonas(): Promise<AIPersona[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/personas`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting personas:', error);
      // Return mock data as fallback
      return [
        {
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
            }
          ],
          position: [4, 0, 0],
          color: '#64b5f6'
        },
        {
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
          position: [-3, 0, 2],
          color: '#81c784'
        },
        {
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
          position: [0, 0, -4],
          color: '#ffb74d'
        }
      ];
    }
  }

  // Check if backend is available
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService(); 