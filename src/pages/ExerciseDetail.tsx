import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import exerciseData from '@/data/exercises.json';
import type { ExerciseLibraryData, ExerciseCategory, LibraryExercise, ExercisePart } from '@/types/library';

const data = exerciseData as ExerciseLibraryData;

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'קשה',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

export default function ExerciseDetail() {
  const { categoryId, exerciseId } = useParams<{ categoryId: string; exerciseId: string }>();

  const category: ExerciseCategory | undefined = data.categories.find((c) => c.id === categoryId);
  const exercise: LibraryExercise | undefined = category?.exercises.find((e) => e.id === exerciseId);

  if (!category || !exercise) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">התרגיל לא נמצא.</p>
        <Link to="/library" className="text-blue-600 hover:underline mt-2 inline-block">חזרה לספרייה</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb + title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/library" className="hover:text-blue-600 transition-colors">ספרייה</Link>
          <span>/</span>
          <Link to={`/library/${category.id}`} className="hover:text-blue-600 transition-colors">{category.name}</Link>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{exercise.title}</h1>
            <p className="mt-2 text-slate-600 leading-relaxed max-w-2xl">{exercise.summary}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap flex-shrink-0 ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </span>
        </div>
      </div>

      {/* Parts */}
      <div className="space-y-6">
        {exercise.parts.map((part: ExercisePart, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Part header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <h2 className="font-bold text-slate-900 text-base">{part.label}</h2>
              </div>
            </div>

            {/* Prompt */}
            <div className="px-6 py-4">
              <div className="flex items-start gap-2 mb-4">
                <BookOpen className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-700 leading-relaxed">{part.prompt}</p>
              </div>

              {/* Code editor (read-only) */}
              <div className="rounded-xl overflow-hidden border border-slate-700">
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">C#</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>
                <Editor
                  height={Math.max(120, part.code.split('\n').length * 20) + 'px'}
                  defaultLanguage="csharp"
                  language="csharp"
                  value={part.code}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    tabSize: 4,
                    lineNumbers: 'on',
                    domReadOnly: true,
                  }}
                />
              </div>

              {/* Explanation */}
              <div className="mt-4 flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <Lightbulb className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">הסבר</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">{part.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          to={`/library/${category.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ArrowRight size={18} />
          <span>חזרה ל{category.name}</span>
        </Link>
      </div>
    </div>
  );
}
