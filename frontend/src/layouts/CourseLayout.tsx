import { useEffect, useState } from 'react';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, BookOpen, Search, Zap, ChevronLeft, User } from 'lucide-react';
import { apiGet, API_URL } from '../lib/api';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

export default function CourseLayout() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [userCredits, setUserCredits] = useState(0);
  const [plan, setPlan] = useState<'free' | 'starter' | 'unlimited'>('free');
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
    fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('session')}` },
    }).catch(() => undefined);
    localStorage.removeItem('session');
    navigate('/');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const balance = await apiGet<{ credits: number; plan: 'free' | 'starter' | 'unlimited' }>('/api/credits/balance');
        setUserCredits(balance.credits);
        setPlan(balance.plan);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-paper-aged border-r border-pencil-gray/10 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-pencil-gray/10">
          <Link to="/dashboard" className="flex items-center gap-2 text-pencil-gray hover:text-ink-black mb-4">
            <ChevronLeft className="w-4 h-4" />
            <span className="font-sans text-sm">Back to Dashboard</span>
          </Link>
          <h2 className="font-serif font-semibold text-ink-black text-xl">{courseName}</h2>
          <span className="date-stamp mt-2 inline-block">Calc II</span>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
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

        <div className="p-4 border-t border-pencil-gray/10">
          <Link
            to="/upgrade"
            className="flex items-center gap-2 px-3 py-2 bg-blueprint-navy/10 hover:bg-blueprint-navy/20 transition-colors"
          >
            <Zap className="w-4 h-4 text-blueprint-navy" />
            <span className="font-mono text-sm text-blueprint-navy">
              {plan === 'unlimited' ? 'Unlimited' : `${userCredits} credits`}
            </span>
          </Link>

          <div className="flex items-center justify-between mt-4">
            <Link to="/profile" className="flex items-center gap-2 text-pencil-gray hover:text-ink-black">
              <User className="w-4 h-4" />
              <span className="font-sans text-sm">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="font-sans text-sm text-pencil-gray hover:text-ink-black"
            >
              Sign out
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-pencil-gray/10">
            <div className="font-mono text-[7px] text-pencil-gray/40 uppercase tracking-tighter">
              SYS: ONLINE • DOC: 0082-C2
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-paper-cream">
        <Outlet />
      </main>
    </div>
  );
}
