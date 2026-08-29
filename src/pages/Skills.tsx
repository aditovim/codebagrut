import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Loader as Loader2, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Submission, Exercise } from '@/types';

interface TopicStat {
  topic: string;
  avgScore: number;
  attempts: number;
  level: 'strong' | 'developing' | 'needs_work';
}

function getLevel(avg: number): TopicStat['level'] {
  if (avg >= 80) return 'strong';
  if (avg >= 50) return 'developing';
  return 'needs_work';
}

const LEVEL_CONFIG: Record<TopicStat['level'], { label: string; color: string; barColor: string; icon: typeof CheckCircle2 }> = {
  strong: { label: 'חזק', color: 'text-green-700 bg-green-50 border-green-200', barColor: 'bg-green-500', icon: CheckCircle2 },
  developing: { label: 'בפיתוח', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', barColor: 'bg-yellow-500', icon: TrendingUp },
  needs_work: { label: 'דורש תרגול', color: 'text-red-700 bg-red-50 border-red-200', barColor: 'bg-red-500', icon: AlertCircle },
};

export default function Skills() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [overallAvg, setOverallAvg] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [{ data: subData }, { data: exData }] = await Promise.all([
        supabase.from('submissions').select('*').eq('user_id', user.id),
        supabase.from('exercises').select('id, topic'),
      ]);
      const subs = (subData as Submission[]) ?? [];
      const exercises = (exData as { id: string; topic: string }[]) ?? [];
      const exMap = new Map(exercises.map((e) => [e.id, e.topic]));

      const topicMap = new Map<string, number[]>();
      for (const sub of subs) {
        const topic = exMap.get(sub.exercise_id);
        if (!topic) continue;
        if (!topicMap.has(topic)) topicMap.set(topic, []);
        topicMap.get(topic)!.push(sub.grade);
      }

      const topicStats: TopicStat[] = [];
      for (const [topic, grades] of topicMap) {
        const avg = Math.round(grades.reduce((s, g) => s + g, 0) / grades.length);
        topicStats.push({ topic, avgScore: avg, attempts: grades.length, level: getLevel(avg) });
      }
      topicStats.sort((a, b) => b.avgScore - a.avgScore);

      setTopics(topicStats);
      setOverallAvg(subs.length > 0 ? Math.round(subs.reduce((s, sub) => s + sub.grade, 0) / subs.length) : 0);
      setTotalAttempts(subs.length);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const strongCount = topics.filter((t) => t.level === 'strong').length;
  const developingCount = topics.filter((t) => t.level === 'developing').length;
  const needsWorkCount = topics.filter((t) => t.level === 'needs_work').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">מפת מיומנויות</h1>
        <p className="mt-1 text-slate-600">ניתוח חוזקות וחולשות לפי נושאים</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{overallAvg}</p>
          <p className="text-sm text-slate-500 mt-0.5">ציון ממוצע כללי</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white mb-3">
            <Brain size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalAttempts}</p>
          <p className="text-sm text-slate-500 mt-0.5">סך ניסיונות</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white mb-3">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{strongCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">נושאים חזקים</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white mb-3">
            <AlertCircle size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{needsWorkCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">דורשים תרגול</p>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Brain className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">עדיין אין נתונים. התחל לתרגל כדי לראות את מפת המיומנויות שלך.</p>
          <Link to="/practice" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            התחל לתרגל
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((stat) => {
            const cfg = LEVEL_CONFIG[stat.level];
            const LevelIcon = cfg.icon;
            return (
              <div key={stat.topic} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{stat.topic}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <Link to={`/practice?topic=${encodeURIComponent(stat.topic)}`} className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline">
                    <span>תרגל נושא זה</span>
                    <ChevronLeft size={14} />
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${cfg.barColor} rounded-full transition-all duration-500`} style={{ width: `${stat.avgScore}%` }} />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-900 tabular-nums w-12 text-left">{stat.avgScore}</span>
                  <span className="text-xs text-slate-400 whitespace-nowrap w-20 text-left">{stat.attempts} ניסיונות</span>
                  <LevelIcon className={cfg.color.split(' ')[0]} size={18} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
