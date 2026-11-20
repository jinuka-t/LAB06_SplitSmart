import { db } from "./database";
import { balances } from "./ledger";

function decimal(value: string) {
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(value)) return NaN;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export async function save(data: FormData) {
  const field = (name: string) => String(data.get(name) ?? "").trim();
  try {
    const kind = field("kind");
    const id = field("id");
    if (kind === "group" || kind === "member") {
      const name = field("name");
      if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Refresh the page and try again." };
      if (!name || name.length > 80) return { error: "Enter a name of up to 80 characters." };
      if (kind === "group") {
        const description = field("description");
        if (description.length > 180) return { error: "Keep the description to 180 characters." };
        await db.group.upsert({
          where: { id }, update: {},
          create: { id, name, description, theme: "group" },
        });
      } else {
        const groupId = field("groupId");
        const error = await db.$transaction(async (tx) => {
          const group = await tx.group.findUnique({ where: { id: groupId }, include: { members: true } });
          if (!group) return "Choose an existing group.";
          if (group.members.some(person => person.id === id)) return;
          if (group.members.some(person => person.name.toLowerCase() === name.toLowerCase())) {
            return "A member with this name is already in the group.";
          }
          await tx.person.create({ data: { id, name, groups: { connect: { id: groupId } } } });
        });
        if (error) return { error };
      }
      return { error: "" };
    }
    if (kind === "approved" || kind === "rejected") {
      const result = await db.expense.updateMany({ where: { id, status: "pending" }, data: { status: kind } });
      if (!result.count) return { error: "This expense has already been reviewed. Refresh to see its status." };
    } else {
      const groupId = field("groupId");
      const date = field("date");
      const cents = decimal(field("amount"));
      if (!(cents > 0 && cents <= 2147483647)) return { error: "Enter a positive amount up to $21,474,836.47 with up to two decimal places." };
      const parsed = new Date(date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== date) {
        return { error: "Enter a valid date." };
      }
      if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Refresh the page and try again." };

      const error = await db.$transaction(async (tx) => {
        const group = await tx.group.findUnique({ where: { id: groupId }, include: { members: true } });
        if (!group) return "Choose an existing group.";
        const member = (personId: string) => group.members.some(person => person.id === personId);
        if (kind === "expense") {
          if (await tx.expense.findUnique({ where: { id } })) return;
          const description = field("description");
          const payerId = field("payerId");
          const method = field("method");
          const participants = data.getAll("participant").map(String);
          if (!description || description.length > 100) return "Enter a description of up to 100 characters.";
          if (!member(payerId)) return "Choose a payer from the group.";
          if (!participants.length || new Set(participants).size !== participants.length || !participants.every(member)) return "Choose at least one participant from the group.";
          if (method !== "equal" && method !== "percentage") return "Choose a split method.";
          const weights = participants.map(personId => method === "equal" ? 1 : decimal(field("percent-" + personId)));
          const divisor = method === "equal" ? participants.length : 10000;
          if (weights.some(weight => !Number.isFinite(weight) || weight > 10000) ||
              weights.reduce((sum, weight) => sum + weight, 0) !== divisor) {
            return "Enter percentages from 0 to 100 that total exactly 100%.";
          }
          const shares = participants.map((personId, position) => {
            const quota = cents * weights[position];
            return { personId, position, cents: Math.floor(quota / divisor), remainder: quota % divisor,
              percent: method === "percentage" ? weights[position] : null };
          });
          const leftover = cents - shares.reduce((sum, share) => sum + share.cents, 0);
          const ranked = [...shares].sort((a, b) => b.remainder - a.remainder || a.position - b.position);
          for (const share of ranked.slice(0, leftover)) share.cents++;
          await tx.expense.create({ data: {
            id, groupId, description, date, cents, payerId, method,
            shares: { create: shares.map(({ personId, position, cents, percent }) => ({ personId, position, cents, percent })) },
          } });
        } else if (kind === "payment") {
          if (await tx.payment.findUnique({ where: { id } })) return;
          const senderId = field("senderId");
          const recipientId = field("recipientId");
          if (!member(senderId) || !member(recipientId) || senderId === recipientId) return "Choose two different group members.";
          const expenses = await tx.expense.findMany({ where: { groupId, status: "approved" }, include: { shares: true } });
          const payments = await tx.payment.findMany({ where: { groupId } });
          const owed = balances(expenses, payments).find(pair => pair.from === senderId && pair.to === recipientId)?.cents ?? 0;
          if (cents > owed) return "The payment exceeds the amount this sender owes the recipient.";
          await tx.payment.create({ data: { id, groupId, senderId, recipientId, date, cents } });
        } else {
          return "Choose a valid action.";
        }
      });
      if (error) return { error };
    }
    return { error: "" };
  } catch (error) {
    console.error("SplitSmart could not save the change", error);
    return { error: "The change could not be confirmed. Please try again." };
  }
}
