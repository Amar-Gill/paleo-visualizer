import { asc } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { speciesTable } from "@/db/schema";
import { Viewer } from "./viewer";

export const metadata: Metadata = {
  title: "Viewer",
};

export default async function ViewerPage() {
  const species = await db
    .select()
    .from(speciesTable)
    .orderBy(asc(speciesTable.name));

  return <Viewer species={species} />;
}
