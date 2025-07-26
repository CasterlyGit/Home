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

// Camera Controller Component with smooth transitions
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
    let targetX: number, targetY: number, targetZ: number, lookAtX: number, lookAtY: number, lookAtZ: number;
    
    if (stage === 'planet' && selectedPersona) {
      targetX = selectedPersona.position[0] + 3;
      targetY = selectedPersona.position[1] + 2;
      targetZ = selectedPersona.position[2] + 3;
      lookAtX = selectedPersona.position[0];
      lookAtY = selectedPersona.position[1];
      lookAtZ = selectedPersona.position[2];
    } else if (stage === 'trait' && selectedTrait) {
      targetX = targetPosition[0] + 1;
      targetY = targetPosition[1] + 1;
      targetZ = targetPosition[2] + 1;
      lookAtX = targetPosition[0];
      lookAtY = targetPosition[1];
      lookAtZ = targetPosition[2];
    } else {
      targetX = 8;
      targetY = 6;
      targetZ = 8;
      lookAtX = 0;
      lookAtY = 0;
      lookAtZ = 0;
    }

    // Smooth camera transition
    const duration = 1000; // 1 second
    const startTime = Date.now();
    const startX = camera.position.x;
    const startY = camera.position.y;
    const startZ = camera.position.z;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      camera.position.x = startX + (targetX - startX) * easeProgress;
      camera.position.y = startY + (targetY - startY) * easeProgress;
      camera.position.z = startZ + (targetZ - startZ) * easeProgress;
      
      camera.lookAt(lookAtX, lookAtY, lookAtZ);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [stage, selectedPersona, selectedTrait, targetPosition, camera]);

  return null;
}

// Sun Component (Core Traits) with enhanced glow
function Sun() {
  const mesh = useRef<THREE.Mesh>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
    if (glowMesh.current) {
      glowMesh.current.rotation.y = clock.getElapsedTime() * 0.05;
      glowMesh.current.rotation.z = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowMesh}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial 
          color="#fdd835" 
          transparent 
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main sun */}
      <mesh ref={mesh}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          emissive={'#fdd835'} 
          emissiveIntensity={1.5} 
          color={'#fff176'} 
        />
      </mesh>
      
      <Html distanceFactor={15} position={[0, 2, 0]}>
        <div style={{ 
          color: '#fdd835', 
          fontWeight: 'bold', 
          fontSize: '16px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.8)',
          padding: '8px 12px',
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          border: '1px solid #fdd835',
          backdropFilter: 'blur(10px)'
        }}>
          Core Traits
        </div>
      </Html>
    </group>
  );
}

// Planet Component (AI Personas) with smooth animations
function Planet({ persona, onClick }: { persona: AIPersona; onClick: () => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      const time = clock.getElapsedTime();
      const orbitSpeed = 0.2;
      const bobSpeed = 0.8;
      const bobHeight = 0.3;
      
      mesh.current.position.x = Math.cos(time * orbitSpeed) * persona.position[0];
      mesh.current.position.z = Math.sin(time * orbitSpeed) * persona.position[2];
      mesh.current.position.y = persona.position[1] + Math.sin(time * bobSpeed) * bobHeight;
      
      mesh.current.rotation.y = time * 0.3;
    }
    
    if (glowMesh.current) {
      glowMesh.current.position.copy(mesh.current!.position);
      glowMesh.current.rotation.copy(mesh.current!.rotation);
    }
  });

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowMesh}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial 
          color={persona.color} 
          transparent 
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main planet */}
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
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      
      <Html distanceFactor={12} position={[0, 1.2, 0]}>
        <div style={{ 
          color: '#fff', 
          fontWeight: 'bold', 
          fontSize: '14px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.8)',
          padding: '6px 10px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          border: `1px solid ${persona.color}`,
          backdropFilter: 'blur(10px)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.2s ease'
        }}>
          {persona.name}
        </div>
      </Html>
    </group>
  );
}

// Trait Node Component with enhanced effects
function TraitNode({ trait, position, onClick }: { 
  trait: Trait; 
  position: [number, number, number]; 
  onClick: () => void 
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.5;
      mesh.current.rotation.x = clock.getElapsedTime() * 0.3;
    }
    
    if (glowMesh.current) {
      glowMesh.current.rotation.copy(mesh.current!.rotation);
    }
  });

  return (
    <group position={position}>
      {/* Glow effect */}
      <mesh ref={glowMesh}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial 
          color="#4caf50" 
          transparent 
          opacity={hovered ? 0.6 : 0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main trait node */}
      <mesh 
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        ref={mesh}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          emissive={'#4caf50'} 
          emissiveIntensity={hovered ? 1.2 : 0.6} 
          color={'#81c784'} 
        />
      </mesh>
      
      <Html distanceFactor={8} position={[0, 0.6, 0]}>
        <div style={{ 
          color: '#4caf50', 
          fontWeight: 'bold', 
          fontSize: '12px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          border: '1px solid #4caf50',
          backdropFilter: 'blur(10px)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.2s ease'
        }}>
          {trait.name}
        </div>
      </Html>
    </group>
  );
}

// Main App Component
export default function App() {
  const [stage, setStage] = useState<'solar' | 'planet' | 'trait'>('solar');
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handlePlanetClick = (persona: AIPersona) => {
    setSelectedPersona(persona);
    setStage('planet');
    setTargetPosition(persona.position);
    setIsChatOpen(true); // Open chat when clicking a planet
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
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
      overflow: 'hidden'
    }}>
      <Canvas shadows camera={{ position: [8, 6, 8], fov: 50 }}>
        {/* Dark space background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[0, 0, 0]} intensity={1} color="#fdd835" />
        
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
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
        <CameraController 
          stage={stage} 
          selectedPersona={selectedPersona} 
          selectedTrait={selectedTrait} 
          targetPosition={targetPosition} 
        />
      </Canvas>

      {/* UI Overlays with dark theme */}
      {stage === 'solar' && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.8)',
          padding: 20,
          borderRadius: 15,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          maxWidth: 400,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#fdd835', fontSize: '24px' }}>
            🌞 AI Persona Universe
          </h1>
          <p style={{ margin: '0 0 15px 0', color: '#b0b0b0', lineHeight: '1.5' }}>
            Click on any planet to explore its AI persona and traits. The Sun represents core traits inherited by all AI agents.
          </p>
          <div style={{ fontSize: '14px', color: '#888' }}>
            <strong style={{ color: '#fdd835' }}>Core Traits:</strong> {coreTraits.traits.length} inherited traits
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            <strong style={{ color: '#fdd835' }}>AI Personas:</strong> {aiPersonas.length} specialized agents
          </div>
        </div>
      )}

      {stage === 'planet' && selectedPersona && (
        <div style={{
          position: 'fixed',
          right: 20,
          top: 20,
          width: 350,
          background: 'rgba(0,0,0,0.8)',
          padding: 20,
          borderRadius: 15,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#fff' }}>
            🪐 {selectedPersona.name}
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#b0b0b0', lineHeight: '1.5' }}>
            {selectedPersona.description}
          </p>
          
          <h3 style={{ margin: '0 0 10px 0', color: selectedPersona.color }}>Traits ({selectedPersona.traits.length})</h3>
          {selectedPersona.traits.map((trait) => (
            <div key={trait.id} style={{
              background: 'rgba(255,255,255,0.05)',
              padding: 12,
              margin: '8px 0',
              borderRadius: 8,
              borderLeft: `4px solid ${selectedPersona.color}`,
              border: `1px solid rgba(255,255,255,0.1)`
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff' }}>{trait.name}</div>
              <div style={{ fontSize: '12px', color: '#b0b0b0', marginTop: 4 }}>
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
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #fdd835, #f57f17)',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 15px rgba(253, 216, 53, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
          background: 'rgba(0,0,0,0.8)',
          padding: 20,
          borderRadius: 15,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#4caf50' }}>
            🧬 {selectedTrait.name}
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#b0b0b0', lineHeight: '1.5' }}>
            {selectedTrait.description}
          </p>
          
          <div style={{ marginBottom: 15 }}>
            <strong style={{ color: '#4caf50' }}>Intensity:</strong> 
            <span style={{ color: '#fff', marginLeft: 8 }}>
              {Math.round(selectedTrait.intensity * 100)}%
            </span>
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <strong style={{ color: '#4caf50' }}>Tags:</strong>
            <div style={{ marginTop: 8 }}>
              {selectedTrait.tags.map((tag) => (
                <span key={tag} style={{
                  display: 'inline-block',
                  background: 'rgba(76, 175, 80, 0.2)',
                  color: '#4caf50',
                  padding: '4px 10px',
                  margin: '2px',
                  borderRadius: 12,
                  fontSize: '12px',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <strong style={{ color: '#4caf50' }}>Type:</strong> 
            <span style={{ color: '#fff', marginLeft: 8 }}>
              {selectedTrait.inherited ? 'Inherited from Sun' : 'Persona-specific'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setStage('planet')}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ← Back to Persona
            </button>
            <button
              onClick={handleBackToSolar}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #fdd835, #f57f17)',
                color: '#000',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ← Solar System
            </button>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        persona={selectedPersona}
      />
    </div>
  );
}
