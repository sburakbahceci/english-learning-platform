# 🎓 Lingoria - AI-Powered English Learning Platform

Master English from A1 to C2 with Lingoria's gamified, AI-powered learning experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20-green)

## ✨ What is Lingoria?

Lingoria is an intelligent English learning platform that uses AI to provide personalized, gamified learning experiences. From complete beginners (A1) to proficiency (C2), Lingoria adapts to your level and helps you master English through:

- 🤖 **AI-Powered Learning**: Smart content delivery and adaptive assessments
- 🎮 **Gamification**: XP, streaks, achievements, and level progression
- 📚 **CEFR Aligned**: Complete curriculum from A1 to C2
- 🎯 **Interactive**: Grammar, vocabulary, and practice exercises
- 📊 **Progress Tracking**: Real-time insights into your learning journey

---

## 🚀 Features

### Core Learning

- **6 CEFR Levels**: Complete progression from A1 (Beginner) to C2 (Proficiency)
- **7 Lessons per Level**: Grammar, vocabulary, and practice modules
- **100+ Questions**: Extensive question bank with AI-generated variations
- **Smart Exams**: 20 randomized questions per exam with instant feedback
- **Interactive Content**: Rich lessons with examples, exercises, and explanations

### Gamification & Progress

- **XP System**: Earn experience points for completing lessons and passing exams
- **Streak Tracking**: Maintain daily study streaks for bonus rewards
- **Achievements**: Unlock badges and milestones as you progress
- **Progress Dashboard**: Real-time visualization of your learning journey
- **Level System**: Unlock new levels by passing exams with 80%+ score

### Smart Features

- **AI-Powered**: Intelligent content delivery and personalized recommendations
- **Anti-Cheat System**: Tab detection and time limits ensure exam integrity
- **Adaptive Learning**: Content difficulty adjusts based on performance
- **Real-time Feedback**: Instant results with detailed explanations
- **Level Reset Protection**: 3-strike system prevents gaming the system

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 8.x
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router v6
- **State Management**: Zustand with persistence
- **HTTP Client**: Axios with interceptors

### Backend

- **Runtime**: Node.js 20
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma 5.x
- **Authentication**: Google OAuth 2.0 + JWT
- **Validation**: Zod schemas

### Database & Infrastructure

- **Primary Database**: PostgreSQL 15 (Supabase)
- **Cache Layer**: Redis 7 (Upstash)
- **File Storage**: Supabase Storage (planned)
- **Hosting**: Vercel (Frontend) + Railway (Backend)

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- Node.js 20+ and npm
- Git
- Google Cloud Console account (for OAuth)
- Supabase account (for PostgreSQL database)
- Upstash account (for Redis cache)

### 1. Clone Repository

```bash
git clone https://github.com/sburakbahceci/english-learning-platform.git
cd english-learning-platform
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: DATABASE_URL, UPSTASH_REDIS_REST_URL, GOOGLE_CLIENT_ID, JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with backend URL
# VITE_API_URL=http://localhost:3000/api/v1

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/lingoria"

# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# JWT Authentication
JWT_SECRET="lingoria-super-secret-key-2026"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/auth/google/callback"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Environment
NODE_ENV="development"
PORT=3000
```

### Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint                | Description           | Auth Required |
| ------ | ----------------------- | --------------------- | ------------- |
| `GET`  | `/auth/google`          | Get Google OAuth URL  | No            |
| `GET`  | `/auth/google/callback` | Handle OAuth callback | No            |
| `GET`  | `/auth/verify`          | Verify JWT token      | No            |

### User Endpoints

| Method  | Endpoint    | Description              | Auth Required |
| ------- | ----------- | ------------------------ | ------------- |
| `GET`   | `/users/me` | Get current user profile | Yes           |
| `PATCH` | `/users/me` | Update user profile      | Yes           |

### Level Endpoints

| Method | Endpoint        | Description                      | Auth Required |
| ------ | --------------- | -------------------------------- | ------------- |
| `GET`  | `/levels`       | Get all CEFR levels              | No            |
| `GET`  | `/levels/:code` | Get level by code (A1, A2, etc.) | No            |

### Lesson Endpoints

| Method | Endpoint                              | Description             | Auth Required |
| ------ | ------------------------------------- | ----------------------- | ------------- |
| `GET`  | `/lessons/level/:levelId`             | Get lessons for a level | No            |
| `GET`  | `/lessons/:lessonId`                  | Get lesson details      | No            |
| `POST` | `/lessons/:lessonId/complete`         | Complete a lesson       | Yes           |
| `GET`  | `/lessons/level/:levelId/completions` | Get user's completions  | Yes           |

### Exam Endpoints

| Method | Endpoint                          | Description                      | Auth Required |
| ------ | --------------------------------- | -------------------------------- | ------------- |
| `POST` | `/exams/levels/:levelId/start`    | Start exam (20 random questions) | Yes           |
| `POST` | `/exams/:examId/submit`           | Submit exam answers              | Yes           |
| `GET`  | `/exams/:examId/results`          | Get exam results                 | Yes           |
| `GET`  | `/exams/levels/:levelId/attempts` | Get exam attempt history         | Yes           |

---

## 🗄️ Database Schema

### Core Tables

#### Users

- `id` (UUID, Primary Key)
- `googleId` (String, Unique)
- `email` (String, Unique)
- `name` (String)
- `avatarUrl` (String, Optional)
- `totalXp` (Integer, Default: 0)
- `currentStreak` (Integer, Default: 0)
- `longestStreak` (Integer, Default: 0)
- `lastActivityDate` (DateTime, Optional)
- `createdAt` (DateTime)

#### Levels (CEFR)

- `id` (UUID, Primary Key)
- `code` (String: A1, A2, B1, B2, C1, C2)
- `name` (String: Beginner, Elementary, etc.)
- `description` (Text)
- `orderIndex` (Integer)
- `requiredXp` (Integer)
- `badgeIconUrl` (String, Optional)

#### Lessons

- `id` (UUID, Primary Key)
- `levelId` (UUID, Foreign Key → Levels)
- `title` (String)
- `description` (Text)
- `type` (Enum: grammar, vocabulary, practice)
- `orderIndex` (Integer)
- `content` (JSONB: rules, examples, exercises)
- `xpReward` (Integer)
- `estimatedMinutes` (Integer)

#### Questions

- `id` (UUID, Primary Key)
- `levelId` (UUID, Foreign Key → Levels)
- `category` (Enum: grammar, vocabulary)
- `type` (Enum: multiple_choice, fill_blank, etc.)
- `questionText` (Text)
- `options` (JSONB Array)
- `correctAnswer` (String)
- `explanation` (Text)
- `isActive` (Boolean, Default: true)

#### Exams

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → Users)
- `levelId` (UUID, Foreign Key → Levels)
- `status` (Enum: in_progress, completed, expired)
- `questions` (JSONB: Array of question IDs)
- `answers` (JSONB: User answers)
- `score` (Numeric, Optional)
- `passed` (Boolean, Optional)
- `startedAt` (DateTime, Auto-generated)
- `completedAt` (DateTime, Optional)
- `expiresAt` (DateTime)
- `timeTakenSeconds` (Integer, Optional)

See [Prisma Schema](backend/prisma/schema.prisma) for complete schema with all relationships.

---

## 🎮 How It Works

### Learning Flow

1. **Sign In**: Authenticate with Google OAuth 2.0
2. **Choose Level**: Start with A1 or your appropriate CEFR level
3. **Study Lessons**: Complete 7 interactive lessons (grammar + vocabulary)
4. **Take Exam**: Pass with 80% to unlock the next level
5. **Progress**: Track XP, streaks, and achievements on your dashboard

### Exam System

- **Question Pool**: 100+ questions per level
- **Random Selection**: 20 questions randomly selected per exam
- **Composition**: 60% grammar (12 questions) + 40% vocabulary (8 questions)
- **Time Limit**: 1 minute per question (20 minutes total)
- **Passing Score**: 80% (16/20 correct answers)
- **Anti-Cheat**: Tab switching detection with 3-strike warning
- **Failure Policy**: 3 consecutive failures within 24 hours → Level reset

### XP & Progression

- **Lesson Completion**: +10-20 XP per lesson
- **Exam Pass**: +100 XP
- **Daily Streak**: Bonus XP for consecutive days
- **Achievements**: Unlock badges for milestones

---

## 📱 Screenshots

### Login Page

Beautiful gradient design with Google OAuth integration and Lingoria branding.

### Dashboard

Clean interface showing all 6 CEFR levels (A1-C2) with progress indicators and XP tracking.

### Lesson View

Interactive lessons with grammar rules, examples, vocabulary with translations, and practice exercises.

### Exam Interface

Timed exams with progress tracking, question counter, anti-cheat protection, and instant feedback.

### Results Screen

Comprehensive exam results with score breakdown, correct/incorrect answers, and detailed explanations.

---

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables:
   - `VITE_API_URL`: Your backend production URL
4. Deploy automatically on git push

### Backend (Railway)

1. Connect GitHub repository to Railway
2. Configure environment variables in Railway dashboard
3. Auto-deploy enabled on git push to main branch

### Database (Supabase)

Database is already hosted on Supabase. Update `DATABASE_URL` in production environment variables.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Lingoria Team**

- Email: hello.lingoria@gmail.com
- GitHub: [@sburakbahceci](https://github.com/sburakbahceci)

---

## 🙏 Acknowledgments

- CEFR Framework by Council of Europe
- Google OAuth 2.0 Documentation
- Prisma ORM Team
- React and TypeScript Communities
- OpenAI for inspiration on AI-powered learning

---

## 📞 Support

For support, please email hello.lingoria@gmail.com or open an issue on GitHub.

---

## 🗺️ Roadmap

### Current Release (v1.0) ✅

- [x] Google OAuth Authentication
- [x] User Dashboard with 6 CEFR Levels
- [x] Interactive Lessons (7 per level)
- [x] Smart Exam System (100+ questions)
- [x] Progress Tracking with XP
- [x] Anti-Cheat Protection

### Upcoming Features

- [ ] AI-Generated Content Variations
- [ ] Speech Recognition for Pronunciation
- [ ] Writing Assessment with AI Feedback
- [ ] Listening Comprehension Exercises
- [ ] Mobile Apps (iOS & Android)
- [ ] Social Features & Study Groups
- [ ] Advanced Analytics Dashboard
- [ ] Multiple Language Support (UI)
- [ ] Offline Mode
- [ ] Custom Learning Paths

---

## 📊 Project Stats

- **Total Lines of Code**: ~15,000+
- **Backend Endpoints**: 15
- **Database Tables**: 13
- **Questions in Database**: 100+ (per level)
- **Lessons Available**: 7 (A1 level, more coming)
- **Supported Levels**: 6 (A1-C2 CEFR)

---

**Lingoria** - Your AI English Learning Companion 🚀

_Master English, One Level at a Time._
