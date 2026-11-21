import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function initDatabasePragmas(): Promise<void> {
  try {
    await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
    await prisma.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
    await prisma.$queryRawUnsafe("PRAGMA cache_size = -64000;");
    await prisma.$queryRawUnsafe("PRAGMA foreign_keys = ON;");
  } catch (err) {
    // Graceful fallback for pragmas
  }
}
