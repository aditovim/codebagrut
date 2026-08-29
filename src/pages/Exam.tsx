import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Clock, FileText, Play, Send, Loader as Loader2, CircleCheck as CheckCircle2, Circle as XCircle, TriangleAlert as AlertTriangle, ArrowLeft, Trophy, Timer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { reviewCode, RateLimitError } from '@/lib/ai';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Exercise, ExamSession, ExamAnswer } from '@/types';

type Phase = 'setup' | 'exam' | 'results';

interface ExamResult {
  exercise: Exercise;
  code: string;
  score: number;
  feedback: string;
  status: 'graded' | 'failed';
}

const QUESTION_OPTIONS = [3, 5, 10];
const TIME_OPTIONS = [20, 40, 60];

export default function Exam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('setup');
  const [loading, setLoading] = useState(true);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [examExercises, setExamExercises] = useState<Exercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [session, setSession] = useState<ExamSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Setup form
  const [numQuestions, setNumQuestions] = useState(5);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('exercises').select('*');
      setAllExercises((data as Exercise[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const startExam = async () => {
    if (allExercises.length === 0 || !user) return;
    const picked = shuffle(allExercises).slice(0, Math.min(numQuestions, allExercises.length));
    const now = new Date();
    const ends = new Date(now.getTime() + duration * 60 * 1000);

    const { data } = await supabase
      .from('exam_sessions')
      .insert({
        student_id: user.id,
        started_at: now.toISOString(),
        ends_at: ends.toISOString(),
        duration_minutes: duration,
        status: 'in_progress',
      })
      .select()
      .single();

    if (!data) return;
    const newSession = data as ExamSession;
    setSession(newSession);
    setSessionId(newSession.id);
    setExamExercises(picked);
    const initCodes: Record<string, string> = {};
    for (const ex of picked) initCodes[ex.id] = ex.starter_code;
    setCodes(initCodes);
    setTimeLeft(duration * 60);
    setCurrentIdx(0);
    setResults([]);
    setPhase('exam');
  };

  const submitExam = useCallback(async () => {
    if (!sessionId || submitting) return;
    setSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const examResults: ExamResult[] = [];
    for (const ex of examExercises) {
      const code = codes[ex.id] ?? ex.starter_code;
      try {
        const review = await reviewCode(code, ex.title, ex.description, ex.topic);
        examResults.push({ exercise: ex, code, score: review.grade, feedback: review.feedback, status: review.status });

        await supabase.from('exam_answers').insert({
          exam_session_id: sessionId,
          exercise_id: ex.id,
          code_submitted: code,
          score: review.grade,
          ai_feedback: review.feedback,
        });
      } catch (err) {
        const errorMsg = err instanceof RateLimitError ? err.message : 'שגיאה בבדיקת הקוד';
        examResults.push({ exercise: ex, code, score: 0, feedback: errorMsg, status: 'failed' });

        await supabase.from('exam_answers').insert({
          exam_session_id: sessionId,
          exercise_id: ex.id,
          code_submitted: code,
          score: 0,
          ai_feedback: errorMsg,
        });
      }
    }

    const totalScore = Math.round(examResults.reduce((s, r) => s + r.score, 0) / examResults.length);

    await supabase
      .from('exam_sessions')
      .update({ status: 'submitted', total_score: totalScore })
      .eq('id', sessionId);

    setResults(examResults);
    setPhase('results');
    setSubmitting(false);
  }, [sessionId, examExercises, codes, submitting]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          void submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, submitExam]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allExercises.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <FileText className="mx-auto text-slate-300 mb-3" size={48} />
        <p className="text-slate-500">אין תרגילים זמינים למבחן.</p>
      </div>
    );
  }

  // ===== SETUP PHASE =====
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">מבחן מדמה</h1>
          <p className="mt-1 text-slate-600">תרגל בתנאי מבחן עם טיימר והגשה אוטומטית</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">מספר שאלות</label>
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={`py-3 rounded-xl font-bold text-lg transition-all ${numQuestions === n ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">מגבלת זמן</label>
            <div className="grid grid-cols-3 gap-3">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className={`py-3 rounded-xl font-bold text-lg transition-all ${duration === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {t} דק'
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-amber-800 font-medium">שים לב</p>
              <p className="text-xs text-amber-700 mt-1">המבחן יוגש אוטומטית כשהזמן יאזל. לא ניתן להשהות את הטיימר.</p>
            </div>
          </div>

          <button
            onClick={startExam}
            disabled={numQuestions > allExercises.length}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Play size={20} />
            <span>התחל מבחן</span>
          </button>
          {numQuestions > allExercises.length && (
            <p className="text-xs text-slate-400 mt-2 text-center">יש רק {allExercises.length} תרגילים זמינים</p>
          )}
        </div>
      </div>
    );
  }

  // ===== EXAM PHASE =====
  if (phase === 'exam' && session) {
    const current = examExercises[currentIdx];
    const answeredCount = examExercises.filter((ex) => (codes[ex.id] ?? '').trim() !== ex.starter_code.trim()).length;

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Timer bar */}
        <div className={`sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6 transition-colors ${timeLeft < 60 ? 'bg-red-50' : 'bg-white'} border-b border-slate-200`}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className={timeLeft < 60 ? 'text-red-600' : 'text-blue-600'} size={24} />
              <div>
                <p className={`text-2xl font-bold tabular-nums ${timeLeft < 60 ? 'text-red-600' : 'text-slate-900'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">שאלה {currentIdx + 1} מתוך {examExercises.length}</span>
              <button
                onClick={submitExam}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>הגש מבחן</span>
              </button>
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${timeLeft < 60 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(timeLeft / (duration * 60)) * 100}%` }} />
          </div>
        </div>

        {/* Question tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {examExercises.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => setCurrentIdx(i)}
              className={`flex-shrink-0 w-10 h-10 rounded-lg font-bold text-sm transition-all ${i === currentIdx ? 'bg-blue-600 text-white' : (codes[ex.id] ?? '').trim() !== ex.starter_code.trim() ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
        {current && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-xl font-bold text-slate-900">{current.title}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${DIFFICULTY_COLORS[current.difficulty]}`}>
                  {DIFFICULTY_LABELS[current.difficulty]}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{current.description}</p>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-4">
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-slate-300 font-medium">עורך הקוד</span>
                <span className="text-xs text-slate-400">{answeredCount} / {examExercises.length} נענו</span>
              </div>
              <Editor
                height="350px"
                defaultLanguage="csharp"
                language="csharp"
                value={codes[current.id] ?? current.starter_code}
                onChange={(val) => setCodes((prev) => ({ ...prev, [current.id]: val ?? '' }))}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, tabSize: 4 }}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                <ArrowLeft size={16} />
                <span>הקודם</span>
              </button>
              {currentIdx < examExercises.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(examExercises.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  <span>הבא</span>
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              ) : (
                <button
                  onClick={submitExam}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>הגש מבחן</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ===== RESULTS PHASE =====
  if (phase === 'results') {
    const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
    const passed = results.filter((r) => r.status === 'graded').length;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white mb-4">
            <Trophy size={28} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">תוצאות המבחן</h1>
          <p className="mt-1 text-slate-600">המבחן הוגש ונבדק בהצלחה</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <p className="text-4xl font-bold text-blue-600">{avgScore}</p>
            <p className="text-sm text-slate-500 mt-1">ציון ממוצע</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <p className="text-4xl font-bold text-green-600">{passed}</p>
            <p className="text-sm text-slate-500 mt-1">עברו</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <p className="text-4xl font-bold text-slate-400">{results.length - passed}</p>
            <p className="text-sm text-slate-500 mt-1">נכשלו</p>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={r.exercise.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center">{i + 1}</span>
                  <h3 className="font-semibold text-slate-900">{r.exercise.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'graded' ? <CheckCircle2 className="text-green-600" size={18} /> : <XCircle className="text-red-600" size={18} />}
                  <span className={`text-xl font-bold ${r.status === 'graded' ? 'text-green-600' : 'text-red-600'}`}>{r.score}</span>
                </div>
              </div>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 rounded-lg p-3 mt-2">{r.feedback}</pre>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={() => setPhase('setup')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">
            <Clock size={16} />
            <span>מבחן נוסף</span>
          </button>
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-600 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <span>חזרה ללוח בקרה</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
