import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, CheckCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface ContactSectionProps {
  className?: string;
}

export default function ContactSection({ className = '' }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

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
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Form animation
      gsap.fromTo(
        formRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          {/* Left side - Value prop */}
          <div ref={headlineRef} className="lg:max-w-md">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="date-stamp !text-paper-cream !border-paper-cream/50">
                <UserPlus className="w-3 h-3 inline mr-1" strokeWidth={2} />
                Free to Start
              </span>
            </div>

            <h2 className="font-serif font-semibold text-paper-cream text-3xl lg:text-4xl xl:text-5xl leading-tight mb-4">
              Build Pattern Recognition
            </h2>
            <p className="font-sans text-paper-cream/70 text-base lg:text-lg leading-relaxed mb-8">
              Free accounts see every question. Upgrade when you're ready for the solutions
              and want to track which patterns you've mastered.
            </p>

            {/* Benefits list */}
            <div className="space-y-4 mb-8">
              {[
                { title: 'See every question', desc: 'Full archive, no paywall on problems' },
                { title: 'Solutions when you need them', desc: 'Step-by-step worked by hand, not AI' },
                { title: 'Track what you know', desc: 'Mark patterns mastered, find your gaps' },
              ].map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-highlighter-yellow flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <span className="font-sans text-paper-cream font-medium text-sm block">{benefit.title}</span>
                    <span className="font-sans text-paper-cream/60 text-sm">{benefit.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-paper-cream text-blueprint-navy font-condensed text-xs uppercase tracking-widest px-6 py-3 border border-paper-cream/80 hover:bg-paper-cream/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" strokeWidth={1.5} />
              Start Free
            </Link>
          </div>

          {/* Right side - Contact form */}
          <div
            ref={formRef}
            className="lg:w-[50vw] lg:max-w-xl checkout-card"
          >
            {submitted ? (
              <div className="checkout-card-inner flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-blueprint-navy mb-4" strokeWidth={1.5} />
                <h3 className="font-serif font-semibold text-ink-black text-xl mb-2">
                  Message sent!
                </h3>
                <p className="font-sans text-pencil-gray text-sm">
                  We'll get back to you soon.
                </p>
              </div>
            ) : (
              <div className="checkout-card-inner">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-blueprint-navy pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tighter text-blueprint-navy">
                      Contact Us
                    </h2>
                    <p className="font-mono text-[10px] uppercase text-pencil-gray">
                      Questions? We're here.
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blueprint-navy/10 flex items-center justify-center">
                    <Send className="w-5 h-5 text-blueprint-navy" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Contact form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors"
                        placeholder="you@university.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors resize-none"
                      placeholder="Questions, feedback, or just saying hi..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 hover:bg-highlighter-yellow hover:text-blueprint-navy transition-colors"
                  >
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    Send Message
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
              Arkived
            </span>
            <span className="date-stamp !text-paper-cream !border-paper-cream/50">v1.0</span>
          </div>
          <p className="font-condensed text-paper-cream/50 text-[10px] uppercase tracking-widest text-center sm:text-right">
            Real exam questions from real universities. 2022–2024.
          </p>
        </div>

        {/* Technical drawing footer */}
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
