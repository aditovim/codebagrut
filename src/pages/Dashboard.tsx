import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, BookOpen, Clock, ChevronLeft, ChartBar as BarChart3, CircleAlert as AlertCircle, ClipboardList, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatSubmissionDate, getGradeColor } from '@/lib/ai';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Submission, Exercise, Assignment } from '@/types';

interface TopicStat {
  topic: string;
  avgScore: number;
  attempts: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [{ data: subData }, { data: exData }, { data: assignData }] = await Promise.all([
        supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('exercises').select('*'),
        supabase
          .from('assignments')
          .select('*')
          .or(`assigned_to.eq.all,student_id.eq.${user.id}`)
          .order('due_date', { ascending: true }),
      ]);
      setSubmissions((subData as Submission[]) ?? []);
      setExercises((exData as Exercise[]) ?? []);
      setAssignments((assignData as Assignment[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const completedCount = submissions.filter((s) => s.status === 'graded').length;
  const avgGrade =
    submissions.length > 0
      ? Math.round(submissions.reduce((sum, s) => sum + s.grade, 0) / submissions.length)
      : 0;
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  const stats = [
    { icon: BookOpen, label: 'תרגילים שהוגשו', value: submissions.length, color: 'from-blue-500 to-blue-600' },
    { icon: Award, label: 'תרגילים שעברו', value: completedCount, color: 'from-green-500 to-green-600' },
    { icon: TrendingUp, label: 'ציון ממוצע', value: avgGrade, color: 'from-purple-500 to-purple-600' },
    { icon: Clock, label: 'סך תרגילים זמינים', value: exercises.length, color: 'from-cyan-500 to-cyan-600' },
  ];

  // Compute weakest topics
  const topicMap = new Map<string, number[]>();
  for (const sub of submissions) {
    const ex = exerciseMap.get(sub.exercise_id);
    if (!ex) continue;
    if (!topicMap.has(ex.topic)) topicMap.set(ex.topic, []);
    topicMap.get(ex.topic)!.push(sub.grade);
  }
  const topicStats: TopicStat[] = [];
  for (const [topic, grades] of topicMap) {
    const avg = Math.round(grades.reduce((s, g) => s + g, 0) / grades.length);
    topicStats.push({ topic, avgScore: avg, attempts: grades.length });
  }
  topicStats.sort((a, b) => a.avgScore - b.avgScore);
  const weakestTopics = topicStats.slice(0, 3);

  // Open assignments
  const today = new Date().toISOString().split('T')[0];
  const openAssignments = assignments
    .map((a) => ({ ...a, exercise: exerciseMap.get(a.exercise_id) }))
    .filter((a) => a.exercise)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

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
        <h1 className="text-3xl font-bold text-slate-900">לוח בקרה</h1>
        <p className="mt-1 text-slate-600">שלום {profile?.full_name ?? 'תלמיד'}! הנה ההתקדמות שלך</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two column layout for widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Weakest topics widget */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={18} />
              נושאים חלשים
            </h2>
            <Link to="/skills" className="text-sm text-blue-600 font-medium hover:underline">מפה מלאה</Link>
          </div>
          {weakestTopics.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-400">אין נתונים עדיין. התחל לתרגל כדי לראות ניתוח.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {weakestTopics.map((t) => (
                <div key={t.topic} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{t.topic}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.attempts} ניסיונות</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${getGradeColor(t.avgScore)}`}>{t.avgScore}</span>
                    <Link
                      to={`/practice?topic=${encodeURIComponent(t.topic)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <span>תרגל</span>
                      <ChevronLeft size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned to you widget */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-blue-500" size={18} />
              משימות שהוקצו לך
            </h2>
          </div>
          {openAssignments.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <ClipboardList className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm text-slate-400">אין משימות פתוחות כרגע</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {openAssignments.map((a) => {
                const isOverdue = a.due_date < today;
                return (
                  <div key={a.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{a.exercise?.title ?? 'תרגיל'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar size={12} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
                        <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-400'}`}>
                          {isOverdue ? 'באיחור: ' : ''}{formatSubmissionDate(a.due_date)}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/practice"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      <span>פתור</span>
                      <ChevronLeft size={12} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submissions history */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">היסטוריית הגשות</h2>
          <Link to="/practice" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline">
            <span>תרגל עוד</span>
            <ChevronLeft size={16} />
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BarChart3 className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">עדיין לא הגשת תרגילים</p>
            <Link to="/practice" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              התחל לתרגל
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {submissions.map((sub) => {
              const ex = exerciseMap.get(sub.exercise_id);
              return (
                <div key={sub.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{ex?.title ?? 'תרגיל לא ידוע'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {ex && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                          {DIFFICULTY_LABELS[ex.difficulty]}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{formatSubmissionDate(sub.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${getGradeColor(sub.grade)}`}>{sub.grade}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.status === 'graded' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {sub.status === 'graded' ? 'עבר' : 'לא עבר'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
