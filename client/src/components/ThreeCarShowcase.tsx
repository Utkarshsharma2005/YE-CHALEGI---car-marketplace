import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Low-poly futuristic cyber sports car model
const CyberCarModel = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Auto idle rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      
      {/* Lower Chassis / Floorboard */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.15, 1.5]} />
        <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.9} />
      </mesh>

      {/* Main Streamlined Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[3.0, 0.35, 1.4]} />
        <meshStandardMaterial color="#0A0A0F" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Tapered Front Hood */}
      <mesh position={[0.9, 0.4, 0]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[1.2, 0.25, 1.35]} />
        <meshStandardMaterial color="#0A0A0F" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Windshield / Translucent Cyber Cabin */}
      <mesh position={[-0.1, 0.75, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[1.2, 0.4, 1.1]} />
        <meshStandardMaterial 
          color="#00D2FF" 
          transparent 
          opacity={0.4} 
          roughness={0.0} 
          metalness={1.0} 
        />
      </mesh>

      {/* Cyber Cabin Roof */}
      <mesh position={[-0.3, 0.96, 0]} castShadow>
        <boxGeometry args={[0.9, 0.04, 1.0]} />
        <meshStandardMaterial color="#0A0A0F" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Neon Emerald Side Accent Strips */}
      <mesh position={[0, 0.46, 0.71]}>
        <boxGeometry args={[2.2, 0.03, 0.02]} />
        <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[0, 0.46, -0.71]}>
        <boxGeometry args={[2.2, 0.03, 0.02]} />
        <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={2.5} />
      </mesh>

      {/* Glowing Front Grill Bar */}
      <mesh position={[1.51, 0.38, 0]}>
        <boxGeometry args={[0.02, 0.05, 1.1]} />
        <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={3.0} />
      </mesh>

      {/* Cyber Headlights (Slit neon bars) */}
      <mesh position={[1.48, 0.44, 0.45]}>
        <boxGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color="#00D2FF" emissive="#00D2FF" emissiveIntensity={3.5} />
      </mesh>
      <mesh position={[1.48, 0.44, -0.45]}>
        <boxGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color="#00D2FF" emissive="#00D2FF" emissiveIntensity={3.5} />
      </mesh>

      {/* Rear Hex-Lights */}
      <mesh position={[-1.51, 0.5, 0.4]}>
        <boxGeometry args={[0.02, 0.08, 0.2]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={3.0} />
      </mesh>
      <mesh position={[-1.51, 0.5, -0.4]}>
        <boxGeometry args={[0.02, 0.08, 0.2]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={3.0} />
      </mesh>

      {/* Front Wheels (Futuristic hollow rims) */}
      <group position={[0.9, 0.15, 0.8]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.28, 32]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        {/* Neon Rim ring */}
        <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.04, 8, 24]} />
          <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={3.0} />
        </mesh>
      </group>
      <group position={[0.9, 0.15, -0.8]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.28, 32]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        {/* Neon Rim ring */}
        <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.04, 8, 24]} />
          <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={3.0} />
        </mesh>
      </group>

      {/* Rear Wheels */}
      <group position={[-0.9, 0.15, 0.8]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.28, 32]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        {/* Neon Rim ring */}
        <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.04, 8, 24]} />
          <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={3.0} />
        </mesh>
      </group>
      <group position={[-0.9, 0.15, -0.8]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.28, 32]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        {/* Neon Rim ring */}
        <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.04, 8, 24]} />
          <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={3.0} />
        </mesh>
      </group>

    </group>
  );
};

export const ThreeCarShowcase: React.FC = () => {
  return (
    <div className="w-full h-[400px] border border-white/10 rounded-2xl overflow-hidden bg-[#0A0A0F] relative cursor-grab active:cursor-grabbing">
      <div className="absolute top-4 left-4 z-10 font-monoSpec text-[10px] tracking-widest text-textMuted bg-bgDark/80 border border-white/5 px-2.5 py-1 rounded-md uppercase">
        YE CHALEGI // PROCEDURAL 3D SHADER CORE
      </div>
      <Canvas
        shadows
        camera={{ position: [3.5, 1.8, 3.5], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#07070A']} />
        
        {/* Lighting scheme matching futuristic cyber aesthetic */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.8}
          castShadow
        />
        <pointLight position={[-4, 4, -4]} intensity={0.6} color="#00D2FF" />
        <spotLight position={[0, 5, 0]} intensity={2.0} color="#00F5A0" distance={8} angle={Math.PI / 4} penumbra={0.5} />

        {/* Model */}
        <CyberCarModel />

        {/* Floor cyber grid */}
        <gridHelper args={[24, 24, '#00F5A0', '#1F2937']} position={[0, -0.85, 0]} />

        {/* Camera controls */}
        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  );
};
export default ThreeCarShowcase;
