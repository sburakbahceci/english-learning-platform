import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import LevelDetailPage from './pages/LevelDetailPage';
import LessonDetailPage from './pages/LessonDetailPage';
import ExamPage from './pages/ExamPage';
import AiChatPage from './pages/AiChatPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PlacementTestPage from './pages/PlacementTestPage';
import PlacementTestResultsPage from './pages/PlacementTestResultsPage';
import ReadingPassagePage from './pages/ReadingPassagePage';
import ReadingResultsPage from './pages/ReadingResultsPage';
import WritingExercisesPage from './pages/WritingExercisesPage';
import WritingPromptPage from './pages/WritingPromptPage';
import WritingFeedbackPage from './pages/WritingFeedbackPage';
import SpeakingTaskPage from './pages/SpeakingTaskPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/levels/:code" element={<LevelDetailPage />} />
        <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
        <Route path="/exam/:levelId" element={<ExamPage />} />
        <Route path="/ai-chat" element={<AiChatPage />} />

        {/* Auth Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Placement Test */}
        <Route path="/placement-test" element={<PlacementTestPage />} />
        <Route
          path="/placement-test/results"
          element={<PlacementTestResultsPage />}
        />

        {/* Reading Routes */}
        <Route path="/reading/:passageId" element={<ReadingPassagePage />} />
        <Route
          path="/reading/results/:passageId"
          element={<ReadingResultsPage />}
        />

        {/* Writing Routes */}
        <Route
          path="/writing/exercises/:levelCode"
          element={<WritingExercisesPage />}
        />
        <Route
          path="/writing/prompt/:promptId"
          element={<WritingPromptPage />}
        />
        <Route
          path="/writing/feedback/:submissionId"
          element={<WritingFeedbackPage />}
        />

        {/* Speaking Routes */}
        <Route path="/speaking/:taskId" element={<SpeakingTaskPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
