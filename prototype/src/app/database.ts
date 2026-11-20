import { PrismaClient } from "@prisma/client";

const globalDb = globalThis as typeof globalThis & { splitSmartDb?: PrismaClient };
export const db = globalDb.splitSmartDb ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL ?? "file:./dev.db",
});
if (process.env.NODE_ENV !== "production") globalDb.splitSmartDb = db;

export function readGroups() {
  return db.group.findMany({
    orderBy: { id: "desc" },
    include: {
      members: { orderBy: { name: "asc" } },
      expenses: { include: { shares: { orderBy: { position: "asc" } } }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] },
      payments: { orderBy: [{ date: "desc" }, { createdAt: "desc" }] },
    },
  });
}
export type Groups = Awaited<ReturnType<typeof readGroups>>;
