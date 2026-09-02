import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Send, Loader as Loader2, CircleCheck as CheckCircle2, Circle as XCircle, Sparkles, Lightbulb, Gauge, ArrowRight, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { reviewCode, askTutor, RateLimitError } from '@/lib/ai';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import { analyzeComplexity, ComplexityReport } from '@/components/ComplexityAnalyzer';
import RecursionVisualizer from '@/components/RecursionVisualizer';
import DataStructuresVisualizer from '@/components/DataStructuresVisualizer';
import type { Exercise, TutorMessage } from '@/types';

export default function Practice() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ grade: number; feedback: string; status: string } | null>(null);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [complexity, setComplexity] = useState<ReturnType<typeof analyzeComplexity> | null>(null);
  const [showComplexity, setShowComplexity] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('exercises').select('*').order('created_at', { ascending: true });
      setExercises((data as Exercise[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const openExercise = (ex: Exercise) => {
    setSelected(ex);
    setCode(ex.starter_code);
    setResult(null);
    setComplexity(null);
    setShowComplexity(false);
    setTutorMessages([]);
  };

  const backToList = () => {
    setSelected(null);
    setResult(null);
    setComplexity(null);
    setShowComplexity(false);
    setTutorMessages([]);
  };

  const handleSubmit = async () => {
    if (!selected || !user) return;
    setSubmitting(true);
    setResult(null);

    try {
      const review = await reviewCode(code, selected.title, selected.description, selected.topic);

      await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          exercise_id: selected.id,
          code,
          grade: review.grade,
          feedback: review.feedback,
          status: review.status,
        });

      setResult({ grade: review.grade, feedback: review.feedback, status: review.status });
      setComplexity(analyzeComplexity(code));
      setShowComplexity(true);
    } catch (err) {
      if (err instanceof RateLimitError) {
        setResult({ grade: 0, feedback: err.message, status: 'failed' });
      } else {
        setResult({ grade: 0, feedback: 'שגיאה בבדיקת הקוד, נסה שוב', status: 'failed' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTutorSend = async () => {
    if (!tutorInput.trim() || !selected) return;
    const userMsg: TutorMessage = { role: 'user', content: tutorInput, timestamp: Date.now() };
    setTutorMessages((prev) => [...prev, userMsg]);
    setTutorInput('');
    setTutorLoading(true);

    try {
      const reply = await askTutor(userMsg.content, selected.title, selected.description, code);
      const assistantMsg: TutorMessage = {
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      setTutorMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message =
        err instanceof RateLimitError
          ? err.message
          : 'אירעה שגיאה בתקשורת עם המנטור. נסה/י שוב בעוד רגע.';
      const errorMsg: TutorMessage = {
        role: 'assistant',
        content: message,
        timestamp: Date.now(),
      };
      setTutorMessages((prev) => [...prev, errorMsg]);
    } finally {
      setTutorLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">אין תרגילים זמינים כרגע.</p>
      </div>
    );
  }

  // ===== EXERCISE LIST VIEW =====
  if (!selected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">תרגול</h1>
          <p className="mt-1 text-slate-600">בחר תרגיל והתחל לכתוב קוד</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => openExercise(ex)}
              className="text-right p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{ex.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                  {DIFFICULTY_LABELS[ex.difficulty]}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{ex.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600">{ex.points} נקודות</span>
                <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                  התחל תרגול
                  <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecursionVisualizer />
          <DataStructuresVisualizer />
        </div>
      </div>
    );
  }

  // ===== FOCUSED EXERCISE VIEW =====
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top bar — back button + exercise info */}
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={backToList}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ArrowRight size={18} />
          <span>חזרה לתרגילים</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[selected.difficulty]}`}>
            {DIFFICULTY_LABELS[selected.difficulty]}
          </span>
          <span className="text-sm font-medium text-blue-600">{selected.points} נקודות</span>
        </div>
      </div>

      {/* Problem statement — full width */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-3">{selected.title}</h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selected.description}</p>
      </div>

      {/* Code editor + AI Tutor — side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        {/* Code editor column */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-slate-300 font-medium">עורך הקוד</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <Editor
              height="420px"
              defaultLanguage="csharp"
              language="csharp"
              value={code}
              onChange={(val) => setCode(val ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span>{submitting ? 'מעריך...' : 'הגש קוד'}</span>
            </button>
            <button
              onClick={() => { setCode(selected.starter_code); setResult(null); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors text-sm"
            >
              <RotateCcw size={16} />
              <span>איפוס</span>
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-5 border ${result.status === 'graded' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                {result.status === 'graded' ? (
                  <CheckCircle2 className="text-green-600" size={22} />
                ) : (
                  <XCircle className="text-red-600" size={22} />
                )}
                <span className={`text-lg font-bold ${result.status === 'graded' ? 'text-green-700' : 'text-red-700'}`}>
                  הציון: {result.grade}/100
                </span>
              </div>
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{result.feedback}</pre>
            </div>
          )}

          {showComplexity && complexity && (
            <ComplexityReport result={complexity} />
          )}

          {/* Quick complexity check */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                <Gauge size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">בדיקת יעילות קוד מהירה</h3>
                <p className="text-xs text-slate-500">נתח את סיבוכיות הקוד הנוכחי מבלי להגיש</p>
              </div>
            </div>
            <button
              onClick={() => { setComplexity(analyzeComplexity(code)); setShowComplexity(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <Gauge size={16} />
              <span>נתח יעילות</span>
            </button>
            {showComplexity && complexity && (
              <div className="mt-4">
                <ComplexityReport result={complexity} />
              </div>
            )}
          </div>
        </div>

        {/* AI Tutor — side panel */}
        <div className="xl:sticky xl:top-20 xl:self-start">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] xl:h-[calc(100vh-6rem)]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">מורה AI מלווה</h3>
                <p className="text-xs text-slate-500">שאל שאלות וקבל עזרה בזמן תרגול</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {tutorMessages.length === 0 && (
                <div className="text-center py-8">
                  <Lightbulb className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm text-slate-400">שאל אותי שאלה על התרגיל!</p>
                </div>
              )}
              {tutorMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-bl-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-br-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {tutorLoading && (
                <div className="flex justify-end">
                  <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-br-sm">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTutorSend()}
                placeholder="שאל שאלה..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900"
              />
              <button
                onClick={handleTutorSend}
                disabled={!tutorInput.trim() || tutorLoading}
                className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
