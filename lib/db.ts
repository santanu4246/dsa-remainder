import { PrismaClient } from "@prisma/client";

// Use a singleton pattern to prevent multiple Prisma instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new PrismaClient if one doesn't exist in the global namespace
const prisma = globalForPrisma.prisma || new PrismaClient();

// Only assign to global in development to prevent hot reload issues
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const db = prisma; 