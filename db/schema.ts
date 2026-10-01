import { sql } from "drizzle-orm";
import { check, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todosTable = sqliteTable("todos", {
  id: integer().primaryKey({ autoIncrement: true }),
  description: text().notNull(),
  completed: integer({ mode: "boolean" }).notNull().default(false),
});

/** Prehistoric periods a species can belong to. */
export const SPECIES_PERIODS = ["cretaceous", "jurassic", "triassic"] as const;

export type SpeciesPeriod = (typeof SPECIES_PERIODS)[number];

export const speciesTable = sqliteTable(
  "species",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    // Decimal degrees: lat is -90..90, lng is -180..180.
    lat: real().notNull(),
    lng: real().notNull(),
    period: text({ enum: SPECIES_PERIODS }).notNull(),
  },
  (table) => [
    // `enum` above is only a TypeScript type, so the values are repeated here
    // to enforce them in the database as well. Keep the two lists in sync.
    check(
      "species_period_check",
      sql`${table.period} IN ('cretaceous', 'jurassic', 'triassic')`,
    ),
  ],
);

export type Species = typeof speciesTable.$inferSelect;
export type NewSpecies = typeof speciesTable.$inferInsert;
