"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { MathUtils, Spherical, type EventDispatcher } from "three";

import type { Species } from "@/db/schema";

// three-globe reads `window` as soon as it's imported, which crashes Next.js's
// server render. Canvas children only ever render in the browser, so loading
// the globe lazily inside the Canvas keeps it off the server entirely.
//
// r3f-globe 1.6.0 throws on unmount ("this is undefined"). It's fixed by
// patches/r3f-globe+1.6.0.patch, which patch-package applies on `npm install`.
const R3fGlobe = lazy(() => import("r3f-globe"));

const GLOBE_IMAGE_URL =
  "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg";

// r3f-globe re-applies a prop whenever its identity changes, so these stay
// outside the component to keep their references stable between renders.
const NO_SPECIES: Species[] = [];
const markerColor = () => "#ff3b30";

const FLIGHT_MS = 1200;

// R3F types state.controls as a bare EventDispatcher; this is the part of
// OrbitControls we actually touch.
type OrbitLikeControls = EventDispatcher & {
  enabled: boolean;
  update: () => void;
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Swings the camera around to face a species' coordinates.
 *
 * phi/theta mirror three-globe's own lat/lng maths, so the camera lands
 * exactly on the marker. The current zoom distance is left alone.
 */
function FlyToSpecies({ target }: { target: Species | null }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree(
    (state) => state.controls,
  ) as OrbitLikeControls | null;

  const flight = useRef<{
    from: Spherical;
    toPhi: number;
    deltaTheta: number;
    startedAt: number;
  } | null>(null);
  const scratch = useRef(new Spherical());

  useEffect(() => {
    if (!target) return;

    const from = new Spherical().setFromVector3(camera.position);
    const toPhi = MathUtils.degToRad(90 - target.lat);
    const toTheta = MathUtils.degToRad(target.lng);

    // Go the short way round instead of unwinding the long way.
    let deltaTheta = (toTheta - from.theta) % (Math.PI * 2);
    if (deltaTheta > Math.PI) deltaTheta -= Math.PI * 2;
    if (deltaTheta < -Math.PI) deltaTheta += Math.PI * 2;

    flight.current = { from, toPhi, deltaTheta, startedAt: performance.now() };

    // drei only calls controls.update() while they're enabled, so switching
    // them off hands the camera over for the length of the flight.
    if (controls) controls.enabled = false;

    return () => {
      flight.current = null;
      if (controls) controls.enabled = true;
    };
  }, [target, camera, controls]);

  useFrame(() => {
    const current = flight.current;
    if (!current) return;

    const progress = Math.min(
      1,
      (performance.now() - current.startedAt) / FLIGHT_MS,
    );
    const eased = easeInOutCubic(progress);

    scratch.current.set(
      current.from.radius,
      MathUtils.lerp(current.from.phi, current.toPhi, eased),
      current.from.theta + current.deltaTheta * eased,
    );
    camera.position.setFromSpherical(scratch.current);
    // Panning is disabled, so the orbit target stays at the globe's centre.
    camera.lookAt(0, 0, 0);

    if (progress === 1) {
      flight.current = null;
      if (controls) {
        controls.enabled = true;
        controls.update();
      }
    }
  });

  return null;
}

// Fills its parent element, so the parent must have an explicit size.
export function GlobeScene({ selected }: { selected: Species | null }) {
  // Species rows already expose `lat`/`lng`, which are the accessors
  // r3f-globe's points layer looks for by default.
  const pointsData = useMemo(
    () => (selected ? [selected] : NO_SPECIES),
    [selected],
  );

  // `flat` disables tone mapping so the earth texture keeps its true colors.
  return (
    <Canvas flat camera={{ position: [0, 0, 350], fov: 50 }}>
      {/* Lighting from the three-globe examples. */}
      <ambientLight color={0xcccccc} intensity={Math.PI} />
      <directionalLight intensity={0.6 * Math.PI} />

      <Suspense fallback={null}>
        <R3fGlobe
          globeImageUrl={GLOBE_IMAGE_URL}
          // The intro animation stalls under React StrictMode (on by default
          // in `next dev`), which leaves the globe invisible, so skip it.
          animateIn={false}
          pointsData={pointsData}
          pointColor={markerColor}
          pointRadius={0.8}
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

      <FlyToSpecies target={selected} />
    </Canvas>
  );
}
