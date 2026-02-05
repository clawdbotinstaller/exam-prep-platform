import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Upload, CheckCircle } from 'lucide-react';

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
    school: '',
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-serif font-semibold text-paper-cream text-3xl lg:text-4xl xl:text-5xl leading-tight">
                Get access to the archive
              </h2>
            </div>
            <p className="font-sans text-paper-cream/70 text-base lg:text-lg leading-relaxed mb-8">
              We review requests weekly. Students and educators welcome.
            </p>
            <div className="flex items-center gap-2 text-paper-cream/60">
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              <button className="font-condensed text-xs uppercase tracking-widest hover:text-highlighter-yellow transition-colors underline underline-offset-4">
                Submit an exam
              </button>
            </div>
          </div>

          {/* Right form */}
          <div
            ref={formRef}
            className="lg:w-[50vw] lg:max-w-xl bg-paper-cream rounded-sm p-6 lg:p-10 index-card"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-blueprint-navy mb-4" strokeWidth={1.5} />
                <h3 className="font-serif font-semibold text-ink-black text-xl mb-2">
                  Request received!
                </h3>
                <p className="font-sans text-pencil-gray text-sm">
                  We'll review your request and get back to you within 3-5 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    School
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    required
                    className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors"
                    placeholder="University name"
                  />
                </div>

                <div>
                  <label className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2 block">
                    Message (optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-paper-cream border border-pencil-gray/30 rounded-sm px-4 py-3 font-sans text-ink-black text-sm placeholder:text-pencil-gray/50 focus:outline-none focus:border-blueprint-navy transition-colors resize-none"
                    placeholder="Tell us how you'll use the archive..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 hover:bg-ink-black transition-colors"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  Request Access
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-paper-cream/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-paper-cream text-lg">
              Calc2Archive
            </span>
            <span className="date-stamp !text-paper-cream !border-paper-cream/50">v1.0</span>
          </div>
          <p className="font-condensed text-paper-cream/50 text-[10px] uppercase tracking-widest text-center sm:text-right">
            Real exam questions from real universities. 2022–2024.
          </p>
        </div>
      </div>
    </section>
  );
}
