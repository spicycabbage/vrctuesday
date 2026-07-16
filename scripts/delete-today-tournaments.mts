import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function loadEnvLocal() {
  const p = join(process.cwd(), '.env.local');
  const text = readFileSync(p, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvLocal();
const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!url) {
  console.error('No DATABASE_URL or NEON_DATABASE_URL in .env.local');
  process.exit(1);
}

const activeOnly = process.argv.includes('--active');
const dateIdx = process.argv.indexOf('--date');
const explicitDate =
  dateIdx !== -1 && process.argv[dateIdx + 1]
    ? process.argv[dateIdx + 1].trim()
    : null;

if (explicitDate && !/^\d{4}-\d{2}-\d{2}$/.test(explicitDate)) {
  console.error('Usage: --date must be YYYY-MM-DD (e.g. 2026-05-04)');
  process.exit(1);
}

const { neon } = await import('@neondatabase/serverless');
const sql = neon(url);

type Row = { id: string; date: string; team1_name: string; team2_name: string };

let rows: Row[];

if (explicitDate) {
  rows =
    await sql`select id, date, team1_name, team2_name from team_tournaments where date = ${explicitDate}`;
  if (rows.length === 0) {
    console.log(`No tournaments with date ${explicitDate}.`);
    process.exit(0);
  }
} else if (activeOnly) {
  rows = await sql`
    select id, date, team1_name, team2_name from team_tournaments
    where is_finalized = false order by created_at desc limit 1
  `;
} else {
  const todayLA = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  rows =
    await sql`select id, date, team1_name, team2_name from team_tournaments where date = ${todayLA}`;

  if (rows.length === 0) {
    console.log(
      `No tournaments with date ${todayLA} (America/Los_Angeles). Try --active or --date YYYY-MM-DD.`
    );
    process.exit(0);
  }
}

if (rows.length === 0) {
  console.log('No in-progress tournament to delete.');
  process.exit(0);
}

const label = explicitDate
  ? `date ${explicitDate}`
  : activeOnly
    ? 'active (latest non-finalized)'
    : `date ${rows[0].date}`;
console.log(`Deleting ${rows.length} tournament(s) (${label}):`);
for (const r of rows) {
  console.log(`  ${r.id}  ${r.date}  ${r.team1_name} vs ${r.team2_name}`);
}

const ids = rows.map((r) => r.id);
await sql`delete from team_tournaments where id = ANY(${ids})`;
console.log('Done.');
