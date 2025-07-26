import React, { useState, useRef, useEffect } from 'react';
import { aiService, ChatMessage, ChatRequest } from '../services/AIService';

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
  console.log('ChatInterface rendered with persona:', persona);
  console.log('AIService available:', aiService);
  
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      const connected = await aiService.checkHealth();
      setIsBackendConnected(connected);
    };
    checkBackend();
  }, []);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && persona && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hello! I'm your ${persona.name}. ${persona.description} How can I help you today?`,
        sender: 'ai',
        timestamp: new Date(),
        persona: persona.name
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, persona, messages.length]);

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
      // Map persona names to backend IDs
      const personaIdMap: Record<string, string> = {
        'AI Tutor': 'tutor',
        'Spiritual Coach': 'spiritual',
        'Gym AI': 'gym'
      };

      const personaId = personaIdMap[persona.name] || persona.name.toLowerCase().replace(/\s+/g, '-');

      // Create chat request
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

      // Send to AI service
      const response = await aiService.sendMessage(chatRequest);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        persona: persona.name
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        persona: persona.name
      };
      setMessages(prev => [...prev, errorMessage]);
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
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500">
                  {isBackendConnected ? 'Backend Connected' : 'Backend Offline'}
                </span>
              </div>
            </div>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 rounded-2xl px-4 py-3 border border-gray-700">
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
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl px-6 py-3 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Personality Traits Display */}
        {persona && (
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Active Traits:</h3>
            <div className="flex flex-wrap gap-2">
              {persona.traits.slice(0, 3).map((trait, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${persona.color}20`,
                    color: persona.color,
                    border: `1px solid ${persona.color}40`
                  }}
                >
                  {trait.name} ({Math.round(trait.intensity * 100)}%)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 