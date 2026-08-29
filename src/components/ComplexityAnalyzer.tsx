import { Gauge, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react';

export interface ComplexityResult {
  complexity: string;
  level: 'optimal' | 'acceptable' | 'inefficient';
  loopCount: number;
  nestedLoops: boolean;
  hasRecursion: boolean;
  suggestions: string[];
}

export function analyzeComplexity(code: string): ComplexityResult {
  const forCount = (code.match(/\bfor\b/g) ?? []).length;
  const whileCount = (code.match(/\bwhile\b/g) ?? []).length;
  const loopCount = forCount + whileCount;
  const hasRecursion = /(\w+)\s*\([^)]*\)\s*\{[^}]*\1\s*\(/.test(code);
  const nestedLoops = loopCount >= 2 && checkNestedLoops(code);

  let complexity = 'O(1)';
  let level: 'optimal' | 'acceptable' | 'inefficient' = 'optimal';

  if (hasRecursion) {
    complexity = 'O(2^n) או O(n)';
    level = 'acceptable';
  } else if (nestedLoops) {
    complexity = 'O(n²)';
    level = 'inefficient';
  } else if (loopCount > 0) {
    complexity = 'O(n)';
    level = 'optimal';
  }

  const suggestions: string[] = [];
  if (nestedLoops) {
    suggestions.push('זוהו לולאות מקוננות — סיבוכיות O(n²). כדאי לבדוק אם ניתן להשתמש ב-HashMap או לצמצם ללולאה אחת.');
  }
  if (hasRecursion && !/\bbase\b|\bstop\b|if\s*\(.+==\s*0\)/.test(code)) {
    suggestions.push('ברקורסיה חשוב להגדיר תנאי עצירה (base case) ברור.');
  }
  if (loopCount > 3) {
    suggestions.push('יש מספר רב של לולאות. כדאי לבדוק אם ניתן לאחד פעולות.');
  }
  if (suggestions.length === 0) {
    suggestions.push('הקוד נראה יעיל מבחינת סיבוכיות זמן.');
  }

  return { complexity, level, loopCount, nestedLoops, hasRecursion, suggestions };
}

function checkNestedLoops(code: string): boolean {
  const lines = code.split('\n');
  let depth = 0;
  let maxDepth = 0;
  for (const line of lines) {
    if (/\b(for|while)\b/.test(line)) {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    }
    if (line.includes('}')) {
      depth = Math.max(0, depth - 1);
    }
  }
  return maxDepth >= 2;
}

export function ComplexityReport({ result }: { result: ComplexityResult }) {
  const levelConfig = {
    optimal: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2, label: 'יעיל' },
    acceptable: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Gauge, label: 'קביל' },
    inefficient: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, label: 'לא יעיל' },
  };
  const cfg = levelConfig[result.level];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cfg.color} size={20} />
        <span className={`font-semibold ${cfg.color}`}>ניתוח יעילות: {result.complexity}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
          {cfg.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{result.loopCount}</p>
          <p className="text-xs text-slate-500">לולאות</p>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{result.nestedLoops ? 'כן' : 'לא'}</p>
          <p className="text-xs text-slate-500">מקוננות</p>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{result.hasRecursion ? 'כן' : 'לא'}</p>
          <p className="text-xs text-slate-500">רקורסיה</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {result.suggestions.map((s, i) => (
          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
