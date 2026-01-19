# ⚠️ IMPORTANT: Separate Database Required

VRC Tuesday is a **standalone application** that requires its **OWN SEPARATE DATABASE**.

## Why?

The two apps have completely different data models:

| App | Tables | Structure |
|-----|--------|-----------|
| **Original fribadminton** | `tournaments`, `players`, `matches` | Individual-based (8 players, 7 rounds) |
| **VRC Tuesday** | `team_tournaments`, `team_players`, `team_matches` | Team-based (2 teams, 6 players each) |

## Setup Instructions

### 1. Create a New Database

Create a **NEW** Neon PostgreSQL database specifically for VRC Tuesday:
- Go to https://console.neon.tech
- Create a new project (e.g., "vrc-tuesday")
- Copy the connection string

### 2. Configure Environment

Create `.env.local` in the VRC Tuesday project:

```bash
cd d:\cursor\fribadminton-teams
notepad .env.local
```

Add your **NEW** database URL:

```env
DATABASE_URL=postgresql://user:pass@your-new-database.neon.tech/vrc_tuesday
NEON_DATABASE_URL=postgresql://user:pass@your-new-database.neon.tech/vrc_tuesday
```

### 3. Automatic Schema Creation

The following tables will be created automatically on first use:

- `team_tournaments` - Tournament metadata and scores
- `team_players` - Player rosters for both teams
- `team_matches` - Match details with set scores

## DO NOT

❌ Do NOT use the same database URL as fribadminton  
❌ Do NOT try to share data between the two apps  
❌ Do NOT manually create tables (they're auto-created)

## Summary

✅ Two separate apps = Two separate databases  
✅ Each app manages its own schema independently  
✅ No data conflicts or interference between apps
