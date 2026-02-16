# 🎓 English Learning Platform

A full-stack gamified English learning platform teaching CEFR levels A1 to C2 with interactive lessons, exams, and achievement tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20-green)

## ✨ Features

### 🎯 Core Features

- **CEFR Levels**: Complete curriculum from A1 (Beginner) to C2 (Proficiency)
- **Interactive Lessons**: Grammar, vocabulary, and practice exercises
- **Adaptive Exams**: 20-question exams with automatic grading
- **Progress Tracking**: Real-time progress tracking across all levels
- **Gamification**: XP system, streaks, achievements, and badges

### 🔐 Authentication & Security

- Google OAuth 2.0 integration
- JWT-based session management
- Secure token storage with Redis
- Protected routes and API endpoints

### 📊 Advanced Features

- **Anti-Cheat System**: Exam integrity protection
- **Level Reset**: Automatic reset after 3 failed exam attempts
- **Streak Tracking**: Daily study streak monitoring
- **Leaderboard**: Compete with other learners
- **Achievement System**: Unlock badges and rewards

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js 20
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma
- **Authentication**: Google OAuth 2.0, JWT
- **Validation**: Zod

### Database & Cache

- **Primary Database**: PostgreSQL 15 (Supabase)
- **Cache**: Redis 7 (Upstash)

### DevOps

- **Version Control**: Git & GitHub
- **CI/CD**: GitHub Actions (optional)
- **Deployment**: Vercel (Frontend), Railway (Backend)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Git
- Google Cloud Console account (for OAuth)
- Supabase account (for database)
- Upstash account (for Redis)

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

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, REDIS_URL, GOOGLE_CLIENT_ID, etc.

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database (optional)
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

# Copy environment variables
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:3000/api/v1

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database (Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# JWT Secret
JWT_SECRET="your-super-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/auth/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Environment
NODE_ENV="development"
PORT=3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| `GET`  | `/api/v1/auth/google`          | Get Google OAuth URL  |
| `GET`  | `/api/v1/auth/google/callback` | Handle OAuth callback |
| `GET`  | `/api/v1/auth/verify`          | Verify JWT token      |

### User Endpoints (Protected)

| Method  | Endpoint           | Description              |
| ------- | ------------------ | ------------------------ |
| `GET`   | `/api/v1/users/me` | Get current user profile |
| `PATCH` | `/api/v1/users/me` | Update user profile      |

### Levels Endpoints

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| `GET`  | `/api/v1/levels`       | Get all CEFR levels              |
| `GET`  | `/api/v1/levels/:code` | Get level by code (A1, A2, etc.) |

### Lessons Endpoints (Coming Soon)

| Method | Endpoint                       | Description             |
| ------ | ------------------------------ | ----------------------- |
| `GET`  | `/api/v1/lessons/:id`          | Get lesson content      |
| `POST` | `/api/v1/lessons/:id/complete` | Mark lesson as complete |

### Exam Endpoints (Coming Soon)

| Method | Endpoint                              | Description         |
| ------ | ------------------------------------- | ------------------- |
| `POST` | `/api/v1/exams/levels/:levelId/start` | Start exam          |
| `POST` | `/api/v1/exams/:examId/submit`        | Submit exam answers |
| `GET`  | `/api/v1/exams/:examId/results`       | Get exam results    |

---

## 🗄️ Database Schema

### Core Tables

- `users` - User profiles and statistics
- `levels` - CEFR levels (A1-C2)
- `lessons` - Lesson content and metadata
- `questions` - Question pool for exams
- `exams` - Active and completed exams
- `user_progress` - Progress tracking per level
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements

See [Prisma Schema](backend/prisma/schema.prisma) for complete schema.

---

## 🎮 How It Works

### Learning Flow

1. **Sign In**: Authenticate with Google OAuth
2. **Choose Level**: Start with A1 or your appropriate level
3. **Complete Lessons**: Study grammar and vocabulary
4. **Take Exam**: Pass with 80% to unlock next level
5. **Progress**: Track XP, streaks, and achievements

### Exam Rules

- 20 questions (60% grammar, 40% vocabulary)
- 1 minute per question
- 80% passing score
- 3 consecutive failures → level reset
- Anti-cheat protection enabled

---

## 📱 Screenshots

### Login Page

Beautiful gradient design with Google OAuth integration.

### Dashboard

Clean interface showing all CEFR levels (A1-C2) with progress indicators.

### Lessons

Interactive lessons with examples and exercises.

### Exams

Timed exams with real-time question counter and anti-cheat protection.

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel
```

### Backend (Railway)

```bash
cd backend
# Connect GitHub repository to Railway
# Add environment variables in Railway dashboard
# Auto-deploy on git push
```

### Database (Supabase)

Database is already on Supabase. Just update `DATABASE_URL` in production environment.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Safa Burak Bahçeci**

- GitHub: [@sburakbahceci](https://github.com/sburakbahceci)

---

## 🙏 Acknowledgments

- CEFR Framework by Council of Europe
- Google OAuth 2.0 Documentation
- Prisma ORM Team
- React and TypeScript Communities

---

## 📞 Support

For support, email [your-email] or open an issue on GitHub.

---

## 🗺️ Roadmap

- [x] Google OAuth Authentication
- [x] User Dashboard
- [x] Levels Display (A1-C2)
- [ ] Lesson System
- [ ] Exam System
- [ ] Progress Tracking
- [ ] Achievement System
- [ ] Leaderboard
- [ ] Mobile App
- [ ] Multiple Language Support

---

**Built with ❤️ using React, Node.js, and TypeScript**
