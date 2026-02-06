import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronRight, GraduationCap, Zap } from 'lucide-react';
import { apiGet } from '../lib/api';
import Navbar from '../components/Navbar';

interface User {
  name: string;
  email: string;
  credits: number;
  plan: 'free' | 'starter' | 'unlimited';
}

interface Course {
  id: string;
  slug: string;
  name: string;
  description: string;
  examCount: number;
  questionCount: number;
  topicsCount: number;
  exam_count?: number;
  question_count?: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiGet<{ user: User }>('/api/auth/me');
        setUser(me.user);
        const courseResp = await apiGet<{ courses: Course[] }>('/api/courses');
        setCourses(courseResp.courses.map((course) => ({
          ...course,
          slug: course.id,
          examCount: course.exam_count ?? course.examCount ?? 0,
          questionCount: course.question_count ?? course.questionCount ?? 0,
          topicsCount: course.topicsCount ?? 0,
        })));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-paper-cream">
      <Navbar
        credits={user?.credits ?? 0}
        plan={user?.plan}
        userName={user?.name}
      />

      <main className="px-8 lg:px-[8vw] py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif font-semibold text-ink-black text-3xl lg:text-4xl">
              Ready to study?
            </h1>
            <span className="date-stamp">
              {user?.plan === 'unlimited' ? 'UNLIMITED' : `${user?.credits} CREDITS`}
            </span>
          </div>
          <p className="font-sans text-pencil-gray">
            Pick up where you left off. Same patterns, different numbers.
          </p>
        </div>

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

            <div className="index-card p-6 border-dashed border-2 border-pencil-gray/30 flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="w-12 h-12 border-2 border-pencil-gray/30 flex items-center justify-center mb-4">
                <span className="font-serif text-pencil-gray text-2xl">+</span>
              </div>
              <p className="font-sans text-pencil-gray text-sm">More courses coming soon</p>
            </div>
          </div>
        </div>

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
                <h4 className="font-sans font-medium text-ink-black">Upgrade Plan</h4>
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
