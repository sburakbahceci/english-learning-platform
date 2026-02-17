import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import LevelDetailPage from './pages/LevelDetailPage';
import LessonDetailPage from './pages/LessonDetailPage';
import ExamPage from './pages/ExamPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/levels/:code" element={<LevelDetailPage />} />
        <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
        <Route path="/exam/:levelId" element={<ExamPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
