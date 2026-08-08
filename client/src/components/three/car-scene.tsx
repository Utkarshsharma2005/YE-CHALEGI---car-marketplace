import { useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Float } from "@react-three/drei";
import type { Group } from "three";

/** A stylised sculptural car form built from primitives — light, no external assets. */
function CarBody({ color, autoSpin }: { color: string; autoSpin: boolean }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (autoSpin && group.current) group.current.rotation.y += delta * 0.28;
    if (group.current) group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
  });

  const paint: ThreeElements["meshStandardMaterial"] = {
    color,
    metalness: 0.85,
    roughness: 0.22,
  };

  return (
    <group ref={group} rotation={[0, Math.PI / 5, 0]}>
      {/* lower body */}
      <mesh castShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[3.5, 0.42, 1.55]} />
        <meshStandardMaterial {...paint} />
      </mesh>
      {/* mid shoulder */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[3.2, 0.3, 1.62]} />
        <meshStandardMaterial {...paint} />
      </mesh>
      {/* cabin */}
      <mesh castShadow position={[-0.12, 1.02, 0]}>
        <boxGeometry args={[1.7, 0.42, 1.32]} />
        <meshStandardMaterial color="#0e0e11" metalness={0.6} roughness={0.1} />
      </mesh>
      {/* nose */}
      <mesh castShadow position={[1.88, 0.5, 0]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.6, 0.26, 1.45]} />
        <meshStandardMaterial {...paint} />
      </mesh>
      {/* rear wing */}
      <mesh castShadow position={[-1.82, 0.95, 0]}>
        <boxGeometry args={[0.5, 0.06, 1.5]} />
        <meshStandardMaterial color="#141416" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* headlights */}
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} position={[2.14, 0.55, z]}>
          <boxGeometry args={[0.06, 0.08, 0.4]} />
          <meshStandardMaterial color="#fff2d0" emissive="#ffd27a" emissiveIntensity={2.4} />
        </mesh>
      ))}
      {/* tail light bar */}
      <mesh position={[-2.02, 0.68, 0]}>
        <boxGeometry args={[0.05, 0.07, 1.3]} />
        <meshStandardMaterial color="#ff5a3c" emissive="#ff3b1f" emissiveIntensity={2.6} />
      </mesh>
      {/* wheels */}
      {(
        [
          [1.2, 0.78],
          [1.2, -0.78],
          [-1.2, 0.78],
          [-1.2, -0.78],
        ] as const
      ).map(([x, z]) => (
        <mesh key={`${x}${z}`} castShadow position={[x, 0.38, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.26, 32]} />
          <meshStandardMaterial color="#101012" metalness={0.7} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

export default function CarScene({
  color = "#c9ccd2",
  autoSpin = true,
  interactive = true,
}: {
  color?: string;
  autoSpin?: boolean;
  interactive?: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [5.5, 2.6, 5.5], fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0f0f11"]} />
      <fog attach="fog" args={["#0f0f11", 9, 20]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[6, 8, 4]} angle={0.4} penumbra={1} intensity={140} castShadow />
      <pointLight position={[-6, 3, -4]} intensity={60} color="#ffb26b" />
      <pointLight position={[0, 2, 7]} intensity={35} color="#7aa2ff" />
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25}>
        <CarBody color={color} autoSpin={autoSpin} />
      </Float>
      <ContactShadows position={[0, 0, 0]} opacity={0.65} scale={14} blur={2.6} far={5} />
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.15}
          dampingFactor={0.06}
        />
      )}
    </Canvas>
  );
}
