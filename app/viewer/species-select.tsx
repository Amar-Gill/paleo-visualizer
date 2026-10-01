"use client";

import { useState } from "react";

import type { Species } from "@/db/schema";

export function SpeciesSelect({ species }: { species: Species[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = species.find((item) => item.id === selectedId) ?? null;

  if (species.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        No species found. Run <code>npm run db:seed</code> to add some.
      </p>
    );
  }

  return (
    <div>
      <label htmlFor="species" className="sr-only">
        Species
      </label>
      <select
        id="species"
        value={selectedId ?? ""}
        onChange={(event) =>
          setSelectedId(event.target.value ? Number(event.target.value) : null)
        }
        className="rounded border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground"
      >
        <option value="">Select a species…</option>
        {species.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {selected && (
        <p className="mt-2 text-sm text-foreground/60">
          <span className="capitalize">{selected.period}</span> ·{" "}
          {selected.lat.toFixed(2)}, {selected.lng.toFixed(2)}
        </p>
      )}
    </div>
  );
}
