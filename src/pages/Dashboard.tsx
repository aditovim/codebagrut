import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code as Code2, GraduationCap, FileText, TrendingUp, Award, Clock, BookOpen, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatSubmissionDate, getGradeColor } from '@/lib/ai';
import type { Submission, Assignment, Exercise } from '@/types';

export default function Dashboard() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setSubmissions((subData ?? []) as Submission[]);

      const { data: assignData } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setAssignments((assignData ?? []) as Assignment[]);

      const { data: exData } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });
      setExercises((exData ?? []) as Exercise[]);

      setLoading(false);
    })();
  }, []);

  const avgGrade = submissions.length > 0
    ? Math.round(submissions.reduce((sum, s) => sum + s.grade, 0) / submissions.length)
    : 0;

  const stats = [
    { label: 'תרגילים זמינים', value: exercises.length, icon: Code2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'הגשות', value: submissions.length, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ממוצע ציונים', value: avgGrade, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'מטלות', value: assignments.length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const quickLinks = [
    { to: '/practice', label: 'התחל תרגול', icon: Code2, desc: 'תרגל תרגילי C#' },
    { to: '/exam', label: 'מבחן סימולציה', icon: GraduationCap, desc: 'תרגל בתנאי מבחן' },
    { to: '/archive', label: 'ארכיון בגרויות', icon: FileText, desc: 'שאלות משנים קודמות' },
    { to: '/skills', label: 'מיומנויות', icon: BookOpen, desc: 'כלים ויזואליים' },
    { to: '/announcements', label: 'עדכונים', icon: MessageSquare, desc: 'הודעות ושינויים' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">טוען...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            שלום, {profile?.full_name ?? profile?.email}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">ברוך/ה שוב - הנה סקירה של הפעילות שלך</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
                  <Icon className={stat.color} size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-600" size={20} />
                <h2 className="text-lg font-bold text-slate-900">הגשות אחרונות</h2>
              </div>
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">עדיין אין הגשות. התחל לתרגל!</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const ex = exercises.find((e) => e.id === sub.exercise_id);
                    return (
                      <div key={sub.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{ex?.title ?? 'תרגיל'}</p>
                          <p className="text-xs text-slate-400">{formatSubmissionDate(sub.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${getGradeColor(sub.grade)}`}>{sub.grade}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-orange-600" size={20} />
                <h2 className="text-lg font-bold text-slate-900">מטלות</h2>
              </div>
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">אין מטלות כרגע</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assign) => {
                    const ex = exercises.find((e) => e.id === assign.exercise_id);
                    return (
                      <div key={assign.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{ex?.title ?? 'תרגיל'}</p>
                          <p className="text-xs text-slate-400">להגשה עד: {formatSubmissionDate(assign.due_date)}</p>
                        </div>
                        <Link
                          to="/practice"
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          התחל
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">פעולות מהירות</h2>
            <div className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50">
                      <Icon className="text-slate-600" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{link.label}</p>
                      <p className="text-xs text-slate-400">{link.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  );
}
