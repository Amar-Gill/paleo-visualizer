import { asc } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { speciesTable } from "@/db/schema";
import { GlobeScene } from "./globe-scene";
import { SpeciesSelect } from "./species-select";

export const metadata: Metadata = {
  title: "Viewer",
};

export default async function ViewerPage() {
  const species = await db
    .select()
    .from(speciesTable)
    .orderBy(asc(speciesTable.name));

  // flex-1 fills the space below the nav; the absolute child gives the
  // canvas a definite size to measure.
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        <GlobeScene />
      </div>
      {/* pointer-events-none lets drags reach the globe; the dropdown opts
          back in so it stays clickable. */}
      <div className="pointer-events-none absolute left-6 top-6">
        <h1 className="text-lg font-black tracking-tight">Viewer</h1>
        <p className="text-sm text-foreground/60">
          Drag to rotate · Scroll to zoom
        </p>
        <div className="pointer-events-auto mt-4">
          <SpeciesSelect species={species} />
        </div>
      </div>
    </div>
  );
}
