import "dotenv/config";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL ?? "file:./dev.db",
});

try {
  const tables = await db.$queryRaw`SELECT name FROM sqlite_master
    WHERE type = 'table' AND name IN ('EnvironmentCheck', '_prisma_migrations')`;
  if (tables.length === 1 && tables[0].name === "EnvironmentCheck") {
    const require = createRequire(import.meta.url);
    const result = spawnSync(process.execPath, [
      require.resolve("prisma/build/index.js"), "migrate", "resolve",
      "--applied", "20261119000000_environment_check",
    ], { stdio: "inherit" });
    if (result.status !== 0) throw result.error ?? new Error("Could not baseline the existing prototype database.");
  }
} finally {
  await db.$disconnect();
}
