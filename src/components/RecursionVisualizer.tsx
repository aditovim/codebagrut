import { useState } from 'react';
import { GitBranch, Play } from 'lucide-react';

export default function RecursionVisualizer() {
  const [input, setInput] = useState('5');
  const [steps, setSteps] = useState<{ depth: number; call: string; result?: number }[]>([]);

  const visualizeFactorial = (n: number) => {
    const trace: { depth: number; call: string; result?: number }[] = [];
    const factorial = (num: number, depth: number): number => {
      trace.push({ depth, call: `factorial(${num})` });
      if (num <= 1) {
        trace[trace.length - 1].result = 1;
        return 1;
      }
      const result = num * factorial(num - 1, depth + 1);
      trace[trace.length - 1].result = result;
      return result;
    };
    factorial(n, 0);
    setSteps(trace);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-slate-900">מצג רקורסיה - עץ קריאות</h3>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-blue-500"
          dir="ltr"
        />
        <button
          onClick={() => visualizeFactorial(parseInt(input) || 0)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Play size={14} />
          הרץ
        </button>
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto" dir="ltr">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-1 px-2 rounded font-mono text-sm"
            style={{ paddingLeft: `${step.depth * 24 + 8}px` }}
          >
            <span className="text-slate-400">{'→'.repeat(step.depth)}</span>
            <span className="text-slate-700">{step.call}</span>
            {step.result !== undefined && (
              <span className="text-green-600 font-bold">= {step.result}</span>
            )}
          </div>
        ))}
        {steps.length === 0 && (
          <p className="text-sm text-slate-400">הזן מספר ולחץ "הרץ" כדי לראות את עץ הקריאות הרקורסיבי</p>
        )}
      </div>
    </div>
  );
}
