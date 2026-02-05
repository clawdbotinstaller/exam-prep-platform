import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

// Import sections
import Navigation from './sections/Navigation';
import HeroSection from './sections/HeroSection';
import ArchiveBrowse from './sections/ArchiveBrowse';
import TopicBreakdown from './sections/TopicBreakdown';
import QuestionSpotlight from './sections/QuestionSpotlight';
import TopicDeepDive from './sections/TopicDeepDive';
import StudyFlow from './sections/StudyFlow';
import ContactSection from './sections/ContactSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Wait for all sections to mount and create their ScrollTriggers
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;

            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={mainRef} className="relative">
      {/* Paper texture overlay */}
      <div className="paper-texture" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main content */}
      <main className="relative">
        <HeroSection className="z-10" />
        <ArchiveBrowse className="z-20" />
        <TopicBreakdown className="z-30" />
        <QuestionSpotlight className="z-40" />
        <TopicDeepDive className="z-50" />
        <StudyFlow className="z-60" />
        <ContactSection className="z-70" />
      </main>
    </div>
  );
}

export default App;
