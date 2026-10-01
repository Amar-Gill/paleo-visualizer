import type { Metadata } from "next";
import { CubeScene } from "./cube-scene";

export const metadata: Metadata = {
  title: "Viewer",
};

export default function ViewerPage() {
  // flex-1 fills the space below the nav; the absolute child gives the
  // canvas a definite size to measure.
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        <CubeScene />
      </div>
      <div className="pointer-events-none absolute left-6 top-6">
        <h1 className="text-lg font-black tracking-tight">Viewer</h1>
        <p className="text-sm text-foreground/60">
          Drag to rotate · Scroll to zoom · Right-drag to pan
        </p>
      </div>
    </div>
  );
}
