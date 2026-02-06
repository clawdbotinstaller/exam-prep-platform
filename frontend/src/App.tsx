import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import './App.css';

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CourseLayout from './layouts/CourseLayout';
import CourseHome from './pages/course/CourseHome';
import CourseAnalysis from './pages/course/CourseAnalysis';
import TopicAnalysisDetail from './pages/course/TopicAnalysisDetail';
import CoursePractice from './pages/course/CoursePractice';
import CourseArchive from './pages/course/CourseArchive';
import CourseMidterm from './pages/course/CourseMidterm';
import QuestionPage from './pages/course/QuestionPage';
import UpgradePage from './pages/UpgradePage';
import SuccessPage from './pages/SuccessPage';
import ProfilePage from './pages/ProfilePage';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('session');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  return { isAuthenticated, isLoading };
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated && !isDemo) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <SuccessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:slug"
          element={
            <ProtectedRoute>
              <CourseLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CourseHome />} />
          <Route path="analysis" element={<CourseAnalysis />} />
          <Route path="analysis/:topicId" element={<TopicAnalysisDetail />} />
          <Route path="practice" element={<CoursePractice />} />
          <Route path="archive" element={<CourseArchive />} />
          <Route path="archive/midterm/:difficulty" element={<CourseMidterm />} />
          <Route path="question/:id" element={<QuestionPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
