import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Filter, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { difficultyLabel, difficultyColor } from '@/lib/ai';
import type { BagrutQuestion } from '@/types';

export default function BagrutArchive() {
  const [questions, setQuestions] = useState<BagrutQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('bagrut_questions')
        .select('*')
        .order('year', { ascending: false });
      setQuestions((data ?? []) as BagrutQuestion[]);
      setLoading(false);
    })();
  }, []);

  const years = [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a);
  const topics = [...new Set(questions.map((q) => q.topic))].sort();

  const filtered = questions.filter((q) => {
    if (filterYear !== 'all' && q.year !== parseInt(filterYear)) return false;
    if (filterTopic !== 'all' && q.topic !== filterTopic) return false;
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-400">טוען...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">ארכיון שאלות בגרות</h1>
          <p className="mt-1 text-sm text-slate-500">שאלות בגרות אמיתיות משנים קודמות</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter size={16} />
            <span>סינון:</span>
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">כל השנים</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">כל הנושאים</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileText className="mx-auto text-slate-300" size={48} />
            <p className="mt-4 text-slate-500">אין שאלות בגרות במסנן הנוכחי</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{q.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {q.year} - סמסטר {q.semester} - קוד {q.exam_code}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${difficultyColor(q.difficulty)}`}>
                    {difficultyLabel(q.difficulty)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{q.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {q.tags?.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-500">{q.points} נקודות</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft size={16} />
            <span>חזרה ללוח בקרה</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
