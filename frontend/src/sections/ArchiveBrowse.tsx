import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';
import LatexRenderer from '../components/LatexRenderer';

gsap.registerPlugin(ScrollTrigger);

interface ArchiveBrowseProps {
  className?: string;
}

interface Question {
  id: string;
  question_text: string;
  source_points: number;
  source_exam_year: number;
  source_exam_type: string;
  topic_name: string;
  difficulty: number;
}

interface Topic {
  id: string;
  name: string;
}

const filters = ['All', 'Integration', 'Series', 'DiffEq', 'Word Problems'];

export default function ArchiveBrowse({ className = '' }: ArchiveBrowseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState('All');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions and topics on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch questions
        const questionsRes = await fetch(`${API_URL}/api/questions?limit=20`);
        if (!questionsRes.ok) throw new Error('Failed to fetch questions');
        const questionsData = await questionsRes.json();

        // Fetch topics for mapping
        const topicsRes = await fetch(`${API_URL}/api/topics`);
        if (!topicsRes.ok) throw new Error('Failed to fetch topics');
        const topicsData = await topicsRes.json();

        // Map questions with topic names
        const topicMap = new Map(topicsData.topics?.map((t: Topic) => [t.id, t.name]) || []);
        const mappedQuestions = (questionsData.questions || []).map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          source_points: q.source_points,
          source_exam_year: q.source_exam_year,
          source_exam_type: q.source_exam_type,
          topic_name: topicMap.get(q.topic_id) || 'General',
          difficulty: q.difficulty,
        }));

        setQuestions(mappedQuestions);
      } catch (err) {
        console.error('Failed to load archive data:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and limit cards
  const filteredCards = activeFilter === 'All'
    ? questions.slice(0, 6)
    : questions.filter(q => q.topic_name?.toLowerCase().includes(activeFilter.toLowerCase())).slice(0, 6);

  // Get a featured question for the preview card
  const featuredQuestion = questions[0] || null;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || loading) return;

    const ctx = gsap.context(() => {
      const cardElements = cardsRef.current?.querySelectorAll('.exam-card');

      // Title animation on scroll
      gsap.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards stagger on scroll
      if (cardElements && cardElements.length > 0) {
        cardElements.forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: index * 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // Preview card
      gsap.fromTo(
        previewRef.current,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: previewRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // CTA banner
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [filteredCards, loading]);

  const formatDate = (year: number, type: string) => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    // Use a deterministic pseudo-random based on year and type for consistency
    const typeHash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const monthIndex = (typeHash + year) % 12;
    const day = ((typeHash * 7 + year) % 28) + 1;
    return `${monthNames[monthIndex]} ${day.toString().padStart(2, '0')} ${year}`;
  };

  const formatMathSnippet = (text: string) => {
    if (!text) return '';
    // Return the full text with LaTeX - LatexRenderer will handle it
    return text.length > 60 ? text.substring(0, 60) + '...' : text;
  };

  const getQuestionYearLabel = (q: Question) => {
    const typeAbbr = q.source_exam_type === 'Midterm' ? 'A' : 'B';
    return `${q.source_exam_year}${typeAbbr}`;
  };

  return (
    <section
      ref={sectionRef}
      id="archive"
      className={`py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Graph paper background */}
      <div className="absolute inset-0 graph-paper" />

      <div className="w-full px-8 lg:px-[8vw] relative z-10">
        {/* Title and filters */}
        <div ref={titleRef} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-serif font-semibold text-ink-black text-2xl lg:text-3xl">
              The Actual Questions
            </h2>
            <span className="date-stamp">{questions.length > 0 ? questions.length : '80'}+ questions, 5 years</span>
          </div>
          <p className="font-sans text-pencil-gray text-sm lg:text-base max-w-xl mb-4">
            These are not practice problems. They're what your professor handed out,
            scanned and solved step-by-step. Filter by what you're weak on.
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`font-condensed text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-all ${
                  activeFilter === filter
                    ? 'bg-blueprint-navy text-paper-cream border-blueprint-navy'
                    : 'bg-transparent text-pencil-gray border-pencil-gray/30 hover:border-blueprint-navy hover:text-blueprint-navy'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cards grid */}
          <div
            ref={cardsRef}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 lg:w-[52vw]"
          >
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blueprint-navy" />
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="font-sans text-pencil-gray">{error}</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="font-sans text-pencil-gray">No questions found for this filter.</p>
              </div>
            ) : (
              filteredCards.map((question) => (
                <div
                  key={question.id}
                  className="exam-card index-card p-4 lg:p-5 hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Date stamp */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="date-stamp text-[9px]">
                      {formatDate(question.source_exam_year, question.source_exam_type)}
                    </span>
                    <FileText className="w-4 h-4 text-pencil-gray group-hover:text-blueprint-navy transition-colors" strokeWidth={1.5} />
                  </div>

                  {/* Card content */}
                  <div className="mb-3">
                    <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                      {question.source_exam_type} {getQuestionYearLabel(question)}
                    </span>
                  </div>

                  <div className="font-mono text-sm text-ink-black mb-4 min-h-[40px]">
                    <LatexRenderer tex={formatMathSnippet(question.question_text)} />
                  </div>

                  <div className="topic-tag">
                    {question.topic_name}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview card */}
          <div
            ref={previewRef}
            className="index-card p-6 lg:p-8 lg:w-[28vw] lg:min-h-[56vh] flex flex-col"
          >
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blueprint-navy" />
              </div>
            ) : featuredQuestion ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                    Preview
                  </span>
                  <div className="topic-tag">{featuredQuestion.topic_name}</div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <p className="font-sans text-pencil-gray text-sm mb-4">
                    Evaluate:
                  </p>
                  <div className="font-mono text-xl lg:text-2xl text-ink-black mb-6">
                    <LatexRenderer tex={featuredQuestion.question_text} />
                  </div>
                  <div className="w-full h-px bg-pencil-gray/20 mb-6" />
                  <p className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest">
                    {featuredQuestion.source_points} points • {featuredQuestion.source_exam_type} {featuredQuestion.source_exam_year}
                  </p>
                </div>

                <Link
                  to="/signup"
                  className="w-full py-3 bg-blueprint-navy/10 text-blueprint-navy font-condensed text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blueprint-navy hover:text-paper-cream transition-colors"
                >
                  View Solution
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-sans text-pencil-gray text-sm">No preview available</p>
              </div>
            )}
          </div>
        </div>

        {/* Sign-up CTA Banner */}
        <div
          ref={ctaRef}
          className="mt-12 lg:mt-16 index-card p-6 lg:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="lg:max-w-lg">
              <h3 className="font-serif font-semibold text-ink-black text-lg lg:text-xl mb-2">
                Stop memorizing. Start recognizing.
              </h3>
              <p className="font-sans text-pencil-gray text-sm leading-relaxed">
                That integration by parts problem? It's the same structure every time—just
                different numbers. We tag every question by its underlying pattern so you
                learn to spot the setup, not just solve one problem.
                <span className="text-blueprint-navy font-medium"> Sign up free</span> to see
                the full solutions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <Link to="/signup" className="btn-blueprint inline-flex items-center justify-center">
                See Full Solutions
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('about');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 font-condensed text-xs uppercase tracking-widest text-blueprint-navy border border-blueprint-navy hover:bg-blueprint-navy hover:text-paper-cream transition-colors"
              >
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
