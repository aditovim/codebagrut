import { useState, useMemo } from 'react';
import { GitBranch, Play, RotateCcw } from 'lucide-react';

interface CallNode {
  id: number;
  label: string;
  params: string;
  returnValue: string | null;
  children: CallNode[];
  depth: number;
  isBase: boolean;
}

export default function RecursionVisualizer() {
  const [input, setInput] = useState('5');
  const [tree, setTree] = useState<CallNode | null>(null);

  const generateFactorialTree = useMemo(() => {
    return (n: number): CallNode => {
      let id = 0;
      function build(num: number, depth: number): CallNode {
        const node: CallNode = {
          id: id++,
          label: `factorial(${num})`,
          params: `n=${num}`,
          returnValue: null,
          children: [],
          depth,
          isBase: num <= 1,
        };
        if (num <= 1) {
          node.returnValue = '1';
        } else {
          const child = build(num - 1, depth + 1);
          node.children.push(child);
          node.returnValue = `${num * parseInt(child.returnValue ?? '1')}`;
        }
        return node;
      }
      return build(n, 0);
    };
  }, []);

  const run = () => {
    const n = parseInt(input) || 5;
    const clamped = Math.min(Math.max(n, 1), 8);
    setTree(generateFactorialTree(clamped));
  };

  const reset = () => {
    setTree(null);
    setInput('5');
  };

  function renderNode(node: CallNode, isLast: boolean = true, prefix: string = ''): React.ReactNode {
    const lines: React.ReactNode[] = [];

    const connector = node.depth === 0 ? '' : isLast ? '└── ' : '├── ';
    const bgColor = node.isBase ? 'bg-green-50 border-green-300 text-green-700' : 'bg-blue-50 border-blue-300 text-blue-700';

    lines.push(
      <div key={node.id} className="flex items-center gap-1 my-0.5" dir="ltr">
        <span className="text-slate-400 font-mono text-xs whitespace-pre">{prefix}{connector}</span>
        <span className={`px-2 py-0.5 rounded border text-xs font-mono ${bgColor}`}>
          {node.label}
          {node.returnValue !== null && (
            <span className="text-slate-500"> → {node.returnValue}</span>
          )}
          {node.isBase && <span className="text-green-600 mr-1"> (base case)</span>}
        </span>
      </div>
    );

    const childPrefix = node.depth === 0 ? '' : prefix + (isLast ? '    ' : '│   ');
    node.children.forEach((child, i) => {
      const childIsLast = i === node.children.length - 1;
      lines.push(renderNode(child, childIsLast, childPrefix));
    });

    return <div key={node.id}>{lines}</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
          <GitBranch size={16} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">ויזואליזציה של עץ קריאות רקורסיבי</h3>
          <p className="text-xs text-slate-500">עץ הקריאות של factorial(n) — ראה את פתיחת הקריאות, תנאי העצירה, והחזרת הערכים</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <code className="text-sm font-mono text-slate-700">factorial(</code>
          <input
            type="number"
            min={1}
            max={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono text-center"
            dir="ltr"
          />
          <code className="text-sm font-mono text-slate-700">)</code>
          <button
            onClick={run}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Play size={14} />
            <span>הרץ</span>
          </button>
          {tree && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 text-sm hover:bg-slate-100 transition-colors"
            >
              <RotateCcw size={14} />
              <span>איפוס</span>
            </button>
          )}
        </div>
      </div>

      {tree && (
        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
          <div className="text-slate-200 font-mono text-sm" dir="ltr">
            {renderNode(tree)}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="w-3 h-3 rounded border border-green-400 bg-green-900/50" />
              base case
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-3 h-3 rounded border border-blue-400 bg-blue-900/50" />
              קריאה רקורסיבית
            </span>
            <span className="text-slate-400">→ החזרת ערך</span>
          </div>
        </div>
      )}

      {!tree && (
        <div className="text-center py-8 text-slate-400 text-sm">
          הכנס מספר (1-8) ולחץ "הרץ" כדי לראות את עץ הקריאות
        </div>
      )}
    </div>
  );
}
