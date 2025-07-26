import React, { useState, useRef, useEffect } from 'react';
import { aiService, ChatRequest } from '../services/AIService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  persona?: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  persona: {
    name: string;
    description: string;
    color: string;
    traits: Array<{
      name: string;
      description: string;
      intensity: number;
    }>;
  } | null;
}

export default function ChatInterface({ isOpen, onClose, persona }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: persona ? `Hello! I'm your ${persona.name}. ${persona.description} How can I help you today?` : 'Hello! How can I help you?',
      sender: 'ai',
      timestamp: new Date(),
      persona: persona?.name
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check backend connection on component mount
    const checkBackend = async () => {
      try {
        const health = await aiService.checkHealth();
        setIsBackendConnected(health.status === 'OK');
      } catch (error) {
        setIsBackendConnected(false);
      }
    };
    checkBackend();
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !persona) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Map frontend persona names to backend IDs
      const personaIdMap: Record<string, string> = {
        'AI Tutor': 'tutor',
        'Spiritual Coach': 'spiritual',
        'Gym AI': 'gym'
      };
      const personaId = personaIdMap[persona.name] || persona.name.toLowerCase().replace(/\s+/g, '-');
      
      console.log('Sending message to persona:', persona.name, 'with ID:', personaId);
      
      const chatRequest: ChatRequest = {
        message: inputText,
        personaId: personaId,
        sessionId: `session_${Date.now()}`,
        context: {
          previousMessages: messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp,
            persona: msg.persona
          })),
          userPreferences: {}
        }
      };

      console.log('Chat request:', chatRequest);
      const response = await aiService.sendMessage(chatRequest);
      console.log('Backend response:', response);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        persona: persona.name
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling backend:', error);
      // Fallback to simulated response if backend fails
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `This is a simulated response from ${persona.name}. In the real implementation, this would be generated based on the persona's traits and memory.`,
        sender: 'ai',
        timestamp: new Date(),
        persona: persona.name
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: persona?.color || '#fdd835' }}
            />
            <div>
              <h2 className="text-xl font-bold text-white">
                {persona?.name || 'AI Assistant'}
              </h2>
              <p className="text-sm text-gray-400">
                {persona?.description || 'AI Persona'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Backend connection indicator */}
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-500' : 'bg-red-500'}`}
                title={isBackendConnected ? 'Backend Connected' : 'Backend Disconnected'}
              />
              <span className="text-xs text-gray-400">
                {isBackendConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="bg-blue-600 text-white rounded-xl px-6 py-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 