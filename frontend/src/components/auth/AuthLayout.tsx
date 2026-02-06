import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-blueprint-navy relative overflow-hidden">
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

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
          <span className="date-stamp !text-paper-cream !border-paper-cream/50 mb-8">
            2022-2024 Collection
          </span>

          <h1 className="font-serif font-semibold text-paper-cream text-4xl xl:text-5xl leading-tight mb-6">
            Stop Guessing What's On The Exam
          </h1>

          <p className="font-sans text-paper-cream/70 text-lg leading-relaxed mb-8">
            Your professor recycles the same problem structures. We collected them—all the
            integration by parts setups, the ratio tests, the volume problems. See what's actually
            coming before you sit down.
          </p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-paper-cream/30 flex items-center justify-center">
              <span className="font-mono text-paper-cream text-xl">5</span>
            </div>
            <div>
              <p className="font-condensed text-paper-cream text-xs uppercase tracking-widest">
                Free Solutions
              </p>
              <p className="font-sans text-paper-cream/60 text-sm">
                Every month. No credit card to start.
              </p>
            </div>
          </div>
        </div>

        {/* Technical drawing footer */}
        <div className="absolute bottom-8 left-16 right-16">
          <div className="flex items-center justify-between border-t border-paper-cream/20 pt-4">
            <div className="font-mono text-[8px] text-paper-cream/40 uppercase tracking-tighter">
              Drawing No. AUTH-2024-SECURE // Technical Document // No. 0041-A
            </div>
            <div className="flex items-center gap-6 font-mono text-[8px] text-paper-cream/60">
              <span>SYSTEM: SECURE</span>
              <span>CONN: TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-paper-cream flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
