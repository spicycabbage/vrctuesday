/**
 * Dump all VRC Tuesday tables to backups/ as JSON.
 * Usage: npx tsx scripts/backup-db.mts
 */
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

function loadEnvLocal() {
  const p = path.join(process.cwd(), '.env.local');
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

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL / NEON_DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(databaseUrl);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(process.cwd(), 'backups');
const outFile = path.join(outDir, `vrctuesday-${stamp}.json`);

const [tournaments, players, matches] = await Promise.all([
  sql`SELECT * FROM team_tournaments ORDER BY created_at`,
  sql`SELECT * FROM team_players ORDER BY tournament_id, team_number, id`,
  sql`SELECT * FROM team_matches ORDER BY tournament_id, id`,
]);

const payload = {
  createdAt: new Date().toISOString(),
  source: 'scripts/backup-db.mts',
  counts: {
    team_tournaments: tournaments.length,
    team_players: players.length,
    team_matches: matches.length,
  },
  tables: {
    team_tournaments: tournaments,
    team_players: players,
    team_matches: matches,
  },
};

await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(payload, null, 2), 'utf8');

console.log(`Backup written: ${outFile}`);
console.log(payload.counts);
