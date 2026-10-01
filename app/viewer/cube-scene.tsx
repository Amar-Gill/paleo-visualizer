"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

// Fills its parent element, so the parent must have an explicit size.
export function CubeScene() {
  return (
    <Canvas camera={{ position: [4, 3, 5], fov: 45 }}>
      <ambientLight intensity={0.4} />
      {/* Key light, plus a dimmer fill from the opposite side so no face is flat. */}
      <directionalLight position={[4, 6, 3]} intensity={2.5} />
      <directionalLight position={[-4, -2, -3]} intensity={0.75} />

      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#e07a5f" />
      </mesh>

      {/* Drag to rotate, scroll/pinch to zoom, right-drag/two-finger drag to pan. */}
      <OrbitControls makeDefault minDistance={3} maxDistance={15} />
    </Canvas>
  );
}
