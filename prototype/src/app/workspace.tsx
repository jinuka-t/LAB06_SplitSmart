"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Groups } from "./database";
import { useRouter } from "next/navigation";
import { balances } from "./ledger";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (cents: number) => currency.format(cents / 100);
const dateLabel = (date: string) => new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
const total = (items: { cents: number }[]) => items.reduce((sum, item) => sum + item.cents, 0);
const themes: Record<string, string> = { trip: "✈", home: "⌂", food: "♨" };
type Group = Groups[number];
type Expense = Group["expenses"][number];
type Screen = "Overview" | "Groups" | "Approvals" | "Reports";

export default function Workspace({ groups }: { groups: Groups }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("Overview");
  const [selected, setSelected] = useState("");
  const [editor, setEditor] = useState<{ kind: "expense" | "payment"; groupId: string; id: string }>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reportGroup, setReportGroup] = useState("");
  const [notice, setNotice] = useState("");
  const [issue, setIssue] = useState("");
  const [busy, start] = useTransition();
  const group = groups.find(item => item.id === selected);
  const ledgers = groups.map(group => ({ group, pairs: balances(group.expenses, group.payments) }));
  const allPairs = ledgers.flatMap(item => item.pairs);
  const receivable = total(allPairs.filter(pair => pair.to === "alex"));
  const payable = total(allPairs.filter(pair => pair.from === "alex"));
  const expenses = groups.flatMap(group => group.expenses.map(expense => ({ ...expense, group })));
  const payments = groups.flatMap(group => group.payments.map(payment => ({ ...payment, group })));
  const pending = expenses.filter(expense => expense.status === "pending");
  const name = (group: Group, id: string) => group.members.find(person => person.id === id)?.name ?? "Unknown member";

  function navigate(next: Screen, id = "") {
    setScreen(next);
    setSelected(id);
    setNotice("");
    setIssue("");
  }

  function edit(kind: "expense" | "payment") {
    setIssue("");
    setNotice("");
    setEditor({ kind, groupId: group?.id ?? groups[0]?.id ?? "", id: crypto.randomUUID() });
  }

  function submit(form: FormData, message: string, close = false) {
    setIssue("");
    setNotice("");
    start(async () => {
      try {
        const response = await fetch("/api/changes", {
          method: "POST",
          headers: { "X-SplitSmart-Request": "1" },
          body: form,
        });
        const result: { error: string } = await response.json();
        if (result.error) {
          setIssue(result.error);
        } else {
          if (!response.ok) throw new Error("Unexpected save response");
          router.refresh();
          if (close) setEditor(undefined);
          setNotice(message);
        }
      } catch {
        setIssue("The change could not be confirmed. Please try again.");
      }
    });
  }

  function review(id: string, decision: "approved" | "rejected") {
    const form = new FormData();
    form.set("id", id);
    form.set("kind", decision);
    submit(form, decision === "approved" ? "Expense approved. Balances updated." : "Expense rejected.");
  }

  function groupCards() {
    return groups.length ? <div className="group-grid">{ledgers.map(({ group, pairs }) => {
      const net = total(pairs.filter(pair => pair.to === "alex")) - total(pairs.filter(pair => pair.from === "alex"));
      return <button key={group.id} className="group-card" onClick={() => navigate("Groups", group.id)}>
        <span className={"group-icon " + group.theme} aria-hidden>{themes[group.theme] ?? "◈"}</span>
        <strong>{group.name}</strong><span className="muted">{group.members.length} members</span>
        <span className="group-bottom"><span className="avatars" aria-hidden>{group.members.slice(0, 4).map(person => <span key={person.id}>{person.name[0]}</span>)}</span>
        <span className={net > 0 ? "green" : net < 0 ? "red" : "muted"}>{net ? money(Math.abs(net)) : "Settled"}{net > 0 ? " owed to you" : net < 0 ? " you owe" : ""}</span></span>
      </button>;
    })}</div> : <Empty>Seed the demo database to browse groups.</Empty>;
  }

  function expenseRow(expense: Expense & { group: Group }, reviewable = false) {
    return <div className="record" key={expense.id}>
      <span className={"record-icon " + expense.group.theme} aria-hidden>{themes[expense.group.theme] ?? "◈"}</span>
      <div className="record-main"><strong>{expense.description}</strong><div className="muted">{expense.group.name} · {name(expense.group, expense.payerId)} paid · {dateLabel(expense.date)}</div>
      {reviewable && <details><summary>{expense.method === "equal" ? "Equal split" : "Percentage split"} · {expense.shares.length} participants</summary>{expense.shares.map(share => <div key={share.personId}>{name(expense.group, share.personId)} · {money(share.cents)}{share.percent !== null && ` (${share.percent / 100}%)`}</div>)}</details>}</div>
      <div className="record-amount"><strong>{money(expense.cents)}</strong><span className={"status " + expense.status}>{expense.status}</span></div>
      {reviewable && <div className="review-actions"><button disabled={busy} className="button" onClick={() => review(expense.id, "rejected")}>Reject</button><button disabled={busy} className="button primary" onClick={() => review(expense.id, "approved")}>Approve</button></div>}
    </div>;
  }

  function paymentRow(payment: typeof payments[number]) {
    return <div key={payment.id} className="record"><span className="record-icon payment-icon" aria-hidden>⇄</span><div className="record-main"><strong>{name(payment.group, payment.senderId)} paid {name(payment.group, payment.recipientId)}</strong><div className="muted">{payment.group.name} · {dateLabel(payment.date)}</div></div><div className="record-amount"><strong>{money(payment.cents)}</strong><span className="status approved">Payment</span></div></div>;
  }

  const activity = [...expenses.map(item => ({ ...item, type: "expense" as const })), ...payments.map(item => ({ ...item, type: "payment" as const }))]
    .sort((a, b) => b.date.localeCompare(a.date) || +new Date(b.createdAt) - +new Date(a.createdAt));
  const reportInvalid = Boolean(from && to && from > to);
  const matching = activity.filter(item => !reportInvalid && (!reportGroup || item.groupId === reportGroup) && (!from || item.date >= from) && (!to || item.date <= to));
  const approved = matching.filter(item => item.type === "expense" && item.status === "approved");
  const settlements = matching.filter(item => item.type === "payment");
  const title = group?.name ?? (screen === "Overview" ? "Overview" : screen);
  const subtitles = { Overview: "Here’s what’s happening with your shared expenses.", Groups: "Browse your groups and see where everyone stands.", Approvals: "Review shared expenses before they affect balances.", Reports: "Explore approved spending and recorded payments." };

  return <div className="shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate("Overview")}><span className="brand-icon" aria-hidden>◈</span>SplitSmart</button>
      <nav aria-label="Workspace">{(["Overview", "Groups", "Approvals", "Reports"] as const).map((item, index) =>
        <button className={screen === item ? "nav active" : "nav"} aria-current={screen === item ? "page" : undefined} key={item} onClick={() => navigate(item)}><span aria-hidden>{["⊞", "♧", "✓", "▥"][index]}</span>{item}{item === "Approvals" && pending.length > 0 && <b>{pending.length}</b>}</button>)}</nav>
      <div className="sidebar-groups"><div className="eyebrow">YOUR GROUPS</div>{groups.map(group => <button key={group.id} className={selected === group.id ? "nav active" : "nav"} onClick={() => navigate("Groups", group.id)}><i className={group.theme} />{group.name}</button>)}</div>
      <div className="profile"><span className="avatar">AM</span><div><strong>Alex Morgan</strong><div className="muted">Demo identity</div></div></div>
    </aside>
    <div className="canvas">
      <header className="topbar"><span>Workspace <span className="slash">/</span> <strong>{title}</strong></span><span className="demo" title="Demo identity, in-app alerts, and manually recorded payments">● <span>Demo · Alex Morgan</span></span></header>
      <main className="content">
        {group && <button className="text-button back" onClick={() => navigate("Groups")}>All groups</button>}
        <div className="page-header"><div><h1>{title}</h1><p>{group?.description ?? subtitles[screen]}</p></div><div className="header-actions"><button className="button" disabled={!groups.length} onClick={() => edit("payment")}>Record payment</button><button className="button primary" disabled={!groups.length} onClick={() => edit("expense")}>＋ Add expense</button></div></div>
        {notice && <p role="status" className="notice">{notice}</p>}
        {issue && !editor && <p role="alert" className="issue">{issue}</p>}
        {busy && !editor && <p role="status">Saving…</p>}
        {screen === "Overview" && <>
          <div className="metrics"><Metric label="Your total balance" value={money(receivable - payable)} icon="◎" highlight note="Across all groups"/><Metric label="You are owed" value={money(receivable)} icon="↙" tone="green" note="From group members"/><Metric label="You owe" value={money(payable)} icon="↗" tone="red" note="To group members"/></div>
          <section className="section"><div className="section-head"><h2>Your groups</h2><button className="text-button" onClick={() => navigate("Groups")}>View all groups</button></div>{groupCards()}</section>
          <div className="overview-bottom">
            <Panel title="Recent activity">{activity.length ? activity.slice(0, 5).map(item => item.type === "expense" ? expenseRow(item) : paymentRow(item)) : <Empty>No activity yet.</Empty>}</Panel>
            <Panel title="Pending approvals" extra={<span className="status pending">{pending.length} pending</span>}>
              {pending.length ? <>{pending.slice(0, 3).map(item => expenseRow(item))}<button className="text-button panel-link" onClick={() => navigate("Approvals")}>Open review queue</button></> : <Empty>You’re all caught up.</Empty>}
            </Panel>
          </div>
        </>}
        {screen === "Groups" && !group && groupCards()}
        {screen === "Groups" && group && <>
          <div className="overview-bottom">
            <Panel title="Member balances">{ledgers.find(item => item.group.id === group.id)?.pairs.map(pair => <div className="record" key={JSON.stringify([pair.from, pair.to])}><div className="record-main">{name(group, pair.from)} owes <strong>{name(group, pair.to)}</strong></div><strong>{money(pair.cents)}</strong></div>)}{!ledgers.find(item => item.group.id === group.id)?.pairs.length && <Empty>Everyone is settled up.</Empty>}</Panel>
            <Panel title="Members">{group.members.map(person => <div className="record" key={person.id}><span className="avatar">{person.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</span><strong>{person.name}{person.id === "alex" ? " (you)" : ""}</strong></div>)}</Panel>
          </div>
          <div className="section"><Panel title="Group activity">{activity.some(item => item.groupId === group.id) ? activity.filter(item => item.groupId === group.id).map(item => item.type === "expense" ? expenseRow(item) : paymentRow(item)) : <Empty>No expenses or payments in this group.</Empty>}</Panel></div>
        </>}
        {screen === "Approvals" && <Panel title="Review queue" extra={<span className="status pending">{pending.length} pending</span>}><p className="panel-note muted">In-app demo alerts appear here. The demo identity can review any pending expense.</p>{pending.length ? pending.map(item => expenseRow(item, true)) : <Empty>You’re all caught up.</Empty>}</Panel>}
        {screen === "Reports" && <>
          <div className="filters panel"><label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>Through<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label><label>Group<select value={reportGroup} onChange={e => setReportGroup(e.target.value)}><option value="">All groups</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><button className="button" onClick={() => { setFrom(""); setTo(""); setReportGroup(""); }}>Clear filters</button></div>
          {reportInvalid ? <p role="alert" className="issue">The start date must be on or before the end date.</p> : <>
            <div className="metrics section"><Metric label="Approved spending" value={money(total(approved))} icon="▥" highlight note={approved.length + " expenses"}/><Metric label="Recorded payments" value={money(total(settlements))} icon="⇄" note={settlements.length + " payments"}/><Metric label="Outstanding balances" value={money(total(ledgers.filter(item => !reportGroup || item.group.id === reportGroup).flatMap(item => item.pairs)))} icon="◎" note="Current balance across selected groups"/></div>
            <div className="section"><Panel title="Report activity">{approved.length || settlements.length ? matching.map(item => item.type === "payment" ? paymentRow(item) : item.status === "approved" ? expenseRow(item) : null) : <Empty>No approved expenses or payments match these filters.</Empty>}</Panel></div>
          </>}
        </>}
      </main>
    </div>
    {editor && <Editor groups={groups} initial={editor} busy={busy} issue={issue} clearIssue={() => setIssue("")} close={() => { setIssue(""); setEditor(undefined); }} submit={form => submit(form, editor.kind === "expense" ? "Expense submitted for approval." : "Payment recorded. Balances updated.", true)} />}
  </div>;
}

function Panel({ title, extra, children }: { title: string; extra?: ReactNode; children: ReactNode }) {
  return <section className="panel"><div className="panel-head"><h2>{title}</h2>{extra}</div>{children}</section>;
}
function Empty({ children }: { children: ReactNode }) {
  return <p className="empty muted">{children}</p>;
}
function Metric({ label, value, icon, note, highlight = false, tone = "" }: { label: string; value: string; icon: string; note: string; highlight?: boolean; tone?: string }) {
  return <article className={"metric " + (highlight ? "highlight" : tone)}><div><span>{label}</span><span className="metric-icon" aria-hidden>{icon}</span></div><strong>{value}</strong><p>{note}</p></article>;
}

function Editor({ groups, initial, issue, busy, close, clearIssue, submit }: {
  groups: Groups; initial: { kind: "expense" | "payment"; groupId: string; id: string };
  issue: string; busy: boolean; close: () => void; clearIssue: () => void; submit: (form: FormData) => void;
}) {
  const [groupId, setGroupId] = useState(initial.groupId);
  const group = groups.find(group => group.id === groupId)!;
  const [method, setMethod] = useState("equal");
  const [participants, setParticipants] = useState(group.members.map(person => person.id));
  const [pairId, setPairId] = useState("0");
  const pairs = balances(group.expenses, group.payments);
  const pair = pairs[Number(pairId)];
  const isExpense = initial.kind === "expense";
  const title = isExpense ? "Add expense" : "Record payment";
  const localDay = new Date();
  const today = new Date(localDay.getTime() - localDay.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isExpense) for (const id of participants) form.append("participant", id);
    if (!isExpense && pair) {
      form.set("senderId", pair.from);
      form.set("recipientId", pair.to);
    }
    submit(form);
  }
  return <dialog ref={node => { if (node && !node.open) node.showModal(); }} className="dialog" aria-labelledby="editor-title" onCancel={event => { event.preventDefault(); if (!busy) close(); }}>
    <div className="dialog-head"><h2 id="editor-title">{title}</h2><button type="button" className="button close" aria-label="Close" disabled={busy} onClick={close}>×</button></div>
    <form onSubmit={onSubmit}>
      <input type="hidden" name="id" value={initial.id}/><input type="hidden" name="kind" value={initial.kind}/>
      <fieldset disabled={busy} className="editor-fields">
        <label>Group<select name="groupId" value={groupId} onChange={e => { const next = groups.find(item => item.id === e.target.value)!; setGroupId(next.id); setParticipants(next.members.map(person => person.id)); setPairId("0"); clearIssue(); }}>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
        {isExpense ? <label>Description<input name="description" required maxLength={100} placeholder="e.g. Dinner at Lilia"/></label> : <><p className="muted">Log a settlement in SplitSmart. Funds are exchanged separately.</p><label>Balance to settle<select value={pairId} onChange={e => setPairId(e.target.value)} disabled={!pairs.length}>{pairs.length ? pairs.map((pair, index) => <option key={JSON.stringify([pair.from, pair.to])} value={index}>{group.members.find(p => p.id === pair.from)?.name} owes {group.members.find(p => p.id === pair.to)?.name} · {money(pair.cents)}</option>) : <option>No outstanding balances</option>}</select></label></>}
        <div className="field-grid"><label>Amount (USD)<input name="amount" inputMode="decimal" required placeholder={pair ? (pair.cents / 100).toFixed(2) : "0.00"}/></label><label>Date<input name="date" type="date" required defaultValue={today}/></label></div>
        {isExpense && <><div className="field-grid"><label>Paid by<select name="payerId" key={groupId} defaultValue={group.members.some(person => person.id === "alex") ? "alex" : group.members[0]?.id}>{group.members.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label><label>Split method<select name="method" value={method} onChange={e => setMethod(e.target.value)}><option value="equal">Equal split</option><option value="percentage">By percentage</option></select></label></div>
        <fieldset className="participants" key={groupId}><legend>Participants</legend>{group.members.map(person => <div className="participant" key={person.id}><label><input type="checkbox" checked={participants.includes(person.id)} onChange={e => setParticipants(e.target.checked ? [...participants, person.id] : participants.filter(id => id !== person.id))}/>{person.name}</label>{method === "percentage" && participants.includes(person.id) && <input name={"percent-" + person.id} inputMode="decimal" placeholder="%" aria-label={person.name + " percentage"} required/>}</div>)}</fieldset></>}
      </fieldset>
      {issue && <p role="alert" className="issue">{issue}</p>}
      <div className="dialog-actions"><button type="button" className="button" disabled={busy} onClick={close}>Cancel</button><button type="submit" className="button primary" disabled={busy || (!isExpense && !pair)}>{busy ? "Saving…" : isExpense ? "Submit for approval" : "Record payment"}</button></div>
    </form>
  </dialog>;
}
