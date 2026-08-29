import { useEffect, useState, type FormEvent } from 'react';
import { Users, Award, TrendingUp, BookOpen, CirclePlus as PlusCircle, ChartBar as BarChart3, ClipboardList, Loader as Loader2, ClipboardCheck, X, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DIFFICULTY_LABELS } from '@/lib/constants';
import { getGradeColor, formatSubmissionDate } from '@/lib/ai';
import type { Exercise, Submission, UserProfile, Assignment } from '@/types';

interface ClassStats {
  totalStudents: number;
  totalSubmissions: number;
  avgGrade: number;
  passRate: number;
}

export default function Teacher() {
  const { user, profile } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Assignment modal state
  const [assignModal, setAssignModal] = useState<Exercise | null>(null);
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignTarget, setAssignTarget] = useState<'all' | 'specific'>('all');
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Exercise form state
  const [fTitle, setFTitle] = useState('');
  const [fTopic, setFTopic] = useState('');
  const [fDifficulty, setFDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [fDescription, setFDescription] = useState('');
  const [fStarter, setFStarter] = useState('');
  const [fSolution, setFSolution] = useState('');
  const [fPoints, setFPoints] = useState(10);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: exData }, { data: subData }, { data: stuData }, { data: assignData }] = await Promise.all([
        supabase.from('exercises').select('*').order('created_at', { ascending: false }),
        supabase.from('submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, email, full_name, role, created_at').eq('role', 'student').order('created_at', { ascending: false }),
        supabase.from('assignments').select('*').order('created_at', { ascending: false }),
      ]);
      setExercises((exData as Exercise[]) ?? []);
      setSubmissions((subData as Submission[]) ?? []);
      setStudents((stuData as UserProfile[]) ?? []);
      setAssignments((assignData as Assignment[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const stats: ClassStats = {
    totalStudents: students.length,
    totalSubmissions: submissions.length,
    avgGrade: submissions.length > 0 ? Math.round(submissions.reduce((sum, s) => sum + s.grade, 0) / submissions.length) : 0,
    passRate: submissions.length > 0 ? Math.round((submissions.filter((s) => s.status === 'graded').length / submissions.length) * 100) : 0,
  };

  const statCards = [
    { icon: Users, label: 'תלמידים', value: stats.totalStudents, color: 'from-blue-500 to-blue-600' },
    { icon: ClipboardList, label: 'סך הגשות', value: stats.totalSubmissions, color: 'from-cyan-500 to-cyan-600' },
    { icon: TrendingUp, label: 'ציון ממוצע', value: stats.avgGrade, color: 'from-purple-500 to-purple-600' },
    { icon: Award, label: 'אחוז מעבר', value: `${stats.passRate}%`, color: 'from-green-500 to-green-600' },
  ];

  const handleCreateExercise = async (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormMsg(null);

    const { data, error } = await supabase
      .from('exercises')
      .insert({
        title: fTitle,
        topic: fTopic,
        difficulty: fDifficulty,
        description: fDescription,
        starter_code: fStarter,
        solution_code: fSolution,
        test_cases: '',
        points: fPoints,
      })
      .select()
      .single();

    setFormSubmitting(false);

    if (error) {
      setFormMsg({ type: 'error', text: error.message });
    } else {
      setFormMsg({ type: 'success', text: 'התרגיל נוצר בהצלחה!' });
      setExercises((prev) => [data as Exercise, ...prev]);
      setFTitle(''); setFTopic(''); setFDescription(''); setFStarter(''); setFSolution(''); setFPoints(10);
      setTimeout(() => setShowForm(false), 1500);
    }
  };

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignModal || !user) return;
    setAssignSubmitting(true);
    setAssignMsg(null);

    const payload: Record<string, unknown> = {
      teacher_id: user.id,
      exercise_id: assignModal.id,
      due_date: assignDueDate,
    };

    if (assignTarget === 'all') {
      payload.assigned_to = 'all';
      payload.student_id = null;
    } else {
      payload.assigned_to = assignStudentId;
      payload.student_id = assignStudentId;
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert(payload)
      .select()
      .single();

    setAssignSubmitting(false);

    if (error) {
      setAssignMsg({ type: 'error', text: error.message });
    } else {
      setAssignMsg({ type: 'success', text: 'המשימה הוקצתה בהצלחה!' });
      setAssignments((prev) => [data as Assignment, ...prev]);
      setTimeout(() => {
        setAssignModal(null);
        setAssignMsg(null);
        setAssignDueDate('');
        setAssignTarget('all');
        setAssignStudentId('');
      }, 1500);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    await supabase.from('assignments').delete().eq('id', id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isTeacher = profile?.role === 'teacher';
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const studentMap = new Map(students.map((s) => [s.id, s]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">לוח בקרה למורה</h1>
          <p className="mt-1 text-slate-600">ניתוח נתוני כיתה, ניהול תרגילים והקצאת מטלות</p>
        </div>
        {isTeacher && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle size={20} />
            <span>{showForm ? 'סגור טופס' : 'צור תרגיל חדש'}</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Create exercise form */}
      {showForm && isTeacher && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">יצירת תרגיל חדש</h2>
          {formMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${formMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {formMsg.text}
            </div>
          )}
          <form onSubmit={handleCreateExercise} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">כותרת</label>
              <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="לולאות - סכום ספרות" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">נושא</label>
              <input value={fTopic} onChange={(e) => setFTopic(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="Loops" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">רמת קושי</label>
              <select value={fDifficulty} onChange={(e) => setFDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm">
                <option value="beginner">{DIFFICULTY_LABELS.beginner}</option>
                <option value="intermediate">{DIFFICULTY_LABELS.intermediate}</option>
                <option value="advanced">{DIFFICULTY_LABELS.advanced}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">נקודות</label>
              <input type="number" value={fPoints} onChange={(e) => setFPoints(Number(e.target.value))} min={1} max={100} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">תיאור התרגיל</label>
              <textarea value={fDescription} onChange={(e) => setFDescription(e.target.value)} required rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="כתוב תוכנית שמקבלת מספר ומדפיסה את סכום ספרותיו..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">קוד התחלתי</label>
              <textarea value={fStarter} onChange={(e) => setFStarter(e.target.value)} rows={5} dir="ltr" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono" placeholder="// Starter code..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">קוד פתרון</label>
              <textarea value={fSolution} onChange={(e) => setFSolution(e.target.value)} rows={5} dir="ltr" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono" placeholder="// Solution..." />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={formSubmitting} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
                {formSubmitting ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                <span>{formSubmitting ? 'יוצר...' : 'צור תרגיל'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercises table with assign button */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <BookOpen size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">תרגילים ({exercises.length})</h2>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {exercises.map((ex) => (
              <div key={ex.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{ex.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ex.topic} • {DIFFICULTY_LABELS[ex.difficulty]} • {ex.points} נק'</p>
                  </div>
                  {isTeacher && (
                    <button
                      onClick={() => {
                        setAssignModal(ex);
                        setAssignMsg(null);
                        setAssignDueDate('');
                        setAssignTarget('all');
                        setAssignStudentId('');
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <ClipboardCheck size={14} />
                      <span>הקצה</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent submissions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">הגשות אחרונות ({submissions.length})</h2>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {submissions.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">אין הגשות עדיין</div>
            ) : (
              submissions.slice(0, 20).map((sub) => {
                const ex = exercises.find((e) => e.id === sub.exercise_id);
                return (
                  <div key={sub.id} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{ex?.title ?? 'תרגיל'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sub.status === 'graded' ? 'עבר' : 'לא עבר'}</p>
                    </div>
                    <span className={`text-lg font-bold ${getGradeColor(sub.grade)}`}>{sub.grade}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Assignments list */}
      {isTeacher && assignments.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <ClipboardCheck size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">מטלות שהוקצו ({assignments.length})</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {assignments.map((a) => {
              const ex = exerciseMap.get(a.exercise_id);
              const student = a.student_id ? studentMap.get(a.student_id) : null;
              return (
                <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{ex?.title ?? 'תרגיל'}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatSubmissionDate(a.due_date)}</span>
                      <span>•</span>
                      <span>{a.assigned_to === 'all' ? 'כל הכיתה' : (student?.full_name ?? student?.email ?? 'תלמיד')}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAssignment(a.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assignment modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setAssignModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">הקצאת מטלה</h3>
                <p className="text-sm text-slate-500 mt-1">{assignModal.title}</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {assignMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${assignMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {assignMsg.text}
              </div>
            )}

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך הגשה</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">הקצאה ל</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignTarget('all')}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${assignTarget === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    כל הכיתה
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignTarget('specific')}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${assignTarget === 'specific' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    תלמיד ספציפי
                  </button>
                </div>
              </div>
              {assignTarget === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">בחר תלמיד</label>
                  <select
                    value={assignStudentId}
                    onChange={(e) => setAssignStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  >
                    <option value="">-- בחר --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name ?? s.email}</option>
                    ))}
                  </select>
                  {students.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1">אין תלמידים רשומים עדיין</p>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={assignSubmitting || (assignTarget === 'specific' && !assignStudentId)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {assignSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ClipboardCheck size={18} />}
                <span>הקצה מטלה</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
