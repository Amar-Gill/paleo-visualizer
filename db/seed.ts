// Loads .env before ./index builds the libSQL client from those vars.
import "../envConfig";

import { inArray } from "drizzle-orm";
import { db } from "./index";
import { speciesTable, type NewSpecies } from "./schema";

// Coordinates are approximate. Each one points at a well known fossil
// locality for the species rather than an exact dig site.
const SEED_SPECIES: NewSpecies[] = [
  {
    // Hell Creek Formation, near Jordan, Montana.
    name: "Tyrannosaurus rex",
    lat: 47.32,
    lng: -106.91,
    period: "cretaceous",
  },
  {
    // Huincul Formation, near Plaza Huincul, Neuquen, Argentina.
    name: "Mapusaurus",
    lat: -38.93,
    lng: -69.2,
    period: "cretaceous",
  },
  {
    // Candeleros Formation, near Villa El Chocon, Neuquen, Argentina.
    name: "Giganotosaurus",
    lat: -39.27,
    lng: -68.78,
    period: "cretaceous",
  },
  {
    // Dinosaur Provincial Park, Alberta, as requested. Note that real
    // Allosaurus finds come from the Jurassic Morrison Formation in the
    // western US, not from Alberta's Cretaceous beds.
    name: "Allosaurus",
    lat: 50.77,
    lng: -111.49,
    period: "jurassic",
  },
  {
    // Paluxy River trackways, near Glen Rose, Texas.
    name: "Acrocanthosaurus",
    lat: 32.23,
    lng: -97.75,
    period: "cretaceous",
  },
];

// Inserts by name and skips anything already stored, so it is safe to re-run
// and to extend with more species later.
async function seed() {
  const existing = await db
    .select({ name: speciesTable.name })
    .from(speciesTable)
    .where(
      inArray(
        speciesTable.name,
        SEED_SPECIES.map((species) => species.name),
      ),
    );

  const existingNames = new Set(existing.map((row) => row.name));
  const toInsert = SEED_SPECIES.filter(
    (species) => !existingNames.has(species.name),
  );

  if (toInsert.length === 0) {
    console.log(`All ${SEED_SPECIES.length} species already present.`);
    return;
  }

  await db.insert(speciesTable).values(toInsert);

  console.log(`Inserted ${toInsert.length} species:`);
  for (const species of toInsert) console.log(`  ${species.name}`);
  if (existingNames.size > 0) {
    console.log(`Skipped ${existingNames.size} already present.`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
