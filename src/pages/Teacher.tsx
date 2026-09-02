import { useEffect, useState, type FormEvent } from 'react';
import { Users, Award, TrendingUp, BookOpen, CirclePlus as PlusCircle, ChartBar as BarChart3, ClipboardList, Loader as Loader2, ClipboardCheck, X, Calendar, Trash2, Search, Filter, SquareCheck as CheckSquare, Square, Tag, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import { getGradeColor, formatSubmissionDate } from '@/lib/ai';
import ExerciseCreationModal, { type CreationType } from '@/components/ExerciseCreationModal';
import ExerciseCreationForm from '@/components/ExerciseCreationForm';
import type { Exercise, Submission, UserProfile, Assignment } from '@/types';

interface ClassStats {
  totalStudents: number;
  totalSubmissions: number;
  avgGrade: number;
  passRate: number;
}

type Tab = 'overview' | 'library';

export default function Teacher() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Exercise creation flow state
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [creationType, setCreationType] = useState<CreationType | null>(null);

  // Assignment modal state (single exercise)
  const [assignModal, setAssignModal] = useState<Exercise | null>(null);
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignTarget, setAssignTarget] = useState<'all' | 'specific'>('all');
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Exercise Library state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [bulkTarget, setBulkTarget] = useState<'all' | 'specific'>('all');
  const [bulkStudentIds, setBulkStudentIds] = useState<Set<string>>(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Collect all unique tags from exercises
  const allTags = Array.from(new Set(exercises.flatMap((ex) => ex.tags ?? []))).sort();

  // Filtered exercises for library
  const filteredExercises = exercises.filter((ex) => {
    if (searchQuery && !ex.title.includes(searchQuery) && !ex.description.includes(searchQuery)) return false;
    if (filterDifficulty !== 'all' && ex.difficulty !== filterDifficulty) return false;
    if (filterTag !== 'all' && !(ex.tags ?? []).includes(filterTag)) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredExercises.map((e) => e.id)));
  const deselectAll = () => setSelectedIds(new Set());

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

  const handleBulkAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || selectedIds.size === 0) return;
    setBulkSubmitting(true);
    setBulkMsg(null);

    const selectedExercises = exercises.filter((ex) => selectedIds.has(ex.id));
    const rows: Record<string, unknown>[] = [];

    for (const ex of selectedExercises) {
      if (bulkTarget === 'all') {
        rows.push({
          teacher_id: user.id,
          exercise_id: ex.id,
          assigned_to: 'all',
          student_id: null,
          due_date: bulkDueDate,
        });
      } else {
        for (const sid of bulkStudentIds) {
          rows.push({
            teacher_id: user.id,
            exercise_id: ex.id,
            assigned_to: sid,
            student_id: sid,
            due_date: bulkDueDate,
          });
        }
      }
    }

    const { data, error } = await supabase.from('assignments').insert(rows).select();

    setBulkSubmitting(false);

    if (error) {
      setBulkMsg({ type: 'error', text: error.message });
    } else {
      const count = (data as Assignment[])?.length ?? rows.length;
      setBulkMsg({ type: 'success', text: `${count} מטלות הוקצו בהצלחה!` });
      setAssignments((prev) => [...((data as Assignment[]) ?? []), ...prev]);
      setTimeout(() => {
        setShowBulkAssign(false);
        setBulkMsg(null);
        setBulkDueDate('');
        setBulkTarget('all');
        setBulkStudentIds(new Set());
        setSelectedIds(new Set());
      }, 2000);
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
            onClick={() => setShowCreationModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle size={20} />
            <span>צור תרגיל חדש</span>
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          סקירה כללית
        </button>
        <button
          onClick={() => setTab('library')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          ספריית תרגילים
        </button>
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === 'overview' && (
        <>
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
        </>
      )}

      {/* ===== EXERCISE LIBRARY TAB ===== */}
      {tab === 'library' && (
        <div>
          {/* Filter controls */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש לפי שם או תיאור..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="all">כל הרמות</option>
                  <option value="beginner">קל</option>
                  <option value="intermediate">בינוני</option>
                  <option value="advanced">קשה</option>
                </select>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="all">כל התגיות</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection bar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <button onClick={selectAll} className="text-sm text-blue-600 font-medium hover:underline">בחר הכל</button>
                <button onClick={deselectAll} className="text-sm text-slate-500 font-medium hover:underline">נקה בחירה</button>
                <span className="text-sm font-semibold text-slate-700">
                  {selectedIds.size} נבחרו
                </span>
              </div>
              {isTeacher && (
                <button
                  onClick={() => { setShowBulkAssign(true); setBulkMsg(null); }}
                  disabled={selectedIds.size === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>הקצה מתוך הספריה ({selectedIds.size})</span>
                </button>
              )}
            </div>
          </div>

          {/* Exercise cards grid */}
          {filteredExercises.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <BookOpen className="mx-auto text-slate-300" size={48} />
              <p className="mt-4 text-slate-500">אין תרגילים התואמים את הסינון</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((ex) => {
                const isSelected = selectedIds.has(ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => toggleSelect(ex.id)}
                    className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30' : 'border-slate-100 hover:border-blue-200 hover:shadow-md'}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(ex.id); }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="text-blue-600" size={22} />
                        ) : (
                          <Square className="text-slate-300" size={22} />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{ex.title}</h3>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                          {DIFFICULTY_LABELS[ex.difficulty]}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2">{ex.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(ex.tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-600">
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-slate-400">{ex.points} נק'</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Single assignment modal */}
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

      {/* Bulk assignment modal */}
      {showBulkAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowBulkAssign(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">הקצאה קבוצתית</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedIds.size} תרגילים נבחרו</p>
              </div>
              <button onClick={() => setShowBulkAssign(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {bulkMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${bulkMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {bulkMsg.text}
              </div>
            )}

            <form onSubmit={handleBulkAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך הגשה</label>
                <input
                  type="date"
                  value={bulkDueDate}
                  onChange={(e) => setBulkDueDate(e.target.value)}
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
                    onClick={() => { setBulkTarget('all'); setBulkStudentIds(new Set()); }}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${bulkTarget === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    כל הכיתה
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkTarget('specific')}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${bulkTarget === 'specific' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    תלמידים ספציפיים
                  </button>
                </div>
              </div>
              {bulkTarget === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">בחר תלמידים ({bulkStudentIds.size} נבחרו)</label>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-50">
                    {students.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-400">אין תלמידים רשומים</p>
                    ) : (
                      students.map((s) => {
                        const checked = bulkStudentIds.has(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setBulkStudentIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(s.id)) next.delete(s.id);
                                else next.add(s.id);
                                return next;
                              });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-right"
                          >
                            {checked ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-slate-300" size={18} />}
                            <span className="text-sm text-slate-700">{s.full_name ?? s.email}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
              <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                {bulkTarget === 'all'
                  ? `${selectedIds.size} מטלות יוקצו לכל הכיתה`
                  : `${selectedIds.size * Math.max(bulkStudentIds.size, 1)} מטלות יוקצו ל-${bulkStudentIds.size} תלמידים`}
              </div>
              <button
                type="submit"
                disabled={bulkSubmitting || (bulkTarget === 'specific' && bulkStudentIds.size === 0)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {bulkSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span>הקצה {selectedIds.size} מטלות</span>
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Exercise creation modal */}
      <ExerciseCreationModal
        open={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onSelect={(type) => {
          setCreationType(type);
          setShowCreationModal(false);
        }}
      />

      {/* Exercise creation form */}
      {creationType && (
        <ExerciseCreationForm
          onBack={() => setCreationType(null)}
          onCreated={(ex) => {
            setExercises((prev) => [ex, ...prev]);
            setCreationType(null);
          }}
        />
      )}
    </div>
  );
}
