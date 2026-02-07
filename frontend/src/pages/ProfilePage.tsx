import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiGet } from '../lib/api';

interface User {
  id: string;
  email: string;
  credits: number;
  has_unlimited: boolean;
  unlimited_until: string | null;
  credits_reset_at: string | null;
  created_at: string;
}

interface UserApiResponse {
  user: User;
}

interface CreditsApiResponse {
  credits: number;
  has_unlimited: boolean;
  unlimited_until: string | null;
  credits_reset_at: string | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data and credits balance in parallel
        const [userData, creditsData] = await Promise.all([
          apiGet<UserApiResponse>('/api/auth/me'),
          apiGet<CreditsApiResponse>('/api/credits/balance'),
        ]);

        // Merge user data with credits data (credits endpoint has the latest credits info)
        setUser({
          ...userData.user,
          credits: creditsData.credits,
          has_unlimited: creditsData.has_unlimited,
          unlimited_until: creditsData.unlimited_until,
          credits_reset_at: creditsData.credits_reset_at,
        });

        // TODO: Fetch real purchase history when API endpoint is available
        setPurchases([
          {
            id: '1',
            date: '2024-02-05',
            description: 'Starter Plan - 15 credits/month',
            amount: 10.0,
            credits: 15,
          },
        ]);
      } catch (err) {
        if (err instanceof Error && err.message.includes('401')) {
          // User is not logged in, redirect to login
          navigate('/login');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [navigate]);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get display name (use email prefix if no name available)
  const displayName = user?.email ? user.email.split('@')[0] : 'User';

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-cream">
        <Navbar credits={0} />
        <main className="px-8 lg:px-[8vw] py-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="font-sans text-pencil-gray">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper-cream">
        <Navbar credits={0} />
        <main className="px-8 lg:px-[8vw] py-12 max-w-3xl mx-auto">
          <div className="index-card p-6 text-center">
            <p className="font-sans text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blueprint-navy text-paper-cream font-sans rounded hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-cream">
      <Navbar credits={user?.credits ?? 0} userName={displayName} />

      <main className="px-8 lg:px-[8vw] py-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-blueprint-navy flex items-center justify-center">
            <span className="font-serif text-paper-cream text-3xl">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-serif font-semibold text-ink-black text-2xl capitalize">{displayName}</h1>
            <p className="font-sans text-pencil-gray">{user?.email}</p>
            <p className="font-sans text-pencil-gray text-sm mt-1">
              Joined {user?.created_at ? formatDate(user.created_at) : '-'}
            </p>
          </div>
        </div>

        <div className="index-card p-6 mb-8">
          <h2 className="font-serif font-semibold text-ink-black text-lg mb-4">Credits</h2>
          <p className="font-sans text-pencil-gray">
            Current balance: <span className="font-mono text-ink-black">{user?.credits ?? 0}</span>
          </p>
          {user?.has_unlimited && (
            <p className="font-sans text-green-600 text-sm mt-2">
              Unlimited access enabled
              {user.unlimited_until && (
                <span> until {formatDate(user.unlimited_until)}</span>
              )}
            </p>
          )}
          {user?.credits_reset_at && (
            <p className="font-sans text-pencil-gray text-sm mt-2">
              Credits reset at: {formatDate(user.credits_reset_at)}
            </p>
          )}
        </div>

        <div className="index-card p-6">
          <h2 className="font-serif font-semibold text-ink-black text-lg mb-4">Purchase History</h2>
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-ink-black text-sm">{purchase.description}</p>
                  <p className="font-sans text-pencil-gray text-xs">{purchase.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-ink-black">${purchase.amount.toFixed(2)}</p>
                  <p className="font-sans text-pencil-gray text-xs">{purchase.credits} credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
