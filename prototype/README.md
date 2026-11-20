# SplitSmart prototype

Run from this directory with Node.js 22.

```sh
npm ci
npx prisma generate
npm run db:setup
npm run dev
```

Open http://localhost:3000. Prisma 6 defaults to `prisma/dev.db`. To use an existing SQLite database, set `DATABASE_URL` in `.env` before running migrations, seeding, and starting Next.js. Relative SQLite file URLs resolve from `prisma/`. The migration preserves the original `EnvironmentCheck` table. The seed adds demo records by stable ID and preserves prior decisions and payments when rerun.

Use **Add expense**, then open **Approvals** to inspect its shares and approve or reject it. **Groups** shows member-to-member balances and activity. **Record payment** lets you select an outstanding balance to settle. **Reports** filters approved expenses and payments by inclusive dates and group. The outstanding balance in the report is current.

The workspace uses a fixed Alex Morgan demo identity with single-step review access. The review queue provides in-app demo alerts. Payments log manually reported settlements in USD.

```sh
npm run lint
npm run build
```
