import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { apiPost } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiPost<{ token: string }>('/api/auth/login', formData);
      localStorage.setItem('session', response.token);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        const statusMatch = err.message.match(/Request failed: (\d+)/);
        const status = statusMatch ? parseInt(statusMatch[1], 10) : null;
        if (status === 401) {
          setError('Invalid email or password');
        } else if (status === 400) {
          setError('Please fill in all fields');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
    }
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
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setError(null);
            }}
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
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError(null);
              }}
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
          <span className="font-sans text-blueprint-navy text-sm">Forgot password?</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-red-700 text-sm font-sans">
            {error}
          </div>
        )}

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
