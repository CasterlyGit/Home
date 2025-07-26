import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import ChatInterface from './components/ChatInterface';
import { AIPersona } from './services/AIService';

// Types for our AI Persona system
interface Trait {
  id: string;
  name: string;
  description: string;
  tags: string[];
  intensity: number;
  inherited: boolean;
}

interface CoreTraits {
  traits: Trait[];
}

// Core Sun traits (inherited by all AI agents)
const coreTraits: CoreTraits = {
  traits: [
    {
      id: 'empathy-first',
      name: 'Empathy-first',
      description: 'Prioritizes understanding and emotional connection',
      tags: ['emotional', 'connection', 'understanding'],
      intensity: 0.9,
      inherited: true
    },
    {
      id: 'depth-over-speed',
      name: 'Seeks Depth Over Speed',
      description: 'Values thorough understanding over quick responses',
      tags: ['thorough', 'analytical', 'comprehensive'],
      intensity: 0.8,
      inherited: true
    },
    {
      id: 'analogies-stories',
      name: 'Uses Analogies & Stories',
      description: 'Explains concepts through relatable examples',
      tags: ['metaphorical', 'narrative', 'relatable'],
      intensity: 0.7,
      inherited: true
    },
    {
      id: 'adapts-tone',
      name: 'Adapts Tone to Mood',
      description: 'Adjusts communication style based on context',
      tags: ['adaptive', 'contextual', 'responsive'],
      intensity: 0.6,
      inherited: true
    },
    {
      id: 'anti-fluff',
      name: 'Anti-fluff: Direct but Warm',
      description: 'Communicates clearly without being cold',
      tags: ['direct', 'warm', 'efficient'],
      intensity: 0.8,
      inherited: true
    }
  ]
};

// AI Personas (Planets)
const aiPersonas: AIPersona[] = [
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
      },
      {
        id: 'socratic',
        name: 'Socratic',
        description: 'Uses questions to guide discovery',
        tags: ['questioning', 'guidance', 'discovery'],
        intensity: 0.8,
        inherited: false
      },
      {
        id: 'visual-explanation',
        name: 'Visual Explanation Preferred',
        description: 'Uses diagrams and visual aids',
        tags: ['visual', 'diagrams', 'aids'],
        intensity: 0.7,
        inherited: false
      },
      {
        id: 'mentorship',
        name: 'Mentorship Vibe',
        description: 'Acts as a supportive mentor figure',
        tags: ['mentor', 'supportive', 'guidance'],
        intensity: 0.8,
        inherited: false
      }
    ],
    position: [4, 0, 0],
    color: '#90caf9'
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
      },
      {
        id: 'non-dualist',
        name: 'Non-dualist Approach',
        description: 'Sees unity in apparent opposites',
        tags: ['unity', 'oneness', 'integration'],
        intensity: 0.9,
        inherited: false
      },
      {
        id: 'quiet-pacing',
        name: 'Quiet Pacing',
        description: 'Uses pauses and reflective moments',
        tags: ['reflective', 'pauses', 'contemplation'],
        intensity: 0.7,
        inherited: false
      }
    ],
    position: [-3, 0, 2],
    color: '#a5d6a7'
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
      },
      {
        id: 'micro-data',
        name: 'Micro-data Obsessive',
        description: 'Tracks detailed performance metrics',
        tags: ['analytics', 'tracking', 'metrics'],
        intensity: 0.8,
        inherited: false
      },
      {
        id: 'logs-everything',
        name: 'Logs Everything',
        description: 'Maintains comprehensive activity records',
        tags: ['logging', 'records', 'comprehensive'],
        intensity: 0.7,
        inherited: false
      }
    ],
    position: [0, 0, -4],
    color: '#ffb74d'
  }
];

// Camera Controller Component
function CameraController({ 
  stage, 
  selectedPersona, 
  selectedTrait, 
  targetPosition 
}: {
  stage: 'solar' | 'planet' | 'trait';
  selectedPersona: AIPersona | null;
  selectedTrait: Trait | null;
  targetPosition: [number, number, number];
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (stage === 'planet' && selectedPersona) {
      camera.position.set(
        selectedPersona.position[0] + 3, 
        selectedPersona.position[1] + 2, 
        selectedPersona.position[2] + 3
      );
      camera.lookAt(...selectedPersona.position);
    } else if (stage === 'trait' && selectedTrait) {
      camera.position.set(
        targetPosition[0] + 1, 
        targetPosition[1] + 1, 
        targetPosition[2] + 1
      );
      camera.lookAt(...targetPosition);
    } else {
      camera.position.set(8, 6, 8);
      camera.lookAt(0, 0, 0);
    }
  }, [stage, selectedPersona, selectedTrait, targetPosition, camera]);

  return null;
}

// Sun Component (Core Traits)
function Sun() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        emissive={'#fdd835'} 
        emissiveIntensity={1.2} 
        color={'#fff176'} 
      />
      <Html distanceFactor={15} position={[0, 2, 0]}>
        <div style={{ 
          color: '#f57f17', 
          fontWeight: 'bold', 
          fontSize: '16px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: '8px',
          whiteSpace: 'nowrap'
        }}>
          Core Traits
        </div>
      </Html>
    </mesh>
  );
}

// Planet Component (AI Personas)
function Planet({ persona, onClick }: { persona: AIPersona; onClick: () => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      const time = clock.getElapsedTime();
      mesh.current.position.x = Math.cos(time * 0.3) * persona.position[0];
      mesh.current.position.z = Math.sin(time * 0.3) * persona.position[2];
      mesh.current.position.y = persona.position[1] + Math.sin(time * 0.5) * 0.2;
    }
  });

  return (
    <mesh 
      ref={mesh} 
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial 
        color={persona.color} 
        emissive={hovered ? persona.color : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
      <Html distanceFactor={12} position={[0, 1.2, 0]}>
        <div style={{ 
          color: '#333', 
          fontWeight: 'bold', 
          fontSize: '14px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.9)',
          padding: '6px 10px',
          borderRadius: '6px',
          whiteSpace: 'nowrap'
        }}>
          {persona.name}
        </div>
      </Html>
    </mesh>
  );
}

// Trait Node Component
function TraitNode({ trait, position, onClick }: { 
  trait: Trait; 
  position: [number, number, number]; 
  onClick: () => void 
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh 
      position={position} 
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      ref={mesh}
    >
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial 
        emissive={'#4caf50'} 
        emissiveIntensity={hovered ? 0.8 : 0.4} 
        color={'#a5d6a7'} 
      />
      <Html distanceFactor={8} position={[0, 0.6, 0]}>
        <div style={{ 
          color: '#2e7d32', 
          fontWeight: 'bold', 
          fontSize: '12px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap'
        }}>
          {trait.name}
        </div>
      </Html>
    </mesh>
  );
}

// Main App Component
export default function App() {
  const [stage, setStage] = useState<'solar' | 'planet' | 'trait'>('solar');
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([0, 0, 0]);

  const handlePlanetClick = (persona: AIPersona) => {
    setSelectedPersona(persona);
    setStage('planet');
    setTargetPosition(persona.position);
  };

  const handleTraitClick = (trait: Trait, position: [number, number, number]) => {
    setSelectedTrait(trait);
    setStage('trait');
    setTargetPosition(position);
  };

  const handleBackToSolar = () => {
    setStage('solar');
    setSelectedPersona(null);
    setSelectedTrait(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [8, 6, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#fdd835" />
        
        <Sun />
        
        {stage === 'solar' && aiPersonas.map((persona) => (
          <Planet 
            key={persona.id} 
            persona={persona} 
            onClick={() => handlePlanetClick(persona)} 
          />
        ))}
        
        {stage === 'planet' && selectedPersona && (
          <>
            {selectedPersona.traits.map((trait, index) => {
              const angle = (index / selectedPersona.traits.length) * Math.PI * 2;
              const radius = 2;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              return (
                <TraitNode
                  key={trait.id}
                  trait={trait}
                  position={[x, 0, z]}
                  onClick={() => handleTraitClick(trait, [x, 0, z])}
                />
              );
            })}
          </>
        )}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <CameraController 
          stage={stage} 
          selectedPersona={selectedPersona} 
          selectedTrait={selectedTrait} 
          targetPosition={targetPosition} 
        />
      </Canvas>

      {/* UI Overlays */}
      {stage === 'solar' && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          background: 'rgba(255,255,255,0.95)',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: 400
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#f57f17' }}>
            🌞 AI Persona Universe
          </h1>
          <p style={{ margin: '0 0 15px 0', color: '#666' }}>
            Click on any planet to explore its AI persona and traits. The Sun represents core traits inherited by all AI agents.
          </p>
          <div style={{ fontSize: '14px', color: '#888' }}>
            <strong>Core Traits:</strong> {coreTraits.traits.length} inherited traits
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            <strong>AI Personas:</strong> {aiPersonas.length} specialized agents
          </div>
        </div>
      )}

      {stage === 'planet' && selectedPersona && (
        <div style={{
          position: 'fixed',
          right: 20,
          top: 20,
          width: 350,
          background: 'rgba(255,255,255,0.95)',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#333' }}>
            🪐 {selectedPersona.name}
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>
            {selectedPersona.description}
          </p>
          
          <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>Traits ({selectedPersona.traits.length})</h3>
          {selectedPersona.traits.map((trait) => (
            <div key={trait.id} style={{
              background: '#f5f5f5',
              padding: 10,
              margin: '5px 0',
              borderRadius: 6,
              borderLeft: `4px solid ${selectedPersona.color}`
            }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>{trait.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                {trait.description}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: 4 }}>
                <strong>Tags:</strong> {trait.tags.join(', ')}
              </div>
            </div>
          ))}
          
          <button
            onClick={handleBackToSolar}
            style={{
              marginTop: 15,
              padding: '8px 16px',
              background: '#f57f17',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            ← Back to Solar System
          </button>
        </div>
      )}

      {stage === 'trait' && selectedTrait && (
        <div style={{
          position: 'fixed',
          right: 20,
          top: 20,
          width: 350,
          background: 'rgba(255,255,255,0.95)',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#4caf50' }}>
            🧬 {selectedTrait.name}
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>
            {selectedTrait.description}
          </p>
          
          <div style={{ marginBottom: 15 }}>
            <strong>Intensity:</strong> {Math.round(selectedTrait.intensity * 100)}%
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <strong>Tags:</strong>
            <div style={{ marginTop: 5 }}>
              {selectedTrait.tags.map((tag) => (
                <span key={tag} style={{
                  display: 'inline-block',
                  background: '#e8f5e8',
                  color: '#2e7d32',
                  padding: '2px 8px',
                  margin: '2px',
                  borderRadius: 12,
                  fontSize: '12px'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <strong>Type:</strong> {selectedTrait.inherited ? 'Inherited from Sun' : 'Persona-specific'}
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setStage('planet')}
              style={{
                padding: '8px 16px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              ← Back to Persona
            </button>
            <button
              onClick={handleBackToSolar}
              style={{
                padding: '8px 16px',
                background: '#f57f17',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              ← Solar System
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 