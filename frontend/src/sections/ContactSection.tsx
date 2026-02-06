import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreditCard, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ContactSectionProps {
  className?: string;
}

export default function ContactSection({ className = '' }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );

      // Form animation
      gsap.fromTo(
        formRef.current,
        { x: '8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={`py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#1E3A5F' }}
    >
      {/* Subtle blueprint grid */}
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

      <div className="px-8 lg:px-[8vw] relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-16">
          {/* Left headline */}
          <div ref={headlineRef} className="lg:max-w-md">
            <h2 className="font-serif font-semibold text-paper-cream text-3xl lg:text-4xl xl:text-5xl leading-tight mb-4">
              Permanent Archive Access
            </h2>
            <p className="font-sans text-paper-cream/70 text-base lg:text-lg leading-relaxed mb-8">
              One-time checkout. Unlimited renewals. Access to all 340+ problems with step-by-step solutions.
            </p>
          </div>

          {/* Right checkout card */}
          <div
            ref={formRef}
            className="lg:w-[50vw] lg:max-w-xl checkout-card"
          >
            {submitted ? (
              <div className="checkout-card-inner flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-blueprint-navy mb-4" strokeWidth={1.5} />
                <h3 className="font-serif font-semibold text-ink-black text-xl mb-2">
                  Welcome to the archive!
                </h3>
                <p className="font-sans text-pencil-gray text-sm">
                  Your access is now active. Start studying!
                </p>
              </div>
            ) : (
              <div className="checkout-card-inner">
                {/* Header */}
                <div className="flex justify-between items-end border-b-2 border-blueprint-navy pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tighter text-blueprint-navy">
                      Full Archive Access
                    </h2>
                    <p className="font-mono text-[10px] uppercase text-pencil-gray">
                      Form: PERMANENT CHECKOUT
                    </p>
                  </div>
                  <div className="text-4xl font-mono font-bold text-blueprint-navy">
                    $12
                  </div>
                </div>

                {/* Checkout details */}
                <div className="space-y-2 font-mono text-xs uppercase mb-8">
                  <div className="flex justify-between">
                    <span className="text-pencil-gray">Due Date:</span>
                    <span className="font-semibold text-blueprint-navy">END OF SEMESTER</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pencil-gray">Renewals:</span>
                    <span className="font-semibold text-blueprint-navy">UNLIMITED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pencil-gray">Late Fees:</span>
                    <span className="font-semibold text-blueprint-navy">NONE</span>
                  </div>
                </div>

                {/* Email + CTA */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors"
                      placeholder="you@university.edu"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 hover:bg-highlighter-yellow hover:text-blueprint-navy transition-colors"
                  >
                    <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                    Purchase Access
                  </button>
                </form>

                {/* Library stamp */}
                <div className="text-center mt-6">
                  <span className="library-stamp">APPROVED FOR RELEASE</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-paper-cream/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-paper-cream text-lg">
              Testament
            </span>
            <span className="date-stamp !text-paper-cream !border-paper-cream/50">v1.0</span>
          </div>
          <p className="font-condensed text-paper-cream/50 text-[10px] uppercase tracking-widest text-center sm:text-right">
            Real exam questions from real universities. 2022–2024.
          </p>
        </div>

        {/* Technical drawing footer - from Stitch */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-paper-cream/10 mt-4">
          <div className="font-mono text-[8px] text-paper-cream/40 uppercase tracking-tighter">
            Drawing No. CALC-II-2024-REF // Technical Document // No. 0082-C2
          </div>
          <div className="flex items-center gap-6 font-mono text-[8px] text-paper-cream/60">
            <span>SYSTEM: STABLE</span>
            <span>DATA_STREAM: ACTIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
