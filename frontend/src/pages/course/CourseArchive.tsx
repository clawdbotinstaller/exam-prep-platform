import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen } from 'lucide-react';
import { apiGet, apiPost } from '../../lib/api';

interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  source: string;
  year: number;
}

export default function CourseArchive() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [mode, setMode] = useState<'browse' | 'topic' | 'midterm'>('browse');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topicOptions, setTopicOptions] = useState<{ id: string; name: string }[]>([
    { id: 'integration', name: 'Integration by Parts' },
    { id: 'series', name: 'Series Convergence' },
    { id: 'power', name: 'Power Series' },
    { id: 'taylor', name: 'Taylor Series' },
  ]);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiGet<{ questions: any[] }>(`/api/questions?course_id=${slug}&limit=50`);
        setQuestions(
          (resp.questions ?? []).map((q) => ({
            id: q.id,
            text: q.question_text ?? q.text,
            topic: q.topic ?? q.topic_name ?? 'Topic',
            difficulty: q.difficulty >= 4 ? 'Hard' : q.difficulty <= 2 ? 'Easy' : 'Medium',
            source: q.source_exam_type ?? 'Exam',
            year: q.source_exam_year ?? 2023,
          }))
        );
        const topicsResp = await apiGet<{ topics: any[] }>(`/api/courses/${slug}/topics`);
        const incoming = (topicsResp.topics ?? []).map((t) => ({ id: t.id, name: t.name }));
        if (incoming.length > 0) setTopicOptions(incoming);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [slug]);

  const startTopicBundle = async () => {
    try {
      const selected = topicOptions.find((t) => t.name === selectedTopic);
      const resp = await apiPost<{ questions: any[] }>('/api/questions/bundle', {
        course_id: slug,
        topic_id: selectedTopic === 'all' ? undefined : selected?.id,
        count: 3,
      });
      sessionStorage.setItem('question_set', JSON.stringify(resp.questions ?? []));
      navigate(`/course/${slug}/question/1?i=0`);
    } catch (err) {
      console.error(err);
      navigate('/upgrade');
    }
  };

  const startMidterm = async (difficulty: string) => {
    try {
      const resp = await apiPost<{ questions: any[] }>('/api/midterm/generate', {
        course_id: slug,
        difficulty,
      });
      sessionStorage.setItem('question_set', JSON.stringify(resp.questions ?? []));
      navigate(`/course/${slug}/archive/midterm/${difficulty}`);
    } catch (err) {
      console.error(err);
      navigate('/upgrade');
    }
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          Exam Archive
        </h1>
        <p className="font-sans text-pencil-gray">
          Browse real past exam questions, practice 3-question topic bundles (1 credit),
          or generate a practice midterm (3 credits).
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setMode('browse')}
          className={`px-4 py-2 text-xs font-condensed uppercase tracking-widest ${
            mode === 'browse' ? 'bg-blueprint-navy text-paper-cream' : 'bg-paper-aged'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setMode('topic')}
          className={`px-4 py-2 text-xs font-condensed uppercase tracking-widest ${
            mode === 'topic' ? 'bg-blueprint-navy text-paper-cream' : 'bg-paper-aged'
          }`}
        >
          Topic Bundle
        </button>
        <button
          onClick={() => setMode('midterm')}
          className={`px-4 py-2 text-xs font-condensed uppercase tracking-widest ${
            mode === 'midterm' ? 'bg-blueprint-navy text-paper-cream' : 'bg-paper-aged'
          }`}
        >
          Practice Midterm
        </button>
      </div>

      {mode === 'browse' && (
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pencil-gray" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-paper-cream border border-pencil-gray/30 font-sans text-sm focus:outline-none focus:border-blueprint-navy"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-pencil-gray" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-3 bg-paper-cream border border-pencil-gray/30 font-sans text-sm focus:outline-none focus:border-blueprint-navy"
            >
            {['all', ...topicOptions.map((t) => t.name)].map((topic) => (
              <option key={topic} value={topic}>
                {topic === 'all' ? 'All Topics' : topic}
              </option>
            ))}
            </select>
          </div>
        </div>
      )}

      {mode === 'browse' && (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="index-card p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="topic-tag text-[10px]">{question.topic}</span>
                    <span
                      className={`date-stamp text-[9px] ${
                        question.difficulty === 'Easy'
                          ? '!border-green-600 !text-green-600'
                          : question.difficulty === 'Hard'
                          ? '!border-stamp-red !text-stamp-red'
                          : ''
                      }`}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="font-serif text-ink-black mb-2">{question.text}</p>
                  <p className="font-sans text-pencil-gray/60 text-xs">
                    {question.source} {question.year}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-pencil-gray/30" />
                </div>
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-16">
              <p className="font-sans text-pencil-gray">No questions found.</p>
            </div>
          )}
        </div>
      )}

      {mode === 'topic' && (
        <div className="index-card p-6">
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-4">
            Topic Bundle (3 questions for 1 credit)
          </h2>
          <p className="font-sans text-pencil-gray mb-4">
            Select a topic above, then generate 3 questions from past exams.
          </p>
          <button className="btn-blueprint" onClick={startTopicBundle}>
            Generate 3 Questions
          </button>
        </div>
      )}

      {mode === 'midterm' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['easy', 'sample', 'hard'].map((difficulty) => (
            <div key={difficulty} className="index-card p-6">
              <h3 className="font-serif text-ink-black mb-2 capitalize">
                {difficulty} Midterm
              </h3>
              <p className="font-sans text-pencil-gray text-sm mb-4">
                {difficulty === 'easy'
                  ? 'Shorter and easier mix'
                  : difficulty === 'hard'
                  ? 'Longest and toughest questions'
                  : 'Closest to real exam mix'}
              </p>
              <button
                className="btn-blueprint w-full"
                onClick={() => startMidterm(difficulty)}
              >
                Start (3 credits)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
