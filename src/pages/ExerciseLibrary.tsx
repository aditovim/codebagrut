import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Code as Code2, Layers } from 'lucide-react';
import exerciseData from '@/data/exercises.json';
import type { ExerciseLibraryData, LibraryExercise } from '@/types/library';

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

export default function ExerciseLibrary() {
  const { categoryId } = useParams<{ categoryId: string }>();

  if (categoryId) {
    const category = data.categories.find((c) => c.id === categoryId);
    if (!category) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-slate-500">הקטגוריה לא נמצאה.</p>
          <Link to="/library" className="text-blue-600 hover:underline mt-2 inline-block">חזרה לספרייה</Link>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/library" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-3">
            <ArrowRight size={18} />
            <span>חזרה לקטגוריות</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Layers className="text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{category.name}</h1>
              <p className="text-sm text-slate-600">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.exercises.map((ex: LibraryExercise) => (
            <Link
              key={ex.id}
              to={`/library/${category.id}/${ex.id}`}
              className="block p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">{ex.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                  {DIFFICULTY_LABELS[ex.difficulty]}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{ex.summary}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Code2 size={14} />
                  <span>{ex.parts.length} חלקים</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                  פתרון
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">ספריית תרגילים</h1>
        <p className="mt-1 text-slate-600">תרגילי C# מסודרים לפי קטגוריות עם פתרונות מלאים והסברים</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/library/${cat.id}`}
            className="block p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Layers className="text-blue-600" size={26} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{cat.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{cat.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">{cat.exercises.length} תרגילים</span>
              <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                כניסה
                <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
