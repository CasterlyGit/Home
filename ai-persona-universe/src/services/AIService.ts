// AI Service Interface - Clean separation between frontend and backend

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  traits: Trait[];
  position: [number, number, number];
  color: string;
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
      console.log('AIService: Making request to:', `${this.baseUrl}/api/chat`);
      console.log('AIService: Request body:', JSON.stringify(request, null, 2));
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('AIService: Response status:', response.status);
      console.log('AIService: Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AIService: Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('AIService: Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('AIService: Error sending message:', error);
      throw error;
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
      return response.ok;
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
      const persona = await response.json();
      
      // Transform backend persona to frontend format
      return {
        ...persona,
        position: this.getPersonaPosition(personaId),
        traits: persona.traits.map((trait: any) => ({
          ...trait,
          tags: trait.tags || []
        }))
      };
    } catch (error) {
      console.error('Error getting persona:', error);
      return null;
    }
  }

  private getPersonaPosition(personaId: string): [number, number, number] {
    const positions: Record<string, [number, number, number]> = {
      'tutor': [4, 0, 0],
      'spiritual': [-3, 0, 2],
      'gym': [0, 0, -4]
    };
    return positions[personaId] || [0, 0, 0];
  }

  // Check backend health
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking backend health:', error);
      throw error;
    }
  }

  // Get all personas
  async getAllPersonas(): Promise<AIPersona[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/personas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const personas = await response.json();
      
      // Transform backend personas to frontend format
      return personas.map((persona: any) => ({
        ...persona,
        position: this.getPersonaPosition(persona.id),
        traits: persona.traits.map((trait: any) => ({
          ...trait,
          tags: trait.tags || []
        }))
      }));
    } catch (error) {
      console.error('Error getting personas:', error);
      return [];
    }
  }
}

// Export singleton instance
export const aiService = new AIService(); 