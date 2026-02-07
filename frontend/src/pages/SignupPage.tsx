import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { apiPost } from '../lib/api';

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

    try {
      const response = await apiPost<{ token: string }>('/api/auth/register', formData);
      localStorage.setItem('session', response.token);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
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
