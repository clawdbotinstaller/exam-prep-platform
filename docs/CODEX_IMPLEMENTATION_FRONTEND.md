# Codex Implementation Guide: Frontend Pages

> **For:** Codex (or any AI coding agent)
> **Project:** Arkived - Exam Prep Platform
> **Last Updated:** 2026-02-06

---

## Overview

This guide provides step-by-step instructions for implementing the remaining frontend pages for Arkived. The landing page is already complete - you need to build the authenticated application pages.

## Current State

**Already Built:**
- Landing page (`/`) with 7 sections, GSAP animations, Engineering Library design
- React + Vite + TypeScript + Tailwind CSS 4 setup
- 55 shadcn/ui components available
- Global styles in `index.css` with design tokens

**You Need to Build:**
1. React Router setup
2. Authentication pages (Signup, Login)
3. Dashboard page
4. Course layout with sidebar
5. Course pages (Home, Analysis, Topic Deep Dive, Practice, Archive, Midterm, Question)
6. Upgrade/Payment pages
7. Profile page

---

## Design System Reference

### Colors (CSS Variables already defined)
```css
--paper-cream: #F5F1E8        /* Page background */
--paper-aged: #EDE8DC         /* Card backgrounds */
--ink-black: #1A1A2E          /* Primary text */
--pencil-gray: #4A5568        /* Secondary text */
--blueprint-navy: #1E3A5F     /* Headlines, CTAs, borders */
--stamp-red: #C53030          /* Stamps, warnings */
--highlighter: #F4D03F        /* Accents (40% opacity) */
```

### Typography
- **Headlines:** Source Serif 4 (already imported)
- **Body:** Inter (already imported)
- **Mono:** JetBrains Mono (already imported)
- **Condensed:** IBM Plex Sans Condensed (already imported)

### Key CSS Classes (already in index.css)
```css
.index-card          /* Bordered card with shadow */
.date-stamp          /* Rotated border stamp */
.exam-stamp-red      /* Red rotated stamp */
.topic-tag          /* Small label pill */
.ruler-divider      /* Technical divider line */
.graph-paper        /* Grid background pattern */
```

---

## Phase 1: Router Setup

### File: `frontend/src/App.tsx`

Replace the current single-page App with React Router.

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import './App.css';

// Simple auth check - replace with real auth context later
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  return { isAuthenticated, isLoading };
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-paper-cream flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
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
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/upgrade" element={
          <ProtectedRoute>
            <UpgradePage />
          </ProtectedRoute>
        } />

        <Route path="/success" element={
          <ProtectedRoute>
            <SuccessPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Course routes with sidebar layout */}
        <Route path="/course/:slug" element={
          <ProtectedRoute>
            <CourseLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CourseHome />} />
          <Route path="analysis" element={<CourseAnalysis />} />
          <Route path="analysis/:topicId" element={<TopicAnalysisDetail />} />
          <Route path="practice" element={<CoursePractice />} />
          <Route path="archive" element={<CourseArchive />} />
          <Route path="archive/midterm/:difficulty" element={<CourseMidterm />} />
          <Route path="question/:id" element={<QuestionPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Install React Router
```bash
cd frontend
npm install react-router-dom
```

---

## Phase 2: Create Page Components

### File Structure to Create

```
frontend/src/
├── pages/
│   ├── LandingPage.tsx          # Extract from current App.tsx
│   ├── SignupPage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── UpgradePage.tsx
│   ├── SuccessPage.tsx
│   ├── ProfilePage.tsx
│   └── course/
│       ├── CourseHome.tsx
│       ├── CourseAnalysis.tsx
│       ├── TopicAnalysisDetail.tsx
│       ├── CoursePractice.tsx
│       ├── CourseArchive.tsx
│       ├── CourseMidterm.tsx
│       └── QuestionPage.tsx
├── layouts/
│   └── CourseLayout.tsx
├── components/
│   └── auth/
│       ├── AuthHeader.tsx
│       └── AuthLayout.tsx
└── lib/
    └── api.ts                   # API client (create if not exists)
```

---

## Phase 3: Authentication Pages

### File: `frontend/src/components/auth/AuthLayout.tsx`

Split-screen layout for auth pages (signup/login).

```tsx
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Value prop */}
      <div className="hidden lg:flex lg:w-1/2 bg-blueprint-navy relative overflow-hidden">
        {/* Graph paper background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(245, 241, 232, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(245, 241, 232, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
          <span className="date-stamp !text-paper-cream !border-paper-cream/50 mb-8">
            2022-2024 Collection
          </span>

          <h1 className="font-serif font-semibold text-paper-cream text-4xl xl:text-5xl leading-tight mb-6">
            Real Questions From Real Exams
          </h1>

          <p className="font-sans text-paper-cream/70 text-lg leading-relaxed mb-8">
            Access 340+ exam problems from 12 universities. Study smarter with actual past exams.
          </p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-paper-cream/30 flex items-center justify-center">
              <span className="font-mono text-paper-cream text-xl">5</span>
            </div>
            <div>
              <p className="font-condensed text-paper-cream text-xs uppercase tracking-widest">
                Free Credits
              </p>
              <p className="font-sans text-paper-cream/60 text-sm">
                Per month. No credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* Technical footer */}
        <div className="absolute bottom-8 left-16 right-16">
          <div className="font-mono text-[8px] text-paper-cream/40 uppercase tracking-tighter">
            Drawing No. TESTAMENT-AUTH-2024 // Secure Connection // TLS 1.3
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 bg-paper-cream flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### File: `frontend/src/pages/SignupPage.tsx`

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Call API
    // const response = await api.post('/auth/register', formData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store token
    localStorage.setItem('jwt', 'fake-token');

    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          Create Account
        </h2>
        <p className="font-sans text-pencil-gray text-sm">
          Start with 5 free credits per month. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors"
            placeholder="you@university.edu"
          />
        </div>

        <div>
          <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors pr-10"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pencil-gray/50 hover:text-pencil-gray"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="font-sans text-pencil-gray/60 text-xs mt-1">
            Must be at least 8 characters with 1 number
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest py-4 hover:bg-ink-black transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Free Account'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-pencil-gray/20">
        <p className="font-sans text-pencil-gray text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blueprint-navy hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 flex items-center justify-center gap-6 text-pencil-gray/60">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>No spam</span>
        </div>
      </div>
    </AuthLayout>
  );
}
```

### File: `frontend/src/pages/LoginPage.tsx`

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Call API
    // const response = await api.post('/auth/login', formData);

    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('jwt', 'fake-token');
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          Welcome Back
        </h2>
        <p className="font-sans text-pencil-gray text-sm">
          Sign in to continue studying
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors"
            placeholder="you@university.edu"
          />
        </div>

        <div>
          <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pencil-gray/50 hover:text-pencil-gray"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-pencil-gray/30" />
            <span className="font-sans text-pencil-gray text-sm">Remember me</span>
          </label>
          <Link to="/forgot-password" className="font-sans text-blueprint-navy text-sm hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest py-4 hover:bg-ink-black transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-pencil-gray/20">
        <p className="font-sans text-pencil-gray text-sm text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blueprint-navy hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
```

---

## Phase 4: Dashboard Page

### File: `frontend/src/pages/DashboardPage.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, Zap, ChevronRight, GraduationCap } from 'lucide-react';

interface User {
  name: string;
  email: string;
  credits: number;
}

interface Course {
  id: string;
  slug: string;
  name: string;
  description: string;
  examCount: number;
  questionCount: number;
  topicsCount: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // TODO: Fetch from API
    // Simulate API response
    setUser({
      name: 'Alex Student',
      email: 'alex@university.edu',
      credits: 5,
    });

    setCourses([
      {
        id: '1',
        slug: 'calc2',
        name: 'Calculus 2',
        description: 'Integration techniques, series, applications',
        examCount: 12,
        questionCount: 340,
        topicsCount: 8,
      },
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-paper-cream">
      {/* Header */}
      <header className="bg-paper-cream border-b border-pencil-gray/10 sticky top-0 z-50">
        <div className="px-8 lg:px-[8vw] py-4 flex items-center justify-between">
          <Link to="/dashboard" className="font-serif font-semibold text-ink-black text-xl">
            Arkived
          </Link>

          <div className="flex items-center gap-6">
            {/* Credit balance */}
            <Link
              to="/upgrade"
              className="flex items-center gap-2 px-4 py-2 bg-blueprint-navy/10 hover:bg-blueprint-navy/20 transition-colors"
            >
              <Zap className="w-4 h-4 text-blueprint-navy" />
              <span className="font-mono font-medium text-blueprint-navy">
                {user?.credits || 0} credits
              </span>
            </Link>

            {/* Profile dropdown - simplified */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blueprint-navy flex items-center justify-center">
                <span className="font-serif text-paper-cream text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="font-sans text-pencil-gray text-sm hover:text-ink-black"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-8 lg:px-[8vw] py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="font-serif font-semibold text-ink-black text-3xl lg:text-4xl mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="font-sans text-pencil-gray">
            You have <span className="font-medium text-blueprint-navy">{user?.credits} credits</span> remaining.
          </p>
        </div>

        {/* Courses */}
        <div className="mb-12">
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
            Your Courses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.slug}`}
                className="group block index-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blueprint-navy/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blueprint-navy" />
                  </div>
                  <span className="date-stamp">Active</span>
                </div>

                <h3 className="font-serif font-semibold text-ink-black text-xl mb-2 group-hover:text-blueprint-navy transition-colors">
                  {course.name}
                </h3>
                <p className="font-sans text-pencil-gray text-sm mb-4">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-pencil-gray/70 mb-4">
                  <span>{course.examCount} exams</span>
                  <span>•</span>
                  <span>{course.questionCount} questions</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-pencil-gray/10">
                  <span className="font-condensed text-blueprint-navy text-xs uppercase tracking-widest">
                    Continue Studying
                  </span>
                  <ChevronRight className="w-4 h-4 text-blueprint-navy" />
                </div>
              </Link>
            ))}

            {/* Add new course card */}
            <div className="index-card p-6 border-dashed border-2 border-pencil-gray/30 flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="w-12 h-12 border-2 border-pencil-gray/30 flex items-center justify-center mb-4">
                <span className="font-serif text-pencil-gray text-2xl">+</span>
              </div>
              <p className="font-sans text-pencil-gray text-sm">
                More courses coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/upgrade"
              className="flex items-center gap-4 p-4 bg-paper-aged hover:bg-paper-aged/80 transition-colors"
            >
              <div className="w-10 h-10 bg-blueprint-navy flex items-center justify-center">
                <Zap className="w-5 h-5 text-paper-cream" />
              </div>
              <div>
                <h4 className="font-sans font-medium text-ink-black">Buy Credits</h4>
                <p className="font-sans text-pencil-gray text-sm">From $10/month</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-4 p-4 bg-paper-aged hover:bg-paper-aged/80 transition-colors"
            >
              <div className="w-10 h-10 bg-pencil-gray/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-pencil-gray" />
              </div>
              <div>
                <h4 className="font-sans font-medium text-ink-black">View Progress</h4>
                <p className="font-sans text-pencil-gray text-sm">Track your study stats</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## Phase 5: Course Layout with Sidebar

### File: `frontend/src/layouts/CourseLayout.tsx`

```tsx
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, BookOpen, Search, Zap, ChevronLeft, User } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

export default function CourseLayout() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // TODO: Fetch from API
  const userCredits = 8;
  const courseName = 'Calculus 2';

  const navItems: NavItem[] = [
    { path: `/course/${slug}`, label: 'Course Home', icon: Home },
    { path: `/course/${slug}/analysis`, label: 'Analysis', icon: BarChart3 },
    { path: `/course/${slug}/practice`, label: 'Practice', icon: BookOpen },
    { path: `/course/${slug}/archive`, label: 'Archive', icon: Search },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-paper-aged border-r border-pencil-gray/10 flex flex-col sticky top-0 h-screen">
        {/* Header */}
        <div className="p-6 border-b border-pencil-gray/10">
          <Link to="/dashboard" className="flex items-center gap-2 text-pencil-gray hover:text-ink-black mb-4">
            <ChevronLeft className="w-4 h-4" />
            <span className="font-sans text-sm">Back to Dashboard</span>
          </Link>
          <h2 className="font-serif font-semibold text-ink-black text-xl">
            {courseName}
          </h2>
          <span className="date-stamp mt-2 inline-block">Calc II</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 font-sans text-sm transition-colors ${
                      active
                        ? 'bg-blueprint-navy text-paper-cream'
                        : 'text-pencil-gray hover:bg-pencil-gray/10 hover:text-ink-black'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-pencil-gray/10">
          {/* Credits */}
          <Link
            to="/upgrade"
            className="flex items-center justify-between p-3 bg-paper-cream mb-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blueprint-navy" />
              <span className="font-sans text-sm text-pencil-gray">Credits</span>
            </div>
            <span className="font-mono font-medium text-blueprint-navy">{userCredits}</span>
          </Link>

          {/* Profile */}
          <div className="flex items-center justify-between">
            <Link to="/profile" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blueprint-navy flex items-center justify-center">
                <User className="w-4 h-4 text-paper-cream" />
              </div>
              <span className="font-sans text-sm text-pencil-gray">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="font-sans text-xs text-pencil-gray/60 hover:text-pencil-gray"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-paper-cream min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## Phase 6: Course Pages

### File: `frontend/src/pages/course/CourseHome.tsx`

```tsx
import { Link, useParams } from 'react-router-dom';
import { BarChart3, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';

export default function CourseHome() {
  const { slug } = useParams<{ slug: string }>();

  // TODO: Fetch from API
  const courseStats = {
    examsAnalyzed: 12,
    questions: 340,
    topics: 8,
    universities: 4,
  };

  const topics = [
    { name: 'Integration Techniques', frequency: '32%', questions: 45 },
    { name: 'Sequences & Series', frequency: '28%', questions: 38 },
    { name: 'Applications of Integration', frequency: '22%', questions: 30 },
    { name: 'Parametric & Polar', frequency: '18%', questions: 24 },
  ];

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-4">
          Course Overview
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="index-card p-4 text-center">
            <div className="font-mono text-2xl text-blueprint-navy">{courseStats.examsAnalyzed}</div>
            <div className="font-condensed text-pencil-gray text-xs uppercase tracking-widest">Exams</div>
          </div>
          <div className="index-card p-4 text-center">
            <div className="font-mono text-2xl text-blueprint-navy">{courseStats.questions}</div>
            <div className="font-condensed text-pencil-gray text-xs uppercase tracking-widest">Questions</div>
          </div>
          <div className="index-card p-4 text-center">
            <div className="font-mono text-2xl text-blueprint-navy">{courseStats.topics}</div>
            <div className="font-condensed text-pencil-gray text-xs uppercase tracking-widest">Topics</div>
          </div>
          <div className="index-card p-4 text-center">
            <div className="font-mono text-2xl text-blueprint-navy">{courseStats.universities}</div>
            <div className="font-condensed text-pencil-gray text-xs uppercase tracking-widest">Universities</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Link
          to={`/course/${slug}/analysis`}
          className="group index-card p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blueprint-navy/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blueprint-navy" />
            </div>
            <span className="topic-tag">2 credits</span>
          </div>
          <h3 className="font-serif font-semibold text-ink-black text-xl mb-2">
            View Exam Analysis
          </h3>
          <p className="font-sans text-pencil-gray text-sm mb-4">
            See topic frequency, difficulty distribution, and high-value areas across all exams.
          </p>
          <div className="flex items-center gap-2 text-blueprint-navy">
            <span className="font-condensed text-xs uppercase tracking-widest">Start Analysis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to={`/course/${slug}/practice`}
          className="group index-card p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blueprint-navy/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blueprint-navy" />
            </div>
            <span className="topic-tag">1 credit/question</span>
          </div>
          <h3 className="font-serif font-semibold text-ink-black text-xl mb-2">
            Practice Questions
          </h3>
          <p className="font-sans text-pencil-gray text-sm mb-4">
            Select your weak topics and practice with questions similar to past exams.
          </p>
          <div className="flex items-center gap-2 text-blueprint-navy">
            <span className="font-condensed text-xs uppercase tracking-widest">Start Practice</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Topics preview */}
      <div>
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
          Topics Covered
        </h2>

        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.name}
              className="flex items-center justify-between p-4 bg-paper-aged"
            >
              <div className="flex items-center gap-4">
                <CheckCircle className="w-5 h-5 text-blueprint-navy/40" />
                <span className="font-sans text-ink-black">{topic.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-sm text-pencil-gray">{topic.frequency}</span>
                <span className="font-condensed text-pencil-gray text-xs uppercase">
                  {topic.questions} questions
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### File: `frontend/src/pages/course/CourseAnalysis.tsx`

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';

interface AnalysisData {
  topicFrequency: { topicId: string; topic: string; percentage: number; points: number }[];
  difficultyDistribution: { level: string; percentage: number }[];
  highValueTopics: { topic: string; avgPoints: number; frequency: string }[];
  studyStrategy: string;
}

export default function CourseAnalysis() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  useEffect(() => {
    // TODO: Check if user has paid for analysis (2 credits)
    // Simulate API check
    setTimeout(() => {
      setHasAccess(true); // Set to false to test paywall
      setAnalysis({
        topicFrequency: [
          { topicId: 'series', topic: 'Sequences & Series', percentage: 32, points: 45 },
          { topicId: 'integration', topic: 'Integration Techniques', percentage: 28, points: 38 },
          { topicId: 'applications', topic: 'Applications', percentage: 22, points: 30 },
          { topicId: 'parametric', topic: 'Parametric & Polar', percentage: 18, points: 24 },
        ],
        difficultyDistribution: [
          { level: 'Easy', percentage: 30 },
          { level: 'Medium', percentage: 45 },
          { level: 'Hard', percentage: 25 },
        ],
        highValueTopics: [
          { topic: 'Series Convergence Tests', avgPoints: 15, frequency: 'Always' },
          { topic: 'Integration by Parts', avgPoints: 12, frequency: 'Often' },
          { topic: 'Volumes of Revolution', avgPoints: 14, frequency: 'Often' },
        ],
        studyStrategy: 'Focus on series convergence - it appears most frequently and is worth the most points. Practice identifying which test to use quickly.',
      });
      setIsLoading(false);
    }, 500);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-pencil-gray/20 w-1/3"></div>
          <div className="h-64 bg-pencil-gray/20"></div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 bg-blueprint-navy/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blueprint-navy" />
          </div>
          <h2 className="font-serif font-semibold text-ink-black text-2xl mb-4">
            Exam Analysis Locked
          </h2>
          <p className="font-sans text-pencil-gray mb-8 max-w-md mx-auto">
            Unlock detailed topic frequency, difficulty breakdown, and study strategy for 2 credits.
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest px-8 py-4 hover:bg-ink-black transition-colors"
          >
            Unlock for 2 Credits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
            Exam Analysis
          </h1>
          <p className="font-sans text-pencil-gray">
            Based on {12} exams from 2022-2024
          </p>
        </div>
        <span className="exam-stamp bg-paper-cream">Analysis Complete</span>
      </div>

      {/* Topic Frequency */}
      <section className="mb-12">
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
          Topic Frequency
        </h2>
        <div className="index-card p-6">
          <div className="space-y-4">
            {analysis?.topicFrequency.map((topic) => (
              <button
                key={topic.topic}
                onClick={() => navigate(`/course/${slug}/analysis/${topic.topicId}`)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-ink-black text-sm">{topic.topic}</span>
                  <span className="font-mono text-blueprint-navy">{topic.percentage}%</span>
                </div>
                <div className="h-2 bg-pencil-gray/10 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm bg-blueprint-navy"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
                <p className="font-sans text-pencil-gray/60 text-xs mt-1">
                  ~{topic.points} points per exam
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Difficulty Distribution */}
        <section>
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
            Difficulty Distribution
          </h2>
          <div className="index-card p-6">
            <div className="space-y-4">
              {analysis?.difficultyDistribution.map((item) => (
                <div key={item.level} className="flex items-center gap-4">
                  <span className="font-sans text-ink-black text-sm w-20">{item.level}</span>
                  <div className="flex-1 h-2 bg-pencil-gray/10 rounded-sm overflow-hidden">
                    <div
                      className={`h-full rounded-sm ${
                        item.level === 'Easy' ? 'bg-green-600' :
                        item.level === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm w-12 text-right">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* High Value Topics */}
        <section>
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
            High-Value Topics
          </h2>
          <div className="index-card p-6">
            <div className="space-y-4">
              {analysis?.highValueTopics.map((topic, i) => (
                <div key={topic.topic} className="flex items-center justify-between py-2 border-b border-pencil-gray/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-pencil-gray/40">{i + 1}</span>
                    <span className="font-sans text-ink-black text-sm">{topic.topic}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-blueprint-navy">{topic.avgPoints} pts</div>
                    <div className="font-sans text-pencil-gray/60 text-xs">{topic.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Study Strategy */}
      <section className="mt-12">
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
          Recommended Study Strategy
        </h2>
        <div className="index-card p-6 border-l-4 border-l-blueprint-navy">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-blueprint-navy flex-shrink-0 mt-0.5" />
            <p className="font-sans text-ink-black leading-relaxed">
              {analysis?.studyStrategy}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### File: `frontend/src/pages/course/TopicAnalysisDetail.tsx`

```tsx
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';

export default function TopicAnalysisDetail() {
  const { slug, topicId } = useParams<{ slug: string; topicId: string }>();

  // TODO: Fetch from API
  const topic = {
    name: 'Series Convergence Tests',
    frequency: 'Appears on 9/12 exams',
    commonTypes: ['Comparison Test', 'Ratio Test', 'Alternating Series'],
    trickySteps: [
      'Misidentifying the test when terms are similar',
      'Forgetting absolute convergence check',
    ],
    studyStrategy:
      'Practice picking the test in under 30 seconds. Build a decision tree and drill it.',
  };

  return (
    <div className="p-8 lg:p-12">
      <Link
        to={`/course/${slug}/analysis`}
        className="inline-flex items-center gap-2 text-pencil-gray hover:text-ink-black mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analysis
      </Link>

      <div className="mb-8">
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          {topic.name}
        </h1>
        <p className="font-sans text-pencil-gray">{topic.frequency}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="index-card p-6">
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-4">
            Common Question Types
          </h2>
          <ul className="space-y-2">
            {topic.commonTypes.map((type) => (
              <li key={type} className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-blueprint-navy/60" />
                <span className="font-sans text-ink-black">{type}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="index-card p-6">
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-4">
            Tricky Steps
          </h2>
          <ul className="space-y-2">
            {topic.trickySteps.map((step) => (
              <li key={step} className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-stamp-red/70" />
                <span className="font-sans text-ink-black">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="index-card p-6 border-l-4 border-l-blueprint-navy">
        <div className="flex items-start gap-4">
          <Lightbulb className="w-5 h-5 text-blueprint-navy flex-shrink-0 mt-0.5" />
          <p className="font-sans text-ink-black leading-relaxed">
            {topic.studyStrategy}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### File: `frontend/src/pages/course/CoursePractice.tsx`

```tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  questionCount: number;
}

export default function CoursePractice() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [userCredits] = useState(8); // TODO: From API

  const topics: Topic[] = [
    { id: '1', name: 'Integration by Parts', questionCount: 12 },
    { id: '2', name: 'Partial Fractions', questionCount: 8 },
    { id: '3', name: 'Series Convergence Tests', questionCount: 15 },
    { id: '4', name: 'Power Series', questionCount: 10 },
    { id: '5', name: 'Taylor Series', questionCount: 9 },
    { id: '6', name: 'Volumes of Revolution', questionCount: 11 },
    { id: '7', name: 'Arc Length', questionCount: 6 },
    { id: '8', name: 'Parametric Equations', questionCount: 8 },
  ];

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const estimatedQuestions = selectedTopics.length * 3;
  const cost = estimatedQuestions;
  const canAfford = userCredits >= cost;

  const handleStartPractice = () => {
    if (!canAfford || selectedTopics.length === 0) return;
    // Navigate to first question with selected topics
    navigate(`/course/${slug}/question/1?topics=${selectedTopics.join(',')}`);
  };

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          Practice Mode
        </h1>
        <p className="font-sans text-pencil-gray">
          Select topics you want to practice. Each question costs 1 credit.
        </p>
      </div>

      {/* Credit warning */}
      {userCredits < 3 && (
        <div className="mb-6 p-4 bg-stamp-red/10 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-stamp-red" />
          <p className="font-sans text-stamp-red text-sm">
            You only have {userCredits} credits left.{' '}
            <a href="/upgrade" className="underline">Buy more</a>
          </p>
        </div>
      )}

      {/* Topic selection */}
      <div className="mb-8">
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-4">
          Select Topics ({selectedTopics.length} selected)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`flex items-center justify-between p-4 text-left transition-all ${
                  isSelected
                    ? 'bg-blueprint-navy text-paper-cream'
                    : 'bg-paper-aged hover:bg-paper-aged/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 border flex items-center justify-center ${
                    isSelected ? 'border-paper-cream' : 'border-pencil-gray/30'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span className="font-sans">{topic.name}</span>
                </div>
                <span className={`font-mono text-xs ${isSelected ? 'text-paper-cream/70' : 'text-pencil-gray'}`}>
                  {topic.questionCount} available
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {selectedTopics.length > 0 && (
        <div className="index-card p-6 sticky bottom-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="font-sans text-pencil-gray text-sm mb-1">
                Estimated questions: <span className="font-mono text-ink-black">{estimatedQuestions}</span>
              </p>
              <p className="font-sans text-pencil-gray text-sm">
                Cost: <span className="font-mono text-ink-black">{cost} credits</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              {!canAfford && (
                <p className="font-sans text-stamp-red text-sm">
                  Need {cost - userCredits} more credits
                </p>
              )}
              <button
                onClick={handleStartPractice}
                disabled={!canAfford || selectedTopics.length === 0}
                className="flex items-center gap-2 bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest px-6 py-4 hover:bg-ink-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Practice
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### File: `frontend/src/pages/course/QuestionPage.tsx`

```tsx
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function QuestionPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [searchParams] = useSearchParams();
  const [showSolution, setShowSolution] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // TODO: Fetch from API based on question ID
  const question = {
    text: 'Evaluate the integral: ∫ x² e^x dx',
    topic: 'Integration by Parts',
    difficulty: 'Medium',
    points: 8,
    source: 'Midterm 2023, Question 4',
    solution: [
      'Use integration by parts: ∫ u dv = uv - ∫ v du',
      'Let u = x², dv = e^x dx',
      'Then du = 2x dx, v = e^x',
      '∫ x² e^x dx = x² e^x - ∫ 2x e^x dx',
      'Apply integration by parts again to ∫ 2x e^x dx',
      'Final answer: e^x (x² - 2x + 2) + C',
    ],
    totalQuestions: 5,
  };

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="topic-tag">{question.topic}</span>
          <span className="date-stamp">{question.difficulty}</span>
        </div>
        <div className="flex items-center gap-2 text-pencil-gray">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-sm">
            Question {currentQuestion} of {question.totalQuestions}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="index-card p-8 mb-6">
        <div className="font-serif text-ink-black text-xl lg:text-2xl leading-relaxed mb-6">
          {question.text}
        </div>

        <div className="flex items-center gap-4 text-sm text-pencil-gray">
          <span>{question.points} points</span>
          <span>•</span>
          <span>{question.source}</span>
        </div>
      </div>

      {/* Solution */}
      {showSolution ? (
        <div className="index-card p-8 bg-paper-aged">
          <h3 className="font-serif font-semibold text-ink-black text-lg mb-4">
            Solution
          </h3>
          <ol className="space-y-3">
            {question.solution.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-blueprint-navy flex-shrink-0">{i + 1}.</span>
                <span className="font-sans text-ink-black">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <button
          onClick={() => setShowSolution(true)}
          className="w-full p-8 border-2 border-dashed border-pencil-gray/30 flex items-center justify-center gap-3 hover:border-blueprint-navy hover:bg-blueprint-navy/5 transition-colors"
        >
          <Eye className="w-5 h-5 text-pencil-gray" />
          <span className="font-condensed text-pencil-gray uppercase tracking-widest">
            Show Solution (1 credit)
          </span>
        </button>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-8 border-t border-pencil-gray/10">
        <button
          disabled={currentQuestion <= 1}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          className="flex items-center gap-2 font-sans text-pencil-gray hover:text-ink-black disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: question.totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i + 1 === currentQuestion ? 'bg-blueprint-navy' : 'bg-pencil-gray/30'
              }`}
            />
          ))}
        </div>

        <button
          disabled={currentQuestion >= question.totalQuestions}
          onClick={() => setCurrentQuestion(prev => prev + 1)}
          className="flex items-center gap-2 font-sans text-pencil-gray hover:text-ink-black disabled:opacity-30 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

### File: `frontend/src/pages/course/CourseArchive.tsx`

```tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, BookOpen } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  source: string;
  year: number;
}

export default function CourseArchive() {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [mode, setMode] = useState<'browse' | 'topic' | 'midterm'>('browse');

  // TODO: Fetch from API
  const questions: Question[] = [
    {
      id: '1',
      text: 'Evaluate ∫ x² ln(x) dx',
      topic: 'Integration by Parts',
      difficulty: 'Medium',
      source: 'Midterm',
      year: 2023,
    },
    {
      id: '2',
      text: 'Determine if the series ∑ 1/n² converges',
      topic: 'Series Convergence',
      difficulty: 'Easy',
      source: 'Final',
      year: 2022,
    },
    // Add more...
  ];

  const topics = ['all', 'Integration by Parts', 'Series Convergence', 'Power Series', 'Taylor Series'];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          Exam Archive
        </h1>
        <p className="font-sans text-pencil-gray">
          Browse real past exam questions, practice 3-question topic bundles (1 credit),
          or generate a practice midterm (3 credits).
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setMode('browse')}
          className={`px-4 py-2 text-xs font-condensed uppercase tracking-widest ${
            mode === 'browse' ? 'bg-blueprint-navy text-paper-cream' : 'bg-paper-aged'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setMode('topic')}
          className={`px-4 py-2 text-xs font-condensed uppercase tracking-widest ${
            mode === 'topic' ? 'bg-blueprint-navy text-paper-cream' : 'bg-paper-aged'
          }`}
        >
          Topic Bundle
        </button>
        <button
          onClick={() => setMode('midterm')}
          className={`px-4 py-2 text-xs font-condensed uppercase tracking-widest ${
            mode === 'midterm' ? 'bg-blueprint-navy text-paper-cream' : 'bg-paper-aged'
          }`}
        >
          Practice Midterm
        </button>
      </div>

      {/* Filters (Browse mode) */}
      {mode === 'browse' && (
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pencil-gray" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-paper-cream border border-pencil-gray/30 font-sans text-sm focus:outline-none focus:border-blueprint-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-pencil-gray" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-3 bg-paper-cream border border-pencil-gray/30 font-sans text-sm focus:outline-none focus:border-blueprint-navy"
          >
            {topics.map(topic => (
              <option key={topic} value={topic}>
                {topic === 'all' ? 'All Topics' : topic}
              </option>
            ))}
          </select>
        </div>
      </div>
      )}

      {/* Results */}
      {mode === 'browse' && (
        <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            className="index-card p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="topic-tag text-[10px]">{question.topic}</span>
                  <span className={`date-stamp text-[9px] ${
                    question.difficulty === 'Easy' ? '!border-green-600 !text-green-600' :
                    question.difficulty === 'Hard' ? '!border-stamp-red !text-stamp-red' : ''
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                <p className="font-serif text-ink-black mb-2">{question.text}</p>
                <p className="font-sans text-pencil-gray/60 text-xs">
                  {question.source} {question.year}
                </p>
              </div>
              <div className="flex-shrink-0">
                <BookOpen className="w-5 h-5 text-pencil-gray/30" />
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            <p className="font-sans text-pencil-gray">No questions found matching your criteria.</p>
          </div>
        )}
        </div>
      )}

      {mode === 'topic' && (
        <div className="index-card p-6">
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-4">
            Topic Bundle (3 questions for 1 credit)
          </h2>
          <p className="font-sans text-pencil-gray mb-4">
            Select a topic above, then generate 3 questions from past exams.
          </p>
          <button className="btn-blueprint">Generate 3 Questions</button>
        </div>
      )}

      {mode === 'midterm' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['easy', 'sample', 'hard'].map((difficulty) => (
            <div key={difficulty} className="index-card p-6">
              <h3 className="font-serif text-ink-black mb-2 capitalize">
                {difficulty} Midterm
              </h3>
              <p className="font-sans text-pencil-gray text-sm mb-4">
                {difficulty === 'easy'
                  ? 'Shorter and easier mix'
                  : difficulty === 'hard'
                  ? 'Longest and toughest questions'
                  : 'Closest to real exam mix'}
              </p>
              <button className="btn-blueprint w-full">Start (3 credits)</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Phase 7: Payment Pages

### File: `frontend/src/pages/UpgradePage.tsx`

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Crown } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  credits?: number;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ElementType;
}

export default function UpgradePage() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 10,
      credits: 15,
      period: 'month',
      description: 'Best for steady practice',
      features: ['15 credits per month', 'Exam analysis + practice', 'Cancel anytime'],
      popular: true,
      icon: Zap,
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 20,
      period: 'month',
      description: 'All‑you‑can‑study',
      features: ['Unlimited credits', 'All courses included', 'Cancel anytime'],
      icon: Crown,
    },
  ];

  const handlePurchase = async (tierId: string) => {
    setSelectedTier(tierId);
    setIsProcessing(true);

    // TODO: Call API to create Stripe checkout session
    // const response = await api.post('/credits/purchase', { plan: tierId });
    // window.location.href = response.checkoutUrl;

    // Simulate for now
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/success');
  };

  return (
    <div className="min-h-screen bg-paper-cream">
      {/* Header */}
      <header className="bg-paper-cream border-b border-pencil-gray/10 px-8 lg:px-[8vw] py-4">
        <Link to="/dashboard" className="font-serif font-semibold text-ink-black text-xl">
          Arkived
        </Link>
      </header>

      <main className="px-8 lg:px-[8vw] py-12 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif font-semibold text-ink-black text-3xl lg:text-4xl mb-4">
            Choose Your Plan
          </h1>
          <p className="font-sans text-pencil-gray max-w-lg mx-auto">
            Monthly plans with predictable credits. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.id;

            return (
              <div
                key={tier.id}
                className={`index-card p-6 flex flex-col ${tier.popular ? 'ring-2 ring-blueprint-navy' : ''} ${
                  isSelected ? 'bg-paper-aged' : ''
                }`}
              >
                {tier.popular && (
                  <span className="inline-block bg-blueprint-navy text-paper-cream font-condensed text-[10px] uppercase tracking-widest px-3 py-1 mb-4 self-start">
                    Most Popular
                  </span>
                )}

                <div className="w-12 h-12 bg-blueprint-navy/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blueprint-navy" />
                </div>

                <h3 className="font-serif font-semibold text-ink-black text-xl mb-1">
                  {tier.name}
                </h3>
                <p className="font-sans text-pencil-gray text-sm mb-4">
                  {tier.description}
                </p>

                <div className="mb-6">
                  <span className="font-mono text-3xl text-blueprint-navy">
                    ${tier.price}
                  </span>
                  {tier.period && (
                    <span className="font-sans text-pencil-gray text-sm">/{tier.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-blueprint-navy flex-shrink-0" />
                      <span className="font-sans text-sm text-pencil-gray">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(tier.id)}
                  disabled={isProcessing}
                  className={`w-full py-4 font-condensed text-xs uppercase tracking-widest transition-colors ${
                    tier.popular
                      ? 'bg-blueprint-navy text-paper-cream hover:bg-ink-black'
                      : 'border-2 border-blueprint-navy text-blueprint-navy hover:bg-blueprint-navy hover:text-paper-cream'
                  } disabled:opacity-50`}
                >
                  {isProcessing && selectedTier === tier.id ? 'Processing...' : 'Purchase'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ / Info */}
        <div className="index-card p-6">
          <h3 className="font-serif font-semibold text-ink-black text-lg mb-4">
            Common Questions
          </h3>
          <div className="space-y-4">
            <div>
              <p className="font-sans font-medium text-ink-black text-sm mb-1">Do credits expire?</p>
              <p className="font-sans text-pencil-gray text-sm">Credits reset monthly based on your plan.</p>
            </div>
            <div>
              <p className="font-sans font-medium text-ink-black text-sm mb-1">Can I get a refund?</p>
              <p className="font-sans text-pencil-gray text-sm">Credits are non-refundable, but if you have issues, contact support.</p>
            </div>
            <div>
              <p className="font-sans font-medium text-ink-black text-sm mb-1">Is my payment secure?</p>
              <p className="font-sans text-pencil-gray text-sm">Yes, all payments are processed securely through Stripe.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### File: `frontend/src/pages/SuccessPage.tsx`

```tsx
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // TODO: Verify payment with backend using sessionId
    console.log('Payment session:', sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-paper-cream flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-4">
          Payment Successful!
        </h1>

        <p className="font-sans text-pencil-gray mb-8">
          Your credits have been added to your account. You're all set to continue studying.
        </p>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest py-4 hover:bg-ink-black transition-colors"
          >
            Continue Studying
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/profile"
            className="inline-flex items-center justify-center w-full font-sans text-pencil-gray text-sm hover:text-ink-black transition-colors"
          >
            View Purchase History
          </Link>
        </div>

        <p className="font-sans text-pencil-gray/60 text-xs mt-8">
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  );
}
```

### File: `frontend/src/pages/ProfilePage.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, CreditCard, History } from 'lucide-react';

interface User {
  name: string;
  email: string;
  credits: number;
  joinedAt: string;
}

interface Purchase {
  id: string;
  date: string;
  description: string;
  amount: number;
  credits: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    // TODO: Fetch from API
    setUser({
      name: 'Alex Student',
      email: 'alex@university.edu',
      credits: 5,
      joinedAt: '2024-02-01',
    });

    setPurchases([
      {
        id: '1',
        date: '2024-02-05',
        description: 'Starter Plan - 15 credits/month',
        amount: 10.0,
        credits: 15,
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-paper-cream">
      {/* Header */}
      <header className="bg-paper-cream border-b border-pencil-gray/10 px-8 lg:px-[8vw] py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-pencil-gray hover:text-ink-black">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-sans text-sm">Back to Dashboard</span>
          </Link>
          <span className="font-serif font-semibold text-ink-black">Arkived</span>
        </div>
      </header>

      <main className="px-8 lg:px-[8vw] py-12 max-w-3xl mx-auto">
        {/* Profile header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-blueprint-navy flex items-center justify-center">
            <span className="font-serif text-paper-cream text-3xl">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className="font-serif font-semibold text-ink-black text-2xl">{user?.name}</h1>
            <p className="font-sans text-pencil-gray">{user?.email}</p>
            <p className="font-sans text-pencil-gray/60 text-sm mt-1">
              Member since {user?.joinedAt}
            </p>
          </div>
        </div>

        {/* Credit balance */}
        <div className="index-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blueprint-navy/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blueprint-navy" />
              </div>
              <div>
                <p className="font-sans text-pencil-gray text-sm">Current Balance</p>
                <p className="font-mono text-3xl text-blueprint-navy">{user?.credits} credits</p>
              </div>
            </div>
            <Link
              to="/upgrade"
              className="bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest px-6 py-3 hover:bg-ink-black transition-colors"
            >
              Buy More
            </Link>
          </div>
        </div>

        {/* Purchase history */}
        <div>
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
            Purchase History
          </h2>

          {purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="index-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-paper-aged flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-pencil-gray" />
                    </div>
                    <div>
                      <p className="font-sans text-ink-black">{purchase.description}</p>
                      <p className="font-sans text-pencil-gray/60 text-sm">{purchase.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-ink-black">${purchase.amount}</p>
                    <p className="font-sans text-pencil-gray/60 text-xs">+{purchase.credits} credits</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 index-card">
              <History className="w-12 h-12 text-pencil-gray/30 mx-auto mb-4" />
              <p className="font-sans text-pencil-gray">No purchases yet</p>
              <Link
                to="/upgrade"
                className="inline-block mt-4 text-blueprint-navy hover:underline font-sans text-sm"
              >
                Buy your first credits
              </Link>
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="mt-12 pt-8 border-t border-pencil-gray/10">
          <button
            onClick={() => {
              localStorage.removeItem('jwt');
              window.location.href = '/';
            }}
            className="font-sans text-pencil-gray hover:text-stamp-red transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
```

---

## Phase 8: Extract Landing Page

### File: `frontend/src/pages/LandingPage.tsx`

Extract the current landing page sections from `App.tsx` into its own page component.

```tsx
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '../sections/Navigation';
import HeroSection from '../sections/HeroSection';
import ArchiveBrowse from '../sections/ArchiveBrowse';
import TopicBreakdown from '../sections/TopicBreakdown';
import QuestionSpotlight from '../sections/QuestionSpotlight';
import TopicDeepDive from '../sections/TopicDeepDive';
import StudyFlow from '../sections/StudyFlow';
import ContactSection from '../sections/ContactSection';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  useEffect(() => {
    // Global scroll snap for pinned sections
    const setupSnap = () => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;

            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    };

    // Delay to let sections initialize
    const timer = setTimeout(setupSnap, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Paper texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <Navigation onNavigate={scrollToSection} />

      <main className="relative">
        <div className="relative z-10">
          <HeroSection className="relative" />
        </div>
        <div className="relative z-20">
          <ArchiveBrowse className="relative" />
        </div>
        <div className="relative z-30">
          <TopicBreakdown className="relative" />
        </div>
        <div className="relative z-40">
          <QuestionSpotlight className="relative" />
        </div>
        <div className="relative z-50">
          <TopicDeepDive className="relative" />
        </div>
        <div className="relative z-60">
          <StudyFlow className="relative" />
        </div>
        <div className="relative z-70">
          <ContactSection className="relative" />
        </div>
      </main>
    </div>
  );
}
```

---

## API Client

### File: `frontend/src/lib/api.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {}, requireAuth = true } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (requireAuth) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      window.location.href = '/login';
      throw new Error('Not authenticated');
    }
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('jwt');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (response.status === 402) {
    window.location.href = '/upgrade';
    throw new Error('Payment required');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Auth endpoints
export const auth = {
  register: (data: { name: string; email: string; password: string }) =>
    apiFetch('/api/auth/register', { method: 'POST', body: data, requireAuth: false }),

  login: (data: { email: string; password: string }) =>
    apiFetch('/api/auth/login', { method: 'POST', body: data, requireAuth: false }),

  me: () => apiFetch('/api/auth/me'),
};

// Course endpoints
export const courses = {
  list: () => apiFetch('/api/courses'),
  get: (slug: string) => apiFetch(`/api/courses/${slug}`),
  analysis: (slug: string) => apiFetch(`/api/courses/${slug}/analysis`),
};

// Question endpoints
export const questions = {
  list: (params?: { courseId?: string; topic?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiFetch(`/api/questions${query}`);
  },
  get: (id: string) => apiFetch(`/api/questions/${id}`),
  reveal: (id: string) => apiFetch(`/api/questions/${id}/reveal`, { method: 'POST' }),
};

// Credit endpoints
export const credits = {
  balance: () => apiFetch('/api/credits/balance'),
  purchase: (tierId: string) => apiFetch('/api/credits/purchase', { method: 'POST', body: { tierId } }),
};
```

---

## Environment Variables

### File: `frontend/.env.example`

```bash
VITE_API_URL=http://localhost:8787
```

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Install `react-router-dom`
- [ ] Create file structure (pages/, layouts/, components/auth/)
- [ ] Update App.tsx with router
- [ ] Create api.ts client

### Phase 2: Auth
- [ ] AuthLayout component
- [ ] SignupPage
- [ ] LoginPage
- [ ] Test auth flow

### Phase 3: Dashboard
- [ ] DashboardPage
- [ ] Header with credit display
- [ ] Course cards
- [ ] Navigation links

### Phase 4: Course Layout
- [ ] CourseLayout with sidebar
- [ ] Navigation between course pages
- [ ] Credit display in sidebar

### Phase 5: Course Pages
- [ ] CourseHome (overview)
- [ ] CourseAnalysis (with paywall)
- [ ] TopicAnalysisDetail (deep dive per topic)
- [ ] CoursePractice (topic selection)
- [ ] QuestionPage (individual question)
- [ ] CourseArchive (browse + topic bundles + midterm launch)
- [ ] CourseMidterm (easy/sample/hard session)

### Phase 6: Payment
- [ ] UpgradePage (pricing tiers)
- [ ] SuccessPage
- [ ] ProfilePage (with purchase history)

### Phase 7: Polish
- [ ] LandingPage extraction
- [ ] Update Navigation.tsx with signup link
- [ ] Test all routes
- [ ] Responsive testing

---

## Notes for Codex

1. **Use existing CSS classes** - All the design tokens and utility classes are already in `index.css`
2. **Follow the patterns** - Look at existing section components for structure
3. **Keep it simple** - Use mock data for now, wire up to API later
4. **Test as you go** - Run `npm run dev` and verify each page works
5. **Responsive first** - All pages should work on mobile and desktop

## Commands

```bash
cd frontend

# Install router
npm install react-router-dom

# Dev server
npm run dev

# Build check
npm run build
```
