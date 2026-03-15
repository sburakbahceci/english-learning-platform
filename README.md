# 🎓 Lingoria - English Learning Platform

A comprehensive full-stack English learning platform with AI-powered features, gamification, and admin management system.

![Lingoria Banner](frontend/public/lingoria_text_logo.png)

---

## 🚀 Features

### 👨‍🎓 Student Features

#### 📊 **Placement Test**

- Adaptive difficulty questions across all CEFR levels (A1-C2)
- Automatic level assignment based on performance
- Comprehensive results with detailed breakdown

#### 📚 **Lessons Module**

- Interactive grammar and vocabulary lessons
- HTML-based content with colored highlights
- Multiple choice exercises with instant feedback
- AI-powered explanations via Groq
- PDF report generation
- XP rewards system

#### 🎙️ **Podcast Module**

- YouTube-embedded podcast episodes
- Vocabulary lists with definitions
- Comprehension exercises
- Progress tracking

#### 📖 **Reading Module**

- Level-appropriate passages
- Comprehension questions
- Time tracking
- Score calculation

#### ✍️ **Writing Module**

- Free writing prompts with AI feedback (Groq)
- Fill-in-the-blank exercises
- Grammar and vocabulary practice
- Detailed scoring (grammar, vocabulary, coherence, task achievement)

#### 🎤 **Speaking Module**

- Voice recording with MediaRecorder API
- Real-time transcription (Web Speech API)
- AI-powered feedback on pronunciation, fluency, grammar, vocabulary
- Multiple task types: describe_image, answer_question, free_speech, role_play
- Visual progress tracking

#### 🎮 **Gamification**

- XP system
- Streak tracking
- Level progression
- Achievements

#### 💬 **AI Chat Assistant**

- Context-aware conversations
- Grammar corrections
- Learning tips

---

### 👨‍💼 Admin Features

#### 🔐 **Authentication**

- Secure JWT-based admin authentication
- Role-based access control (super_admin, admin, content_manager)
- Separate auth system from students

#### 📊 **Dashboard**

- Real-time platform statistics
  - Total users / Active users (7d)
  - Lesson completions
  - Total XP earned
- Content overview (podcasts, reading, writing, speaking)
- Recent activities feed
- Top users leaderboard
- User growth analytics

#### 👥 **User Management** (Coming Soon)

- View all users
- Edit user details
- Ban/unban users
- Reset progress
- Export user data (CSV)

#### 📝 **Content Management** (Coming Soon)

- **Lessons**: Create/edit lessons with WYSIWYG editor
- **Podcasts**: Manage episodes, vocabulary, exercises
- **Reading**: Create passages and comprehension questions
- **Writing**: Manage prompts and exercises
- **Speaking**: Create tasks with audio/image uploads
- **Exams**: Question bank management

#### 📈 **Analytics** (Coming Soon)

- User engagement metrics
- Completion rates by level
- Average scores
- Time spent analytics

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **HTTP Client**: Axios
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

### **Backend**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **AI Integration**: Groq API (LLaMA models)
- **File Upload**: Multer (future)

### **Database Schema**

- Users & Authentication
- Levels (A1-C2)
- Lessons & Completions
- Podcasts & Exercises
- Reading Passages & Questions
- Writing Prompts & Submissions
- Speaking Tasks & Attempts
- Placement Tests & Answers
- Admin Users & Audit Logs
- Exams & Questions

---

## 📁 Project Structure

```
english-learning-platform/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── admin-auth.service.ts
│   │   │   │   │   ├── admin-auth.controller.ts
│   │   │   │   │   └── admin-auth.routes.ts
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── admin-dashboard.service.ts
│   │   │   │   │   ├── admin-dashboard.controller.ts
│   │   │   │   │   └── admin-dashboard.routes.ts
│   │   │   │   └── middleware/
│   │   │   │       └── admin-authenticate.ts
│   │   │   ├── auth/
│   │   │   ├── lessons/
│   │   │   ├── levels/
│   │   │   ├── podcasts/
│   │   │   ├── reading/
│   │   │   ├── writing/
│   │   │   ├── speaking/
│   │   │   └── placement-test/
│   │   ├── middleware/
│   │   │   └── authenticate.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── pages/
│   │   │   │   ├── AdminLoginPage.tsx
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   └── AdminLayout.tsx
│   │   │   ├── components/
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   ├── AdminHeader.tsx
│   │   │   │   └── StatCard.tsx
│   │   │   ├── services/
│   │   │   │   └── admin-api.service.ts
│   │   │   └── types/
│   │   │       └── admin.types.ts
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LevelDetailPage.tsx
│   │   │   ├── LessonDetailPage.tsx
│   │   │   ├── PlacementTestPage.tsx
│   │   │   ├── ReadingPassagePage.tsx
│   │   │   ├── WritingPromptPage.tsx
│   │   │   ├── SpeakingTaskPage.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.tsx
│   ├── public/
│   │   ├── logo-icon.png
│   │   └── lingoria_text_logo.png
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- Groq API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/lingoria-platform.git
cd lingoria-platform
```

2. **Backend Setup**

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=3001
EOF

# Generate Prisma Client
npx prisma generate

# Run migrations (if needed)
npx prisma db push

# Start backend
npm run dev
```

3. **Frontend Setup**

```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3001/api/v1
EOF

# Start frontend
npm run dev
```

4. **Create First Admin User**

Use Postman or Thunder Client:

```http
POST http://localhost:3001/api/v1/admin/auth/setup
Content-Type: application/json

{
  "email": "admin@lingoria.com",
  "password": "YourSecurePassword123!",
  "name": "Admin User"
}
```

---

## 🌐 Access Points

- **Student App**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login
- **Backend API**: http://localhost:3001/api/v1

---

## 📊 Database Setup

### Sample Data Included

- 10 Lessons (A1-B1) with HTML content
- 2 Podcasts (A1, A2)
- 4 Reading passages
- 8 Writing prompts
- 6 Speaking tasks
- 30 Placement test questions

### Seed Data (Optional)

Run SQL scripts in Supabase SQL Editor or via Prisma:

```bash
# Speaking tasks
npm run seed:speaking

# Other modules
npm run seed:all
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=user_jwt_secret_key
ADMIN_JWT_SECRET=admin_jwt_secret_key
GROQ_API_KEY=gsk_your_groq_api_key
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api/v1
```

---

## 🧪 Testing

### Manual Testing

1. Register a new student account
2. Complete placement test
3. Explore unlocked levels
4. Complete lessons, podcasts, reading, writing, speaking
5. Check XP and streak progress

### Admin Testing

1. Login to admin panel
2. View dashboard statistics
3. Check recent activities
4. View top users

---

## 📈 Roadmap

### Phase 1: Core Platform ✅ (Completed)

- [x] Authentication system
- [x] Placement test
- [x] Lessons module
- [x] Podcasts module
- [x] Reading module
- [x] Writing module
- [x] Speaking module
- [x] Dashboard & progress tracking

### Phase 2: Admin Panel 🚧 (In Progress)

- [x] Admin authentication
- [x] Admin dashboard
- [ ] User management (CRUD)
- [ ] Content management (Lessons, Podcasts, etc.)
- [ ] Exam management
- [ ] Analytics & reports

### Phase 3: Exam System 📝 (Planned)

- [ ] Exam generation
- [ ] Timed exams
- [ ] 80% pass requirement
- [ ] Level unlock after exam
- [ ] Exam attempts tracking

### Phase 4: Enhancements 🎨 (Planned)

- [ ] Email notifications
- [ ] Advanced gamification (badges, achievements)
- [ ] Leaderboards
- [ ] Social features (friends, challenges)
- [ ] Mobile app (React Native)
- [ ] Offline mode

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Authors

- **Safa Burak** - _Lead Developer_

---

## 🙏 Acknowledgments

- Groq for AI API
- Supabase for database hosting
- Anthropic Claude for development assistance
- React and TypeScript communities

---

## 📞 Support

For support, email hello.lingoria@gmail.com or open an issue in the repository.

---

**Built with ❤️ for English learners worldwide**
