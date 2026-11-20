import "dotenv/config";
process.env.DATABASE_URL ??= "file:./dev.db";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await db.$transaction(async (tx) => {
    const people = { alex: "Alex Morgan", maya: "Maya Chen", jordan: "Jordan Lee", sam: "Sam Rivera", priya: "Priya Patel" };
    for (const [id, name] of Object.entries(people)) {
      await tx.person.upsert({ where: { id }, update: {}, create: { id, name } });
    }
    const groups = [
      ["weekend", "Weekend in Lisbon", "Flights, food, and a few days in Portugal.", "trip", ["alex", "maya", "jordan", "sam"]],
      ["home", "The Apartment", "Monthly bills and shared household essentials.", "home", ["alex", "maya", "priya"]],
      ["dinner", "Friday Dinner Club", "Good food with the Friday regulars.", "food", ["alex", "sam", "priya"]],
    ];
    for (const [id, name, description, theme, members] of groups) {
      await tx.group.upsert({ where: { id }, update: {}, create: {
        id, name, description, theme, members: { connect: members.map(id => ({ id })) },
      } });
    }
    const day = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
    const expenses = [
      ["stay", "Lisbon Airbnb", 64000, "alex", "weekend", 9, "approved", ["alex","maya","jordan","sam"]],
      ["power", "Monthly utilities", 14400, "priya", "home", 7, "approved", ["alex","maya","priya"]],
      ["meal", "Dinner at Lilia", 12600, "sam", "dinner", 5, "approved", ["alex","sam","priya"]],
      ["ride", "Airport transfer", 4800, "maya", "weekend", 2, "pending", ["alex","maya","jordan","sam"]],
      ["market", "Household groceries", 7650, "alex", "home", 1, "pending", ["alex","maya","priya"]],
    ];
    for (const [key, description, cents, payerId, groupId, offset, status, members] of expenses) {
      const id = "demo-" + key;
      await tx.expense.upsert({ where: { id }, update: {}, create: {
        id, description, cents, payerId, groupId, date: day(offset), status, method: "equal",
        shares: { create: members.map((personId, position) => ({ personId, position, cents: cents / members.length })) },
      } });
    }
    await tx.payment.upsert({ where: { id: "demo-settlement" }, update: {}, create: {
      id: "demo-settlement", groupId: "weekend", cents: 5000, senderId: "maya", recipientId: "alex", date: day(3),
    } });
  });
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
