import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
export const db = globalThis.cachedPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.cachedPrisma = db;
} 