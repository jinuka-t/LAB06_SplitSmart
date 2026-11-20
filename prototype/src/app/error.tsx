"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="load-state"><h1>SplitSmart couldn’t load</h1><p>Check that the prototype database is set up, then try again.</p><button className="button primary" onClick={reset}>Try again</button></main>;
}
