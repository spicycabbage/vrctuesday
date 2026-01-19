# Database Architecture Comparison

## Two Apps = Two Databases

| Aspect | Original fribadminton | VRC Tuesday |
|--------|----------------------|-------------|
| **Location** | `d:\cursor\fribadminton\` | `d:\cursor\fribadminton-teams\` |
| **Database** | Your existing Neon DB | **NEW separate Neon DB** |
| **Table Prefix** | None | `team_` |
| **Tables** | `tournaments`<br>`players`<br>`matches` | `team_tournaments`<br>`team_players`<br>`team_matches` |

## Table Structure Differences

### Original fribadminton Tables

```sql
tournaments (
  id, access_code, date, current_round,
  is_finalized, created_at
)

players (
  tournament_id, id, name, total_score
)

matches (
  tournament_id, id, round,
  team_a_p1, team_a_p2, team_b_p1, team_b_p2,
  score_a, score_b, completed, winner_team
)
```

### VRC Tuesday Tables

```sql
team_tournaments (
  id, access_code, date,
  team1_name, team2_name,
  team1_sets_won, team2_sets_won,
  team1_total_points, team2_total_points,
  tournament_winner, is_finalized, created_at
)

team_players (
  tournament_id, id, name, gender, team_number
)

team_matches (
  tournament_id, id, match_type,
  team1_player1_id, team1_player2_id,
  team2_player1_id, team2_player2_id,
  set1_team1_score, set1_team2_score, set1_winner,
  set2_team1_score, set2_team2_score, set2_winner,
  completed, match_winner
)
```

## Why Separate Databases?

### ✅ Data Isolation
- Prevents accidental data corruption
- Each app manages its own schema
- Clean separation of concerns

### ✅ Schema Independence
- Different structures optimized for each use case
- Can evolve independently
- No migration conflicts

### ✅ Deployment Flexibility
- Deploy to different servers if needed
- Scale independently
- Different backup strategies

## Environment Configuration

### Original fribadminton

Location: `d:\cursor\fribadminton\.env.local`
```env
DATABASE_URL=postgresql://existing-db...
```

### VRC Tuesday

Location: `d:\cursor\fribadminton-teams\.env.local`
```env
DATABASE_URL=postgresql://new-vrc-tuesday-db...
```

## Quick Setup Checklist

- [ ] Create NEW Neon database for VRC Tuesday
- [ ] Copy connection string
- [ ] Create `.env.local` in `fribadminton-teams` folder
- [ ] Paste connection string
- [ ] Run `npm run dev`
- [ ] Tables auto-create on first use

## Common Mistakes to Avoid

❌ Using the same database URL in both apps  
❌ Trying to manually create tables  
❌ Assuming data is shared between apps  
❌ Copying .env.local from original to VRC Tuesday

## Correct Setup

✅ Two separate database projects in Neon  
✅ Two separate .env.local files  
✅ Let each app create its own schema  
✅ Keep data completely isolated
