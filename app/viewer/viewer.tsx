"use client";

import { useState } from "react";

import type { Species } from "@/db/schema";
import { GlobeScene } from "./globe-scene";
import { SpeciesSelect } from "./species-select";

// Owns the selected species so the dropdown and the globe stay in step.
export function Viewer({ species }: { species: Species[] }) {
  const [selected, setSelected] = useState<Species | null>(null);

  // flex-1 fills the space below the nav; the absolute child gives the
  // canvas a definite size to measure.
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        <GlobeScene selected={selected} />
      </div>
      {/* pointer-events-none lets drags reach the globe; the dropdown opts
          back in so it stays clickable. */}
      <div className="pointer-events-none absolute left-6 top-6">
        <h1 className="text-lg font-black tracking-tight">Viewer</h1>
        <p className="text-sm text-foreground/60">
          Drag to rotate · Scroll to zoom
        </p>
        <div className="pointer-events-auto mt-4">
          <SpeciesSelect
            species={species}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </div>
    </div>
  );
}
