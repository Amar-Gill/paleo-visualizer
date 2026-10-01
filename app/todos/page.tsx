import type { Metadata } from "next";
import { Todos } from "./todos";

export const metadata: Metadata = {
  title: "Todos",
};

export default function TodosPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 px-6 py-12">
      <div className="pb-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white">Todos</h1>
        <p className="text-white/60">
          The todos you add below are created inside your own database.
        </p>
      </div>
      <Todos />
    </div>
  );
}
