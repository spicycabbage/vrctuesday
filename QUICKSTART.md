# VRC Tuesday - Quick Start Guide

## ✅ Setup Complete!

Your new team-based badminton tournament app "VRC Tuesday" is ready to use!

## 📁 Project Location
```
d:\cursor\fribadminton-teams\
```

## 🚀 Quick Start

### 1. Set Up Database (Required)

⚠️ **CRITICAL**: VRC Tuesday needs its **OWN SEPARATE DATABASE**!

**DO NOT use the same database as your original fribadminton app.** The two apps have completely different data structures and must be isolated.

**Steps:**
1. Create a **NEW** Neon database specifically for VRC Tuesday
2. Get the connection string for your new database
3. Create `.env.local` in the project root:

```bash
cd d:\cursor\fribadminton-teams
```

Create `.env.local` with your **NEW** database URL:
```env
DATABASE_URL=your_new_vrc_tuesday_database_url
NEON_DATABASE_URL=your_new_vrc_tuesday_database_url
```

The required tables (`team_tournaments`, `team_players`, `team_matches`) will be created automatically.

### 2. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. First Tournament

1. Click "Create New Tournament"
2. Enter access code (default: 111)
3. Enter team names (e.g., "Team A" vs "Team B")
4. Fill in player names:
   - 3 Women (W1, W2, W3) per team
   - 3 Men (M1, M2, M3) per team
5. Click "Create Tournament"
6. Start entering scores in XD, MD, WD tabs!

## 🎯 Key Features

### Tournament Structure
- **2 Teams** with 6 players each (3W, 3M)
- **9 Matches**: 3 XD, 3 MD, 3 WD
- **18 Sets Total**: 2 sets per match
- **Winner**: Team with most sets won (tiebreaker: total points)

### Scoring
- **21-point system** with deuce (win by 2)
- **Maximum 30 points** (absolute max)
- Each match has 2 sets
- Team winning more sets wins the match

### Navigation
- **XD Tab**: Mixed Doubles matches
- **MD Tab**: Men's Doubles matches
- **WD Tab**: Women's Doubles matches
- **Results Tab**: Full tournament summary

## 📱 PWA Features

The app is a Progressive Web App (PWA):
- Install on your phone as a native app
- Works offline once loaded
- Optimized for mobile devices

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## 📋 What Was Created

### Core Files
- ✅ Team-based game logic with deuce scoring
- ✅ Database schema for team tournaments
- ✅ Tournament registration page (2 teams, 6 players each)
- ✅ Match tabs (XD, MD, WD) with 2-set scoring
- ✅ Results display with full tournament summary
- ✅ Tournament history with date-based results
- ✅ All API routes for CRUD operations

### Key Differences from Original App

| Feature | Original (Individual) | VRC Tuesday (Team) |
|---------|----------------------|-------------------|
| Format | 8 individual players | 2 teams of 6 players |
| Matches | 14 matches, 7 rounds | 9 matches (3 XD, 3 MD, 3 WD) |
| Scoring | 1 score per match | 2 sets per match |
| Deuce | No | Yes (win by 2, max 30) |
| Navigation | Round buttons | Match type tabs (XD/MD/WD) |
| Winner | Highest individual score | Most sets won (tie: points) |
| History | Individual player stats | Team-based results |

## 🎮 Usage Flow

1. **Create Tournament**
   - Enter team names and all 12 players
   - System automatically creates 9 matches

2. **Score Matches**
   - Navigate between XD, MD, WD tabs
   - Enter 2 set scores for each match
   - Edit scores anytime before finalization

3. **View Results**
   - Real-time set count and points tracking
   - Results tab shows full match details
   - Tournament winner determined automatically

4. **Finalize**
   - Complete all 18 sets
   - Click "Finalize Tournament"
   - Tournament locked and saved to history

5. **View History**
   - Click "View Tournament History" from home
   - Expand any date to see full match results

## 🔍 Troubleshooting

### Database Connection Issues
- Make sure `.env.local` exists with valid DATABASE_URL
- Check Neon database is accessible
- Tables will be created automatically on first API call

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## 📞 Next Steps

1. Set up your Neon database
2. Add `.env.local` with database URL
3. Run `npm run dev`
4. Test creating a tournament
5. Deploy to Vercel when ready!

## 🎉 Ready to Go!

Your VRC Tuesday app is fully set up and ready to track team badminton tournaments!
