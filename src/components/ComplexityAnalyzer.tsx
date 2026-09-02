import { useState } from 'react';
import { ChartBar as BarChart3, Info } from 'lucide-react';

export interface ComplexityResult {
  bigO: string;
  maxNesting: number;
  hasRecursion: boolean;
}

export function analyzeComplexity(code: string): ComplexityResult {
  const lines = code.trim().split('\n');
  let maxNesting = 0;
  let currentNesting = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('for') || trimmed.includes('while') || trimmed.includes('foreach')) {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    }
    if (trimmed === '}' || trimmed.endsWith('}')) {
      currentNesting = Math.max(0, currentNesting - 1);
    }
  }

  const hasRecursion = code.includes('Recursion') || code.includes('recursion') || /function.*\{.*\n.*function/.test(code);

  let bigO = 'O(1)';
  if (maxNesting === 1) bigO = 'O(n)';
  else if (maxNesting === 2) bigO = 'O(n²)';
  else if (maxNesting >= 3) bigO = `O(n^${maxNesting})`;

  if (hasRecursion) {
    bigO = 'O(2^n) או גרוע יותר (רקורסיה)';
  }

  return { bigO, maxNesting, hasRecursion };
}

export function ComplexityReport({ result }: { result: ComplexityResult }) {
  return (
    <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
      <div className="flex items-center gap-2">
        <Info size={16} className="text-blue-600" />
        <span className="text-sm font-medium text-blue-900">סיבוכיות משוערת: {result.bigO}</span>
      </div>
    </div>
  );
}

export default function ComplexityAnalyzer() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ComplexityResult | null>(null);

  const analyze = () => {
    setResult(analyzeComplexity(code));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-slate-900">מנתח סיבוכיות</h3>
      </div>
      <p className="text-sm text-slate-500 mb-4">הזן קוד C# לניתוח סיבוכיות זמן ריצה משוערת</p>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="הדבק כאן קוד C#..."
        className="w-full h-40 p-3 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
        dir="ltr"
      />
      <button
        onClick={analyze}
        disabled={!code.trim()}
        className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        נתח סיבוכיות
      </button>
      {result && <ComplexityReport result={result} />}
    </div>
  );
}
