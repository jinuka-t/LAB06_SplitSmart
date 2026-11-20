export function balances(
  expenses: { status: string; payerId: string; shares: { personId: string; cents: number }[] }[],
  payments: { senderId: string; recipientId: string; cents: number }[],
) {
  const pairs = new Map<string, { from: string; to: string; cents: number }>();
  function add(from: string, to: string, cents: number) {
    if (from === to) return;
    const [first, second] = [from, to].sort();
    const key = JSON.stringify([first, second]);
    const total = (pairs.get(key)?.cents ?? 0) + (from === first ? cents : -cents);
    pairs.set(key, { from: first, to: second, cents: total });
  }
  for (const expense of expenses) {
    if (expense.status !== "approved") continue;
    for (const share of expense.shares) add(share.personId, expense.payerId, share.cents);
  }
  for (const payment of payments) add(payment.senderId, payment.recipientId, -payment.cents);
  return [...pairs.values()].filter(pair => pair.cents !== 0).map(pair =>
    pair.cents > 0 ? pair : { from: pair.to, to: pair.from, cents: -pair.cents },
  );
}

export function memberNetBalances(pairs: ReturnType<typeof balances>) {
  const net = new Map<string, number>();
  for (const { from, to, cents } of pairs) {
    net.set(from, (net.get(from) ?? 0) - cents);
    net.set(to, (net.get(to) ?? 0) + cents);
  }
  return net;
}
