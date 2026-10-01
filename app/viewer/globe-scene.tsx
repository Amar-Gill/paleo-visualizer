"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { lazy, Suspense } from "react";

// three-globe reads `window` as soon as it's imported, which crashes Next.js's
// server render. Canvas children only ever render in the browser, so loading
// the globe lazily inside the Canvas keeps it off the server entirely.
const R3fGlobe = lazy(() => import("r3f-globe"));

// Fills its parent element, so the parent must have an explicit size.
export function GlobeScene() {
  // `flat` disables tone mapping so the earth texture keeps its true colors.
  return (
    <Canvas flat camera={{ position: [0, 0, 350], fov: 50 }}>
      {/* Lighting from the three-globe examples. */}
      <ambientLight color={0xcccccc} intensity={Math.PI} />
      <directionalLight intensity={0.6 * Math.PI} />

      <Suspense fallback={null}>
        <R3fGlobe
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
          // The intro animation stalls under React StrictMode (on by default
          // in `next dev`), which leaves the globe invisible, so skip it.
          animateIn={false}
        />
      </Suspense>

      {/* The globe radius is 100 units. Panning is off so it always orbits the
          globe's center, and maxDistance keeps it inside the camera's default
          far plane (1000) so it never gets clipped. */}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={101}
        maxDistance={800}
      />
    </Canvas>
  );
}
