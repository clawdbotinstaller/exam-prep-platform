import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown } from 'lucide-react';
import Navbar from '../components/Navbar';

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

    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/success');
  };

  return (
    <div className="min-h-screen bg-paper-cream">
      <Navbar credits={0} plan="free" userName="" />

      <main className="px-8 lg:px-[8vw] py-12 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="font-serif font-semibold text-ink-black text-3xl lg:text-4xl">
              Unlock Everything
            </h1>
            <span className="exam-stamp-red text-[9px] bg-paper-cream">INSTANT ACCESS</span>
          </div>
          <p className="font-sans text-pencil-gray max-w-lg mx-auto">
            Solutions to every question. Pattern analysis. Full access to the archive.
            Stop running out of credits mid-study session.
          </p>
        </div>

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
                <p className="font-sans text-pencil-gray text-sm mb-4">{tier.description}</p>

                <div className="mb-4">
                  <span className="font-serif text-ink-black text-3xl">${tier.price}</span>
                  <span className="font-sans text-pencil-gray text-sm">
                    /{tier.period}
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-blueprint-navy" />
                      <span className="font-sans text-pencil-gray">{feature}</span>
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

        <div className="checkout-card">
          <div className="checkout-card-inner">
            <div className="flex items-center justify-between border-b-2 border-blueprint-navy pb-3 mb-4">
              <h3 className="font-serif font-semibold text-ink-black text-lg">Common Questions</h3>
              <span className="font-mono text-[10px] uppercase text-pencil-gray">FAQ-2024</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-sans font-medium text-ink-black text-sm mb-1">Do credits expire?</p>
                <p className="font-sans text-pencil-gray text-sm">
                  Monthly credits reset. But the patterns you learn? Those stay with you.
                </p>
              </div>
              <div>
                <p className="font-sans font-medium text-ink-black text-sm mb-1">Can I cancel?</p>
                <p className="font-sans text-pencil-gray text-sm">
                  Anytime. No hoops. No "contact support first." Just cancel.
                </p>
              </div>
              <div>
                <p className="font-sans font-medium text-ink-black text-sm mb-1">Is this secure?</p>
                <p className="font-sans text-pencil-gray text-sm">
                  Stripe handles payments. We never see your card. Ever.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-pencil-gray/10 text-center">
              <span className="library-stamp">APPROVED FOR PURCHASE</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
