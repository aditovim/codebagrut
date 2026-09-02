import { useState } from 'react';
import { List, Plus, Minus, RotateCcw } from 'lucide-react';

export default function DataStructuresVisualizer() {
  const [array, setArray] = useState<number[]>([5, 2, 8, 1, 9, 3]);
  const [highlight, setHighlight] = useState<number | null>(null);

  const add = () => {
    const val = Math.floor(Math.random() * 99) + 1;
    setArray([...array, val]);
  };

  const remove = () => {
    if (array.length > 0) setArray(array.slice(0, -1));
  };

  const reset = () => {
    setArray([5, 2, 8, 1, 9, 3]);
    setHighlight(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <List className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-slate-900">מצג מבני נתונים - מערך</h3>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={add} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
          <Plus size={14} /> הוסף
        </button>
        <button onClick={remove} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors">
          <Minus size={14} /> הסר
        </button>
        <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors">
          <RotateCcw size={14} /> איפוס
        </button>
      </div>
      <div className="flex items-end gap-2 min-h-[120px] p-4 bg-slate-50 rounded-lg overflow-x-auto" dir="ltr">
        {array.map((val, i) => (
          <div
            key={i}
            onMouseEnter={() => setHighlight(i)}
            onMouseLeave={() => setHighlight(null)}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${highlight === i ? 'scale-110' : ''}`}
          >
            <span className="text-xs text-slate-400 font-mono">[{i}]</span>
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-lg font-mono font-bold text-sm transition-colors ${
                highlight === i
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {val}
            </div>
          </div>
        ))}
        {array.length === 0 && (
          <p className="text-sm text-slate-400 m-auto">המערך ריק</p>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-400">אורך המערך: {array.length}</p>
    </div>
  );
}
