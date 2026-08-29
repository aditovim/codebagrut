import { useEffect, useState } from 'react';
import { Archive, Filter, Tag, BookOpen, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { BagrutQuestion } from '@/types';

const PRACTICE_TYPE_LABELS: Record<string, string> = {
  class: 'תרגול כיתתי',
  homework: 'שיעורי בית',
  exam: 'מבחן',
};

const PRACTICE_TYPE_COLORS: Record<string, string> = {
  class: 'bg-blue-50 text-blue-700 border-blue-200',
  homework: 'bg-purple-50 text-purple-700 border-purple-200',
  exam: 'bg-red-50 text-red-700 border-red-200',
};

const TOPICS = ['All', 'Loops', 'Arrays', 'OOP', 'Trees', 'Linked Lists', 'Strings', 'Recursion'];
const EXAM_CODES = ['All', '271', '371'];
const YEARS = ['All', '2023', '2022', '2021', '2020'];

export default function BagrutArchive() {
  const [questions, setQuestions] = useState<BagrutQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterCode, setFilterCode] = useState('All');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('bagrut_questions').select('*').order('year', { ascending: false });
      setQuestions((data as BagrutQuestion[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = questions.filter((q) => {
    if (filterTopic !== 'All' && q.topic !== filterTopic) return false;
    if (filterYear !== 'All' && q.year !== parseInt(filterYear)) return false;
    if (filterCode !== 'All' && q.exam_code !== filterCode) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Archive className="text-blue-600" size={32} />
          ארכיון שאלות בגרות
        </h1>
        <p className="mt-2 text-slate-600">מאגר שאלות רשמי מסווג לפי שנה, מועד, שאלון ונושא</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <Filter size={18} />
          <span className="font-medium text-sm">סינון</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">נושא</label>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTopic(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterTopic === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t === 'All' ? 'הכל' : t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">שנה</label>
            <div className="flex flex-wrap gap-1.5">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setFilterYear(y)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterYear === y ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {y === 'All' ? 'הכל' : y}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">שאלון</label>
            <div className="flex flex-wrap gap-1.5">
              {EXAM_CODES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCode(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterCode === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {c === 'All' ? 'הכל' : c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">{filtered.length} שאלות נמצאו</p>

      {/* Questions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((q) => (
          <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-semibold text-slate-900 text-sm">{q.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${DIFFICULTY_COLORS[q.difficulty]}`}>
                {DIFFICULTY_LABELS[q.difficulty]}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 line-clamp-2">{q.description}</p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-xs text-slate-600">
                <Calendar size={12} />
                {q.year} {q.semester === 'a' ? "מועד א'" : "מועד ב'"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-xs text-slate-600">
                <FileText size={12} />
                {q.exam_code}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 text-xs text-slate-600">
                {q.topic}
              </span>
            </div>

            {/* Tags */}
            {q.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {q.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600">
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${PRACTICE_TYPE_COLORS[q.practice_type]}`}>
                {PRACTICE_TYPE_LABELS[q.practice_type]}
              </span>
              <span className="text-sm font-medium text-blue-600">{q.points} נק'</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-400">לא נמצאו שאלות עם הסינון שנבחר</p>
        </div>
      )}
    </div>
  );
}
