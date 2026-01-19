# 🏸 VRC Tuesday - Team Badminton Tournament App

A mobile-first Progressive Web App (PWA) for team-based badminton tournaments. Built with Next.js 16, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎯 Team Tournament Format
- **2 Teams** competing head-to-head
- **6 Players per Team** (3 Women, 3 Men)
- **9 Matches Total**: 3 Mixed Doubles (XD), 3 Men's Doubles (MD), 3 Women's Doubles (WD)
- **18 Sets Total**: Each match consists of 2 sets
- **Best-of-2 Format**: Team that wins more sets wins the match

### 🎮 Scoring System
- **Deuce Scoring**: Standard 21-point system with win-by-2 requirement
- **Maximum 30 Points**: Game ends at 30 points regardless of margin
- **Set-Based Winners**: Team with most sets won (out of 18) wins tournament
- **Tiebreaker**: If sets are tied 9-9, total points determines winner

### 📱 Match Organization
- **Tab-Based Navigation**: Separate tabs for XD, MD, WD matches
- **Real-time Score Tracking**: Live updates of sets won and total points
- **Match Completion Indicators**: Visual feedback for completed match types
- **Results Tab**: Comprehensive tournament summary with all match details

### 🏆 Tournament Features
- **Team Registration**: Easy setup with team names and player rosters
- **Access Code System**: Secure tournament joining with custom codes
- **Score Entry**: Intuitive interface for entering set scores with validation
- **Score Editing**: Ability to edit scores before tournament finalization
- **Tournament Finalization**: Lock tournament when complete
- **Tournament History**: View past results with expandable match details

### 📱 Mobile-Optimized PWA
- **iPhone Optimized**: Perfect display on mobile devices
- **Responsive Design**: Scales beautifully across all screen sizes
- **Offline Capable**: PWA functionality for scoring without internet
- **Add to Home Screen**: Install as native app experience

## 🚀 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with mobile-first approach
- **Database**: Neon PostgreSQL (serverless)
- **PWA**: next-pwa for offline functionality
- **Icons**: Heroicons for consistent UI

## 🛠 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Neon PostgreSQL database (or compatible PostgreSQL)

### Installation

```bash
# Navigate to project directory
cd fribadminton-teams

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your DATABASE_URL

# Run development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

⚠️ **IMPORTANT**: VRC Tuesday requires its **own separate database**. Do NOT share the database with the original fribadminton app.

Create a `.env.local` file with a **NEW** database connection:

```env
DATABASE_URL=your_new_vrc_tuesday_database_url
NEON_DATABASE_URL=your_new_vrc_tuesday_database_url
```

The app uses different table names (`team_tournaments`, `team_players`, `team_matches`) than the original app, and they will be created automatically on first API call.

## 🎯 Tournament Structure

### Team Composition
Each team has 6 players:
- **3 Women**: W1, W2, W3
- **3 Men**: M1, M2, M3

### Match Format

#### Mixed Doubles (XD) - 3 Matches
1. Team 1 W1/M1 vs Team 2 W1/M1
2. Team 1 W2/M2 vs Team 2 W2/M2
3. Team 1 W3/M3 vs Team 2 W3/M3

#### Men's Doubles (MD) - 3 Matches
1. Team 1 M1/M2 vs Team 2 M2/M3
2. Team 1 M2/M3 vs Team 2 M1/M3
3. Team 1 M1/M3 vs Team 2 M1/M2

#### Women's Doubles (WD) - 3 Matches
1. Team 1 W1/W2 vs Team 2 W2/W3
2. Team 1 W2/W3 vs Team 2 W1/W3
3. Team 1 W1/W3 vs Team 2 W1/W2

### Scoring Rules
- **Standard Win**: First to 21 points with 2-point lead
- **Deuce**: Continue play until 2-point lead is achieved
- **Maximum**: 30 points is absolute maximum (no win-by-2 required)
- **Set Winner**: Team with higher score when valid end condition is met
- **Match Winner**: Team winning 2 out of 2 sets (best of 2)
- **Tournament Winner**: Team with most sets won out of 18 total
- **Tiebreaker**: If sets tied 9-9, team with most total points wins

## 🏗 Architecture

### Database Schema

#### team_tournaments
- Tournament metadata, team names, scores, winner
- Tracks sets won and total points for each team

#### team_players
- Player information for both teams
- Gender and team assignment

#### team_matches
- All 9 matches with player pairings
- Set scores and completion status
- Match winners

### Key Components
- `MatchesTab` - Score entry interface for each match type
- `ResultsTab` - Comprehensive tournament results display
- `TournamentHeader` - Live score summary and team standings

### Game Logic
- `gameLogic.ts` - Core tournament rules and calculations
- `tournamentRepo.ts` - Database operations
- **Type-safe interfaces** for Tournament, Match, and Player data
- **Comprehensive validation** for all score inputs

## 🎨 Design System

### Mobile-First Approach
- **Relative sizing** for responsive scaling
- **Touch-friendly targets** optimized for mobile interaction
- **Professional color scheme** with clear visual hierarchy

### UI Consistency
- **Color-coded teams** - Blue (Team 1), Red (Team 2)
- **Tab indicators** - Active, Completed, Inactive states
- **Professional typography** with proper contrast ratios

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add DATABASE_URL environment variable
4. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built for competitive team badminton tournaments**
