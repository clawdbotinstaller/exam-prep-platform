import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

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
      <Navbar credits={user?.credits ?? 0} userName={user?.name} />

      <main className="px-8 lg:px-[8vw] py-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-blueprint-navy flex items-center justify-center">
            <span className="font-serif text-paper-cream text-3xl">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className="font-serif font-semibold text-ink-black text-2xl">{user?.name}</h1>
            <p className="font-sans text-pencil-gray">{user?.email}</p>
            <p className="font-sans text-pencil-gray text-sm mt-1">
              Joined {user?.joinedAt}
            </p>
          </div>
        </div>

        <div className="index-card p-6 mb-8">
          <h2 className="font-serif font-semibold text-ink-black text-lg mb-4">Credits</h2>
          <p className="font-sans text-pencil-gray">
            Current balance: <span className="font-mono text-ink-black">{user?.credits}</span>
          </p>
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
