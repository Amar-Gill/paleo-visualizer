"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  DoubleSide,
  MathUtils,
  Spherical,
  Vector3,
  type EventDispatcher,
  type Mesh,
  type MeshBasicMaterial,
} from "three";

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

const MARKER_COLOR = "#ff3b30";
const GLOBE_RADIUS = 100;

// r3f-globe re-applies a prop whenever its identity changes, so these stay
// outside the component to keep their references stable between renders.
const NO_SPECIES: Species[] = [];
const markerColor = () => MARKER_COLOR;

const FLIGHT_MS = 1200;

// One pulse of the halo, in seconds.
const PULSE_SECONDS = 1.8;
const PULSE_MAX_SCALE = 3.5;

// Where the info card floats, in globe radii. The pin tips out at 1.2.
const CARD_RADIUS = GLOBE_RADIUS * 1.38;

// R3F types state.controls as a bare EventDispatcher; this is the part of
// OrbitControls we actually touch.
type OrbitLikeControls = EventDispatcher & {
  enabled: boolean;
  update: () => void;
};

/** Mirrors three-globe's own lat/lng -> position maths. */
function speciesPosition(species: Species, radius: number) {
  return new Vector3().setFromSpherical(
    new Spherical(
      radius,
      MathUtils.degToRad(90 - species.lat),
      MathUtils.degToRad(species.lng),
    ),
  );
}

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

/**
 * A halo that repeatedly expands and fades at the selected species, to draw
 * the eye to the pin.
 *
 * Driven by R3F's own frame loop rather than three-globe's rings layer,
 * because three-globe's internal ticker is paused by React StrictMode in dev.
 */
function SelectionPulse({ target }: { target: Species | null }) {
  const ring = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);

  useEffect(() => {
    if (!target || !ring.current) return;

    // Sit just above the surface, matching the pin's coordinates.
    ring.current.position.copy(speciesPosition(target, GLOBE_RADIUS * 1.01));
    // Ring geometry faces +Z, so aiming it at the centre lays it flat on the
    // surface. Same trick three-globe uses to stand its points up.
    ring.current.lookAt(0, 0, 0);
  }, [target]);

  useFrame((state) => {
    if (!ring.current || !material.current) return;

    const progress =
      (state.clock.getElapsedTime() % PULSE_SECONDS) / PULSE_SECONDS;
    ring.current.scale.setScalar(1 + progress * (PULSE_MAX_SCALE - 1));
    material.current.opacity = 0.7 * (1 - progress);
  });

  if (!target) return null;

  return (
    <mesh ref={ring}>
      <ringGeometry args={[3, 4.2, 64]} />
      <meshBasicMaterial
        ref={material}
        color={MARKER_COLOR}
        transparent
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Info card anchored above the pin, drawn as real DOM through drei's <Html>.
 *
 * Hidden once the species rotates to the far side of the globe. Rather than
 * drei's `occlude`, which raycasts the whole scene every frame and would be
 * blocked by our own pin and halo, this uses the exact horizon test: a point
 * P on a sphere of radius R is visible from camera C when P·C > R².
 */
function SpeciesCard({
  species,
  onClose,
}: {
  species: Species;
  onClose: () => void;
}) {
  const anchor = useMemo(
    () => speciesPosition(species, CARD_RADIUS),
    [species],
  );
  const surface = useMemo(
    () => speciesPosition(species, GLOBE_RADIUS),
    [species],
  );
  const [behindGlobe, setBehindGlobe] = useState(false);
  const behindGlobeRef = useRef(false);

  useFrame((state) => {
    const hidden = surface.dot(state.camera.position) <= GLOBE_RADIUS ** 2;
    // Only touch state when it actually flips, so this doesn't queue React
    // work on every single frame.
    if (hidden !== behindGlobeRef.current) {
      behindGlobeRef.current = hidden;
      setBehindGlobe(hidden);
    }
  });

  if (behindGlobe) return null;

  return (
    <Html position={anchor} center zIndexRange={[50, 0]}>
      <div className="w-56 rounded-lg border border-foreground/15 bg-background/95 p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-black tracking-tight">{species.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close species details"
            className="-mr-1 -mt-1 cursor-pointer rounded px-1.5 text-foreground/50 transition hover:bg-foreground/10 hover:text-foreground"
          >
            ×
          </button>
        </div>
        <dl className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/60">Period</dt>
            <dd className="capitalize">{species.period}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/60">Latitude</dt>
            <dd>{species.lat.toFixed(2)}°</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/60">Longitude</dt>
            <dd>{species.lng.toFixed(2)}°</dd>
          </div>
        </dl>
      </div>
    </Html>
  );
}

// Fills its parent element, so the parent must have an explicit size.
export function GlobeScene({
  selected,
  onClose,
}: {
  selected: Species | null;
  onClose: () => void;
}) {
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
          pointRadius={1.6}
          pointAltitude={0.2}
          // Without this the pin is positioned by a tween, and three-globe's
          // ticker is paused by StrictMode in dev, which would leave the pin
          // stuck at the globe's centre. 0 applies it immediately instead.
          pointsTransitionDuration={0}
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

      <SelectionPulse target={selected} />
      <FlyToSpecies target={selected} />
      {selected && <SpeciesCard species={selected} onClose={onClose} />}
    </Canvas>
  );
}
