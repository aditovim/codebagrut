import { useState } from 'react';
import { Binary, Link2, Plus, Trash2, RefreshCw } from 'lucide-react';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface ListNode {
  value: number;
  next: ListNode | null;
}

type Mode = 'tree' | 'linkedlist';

export default function DataStructuresVisualizer() {
  const [mode, setMode] = useState<Mode>('tree');
  const [treeRoot, setTreeRoot] = useState<TreeNode | null>(null);
  const [listHead, setListHead] = useState<ListNode | null>(null);
  const [inputValue, setInputValue] = useState('');

  // BST insert
  const insertIntoTree = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) return { value, left: null, right: null };
    if (value < root.value) root.left = insertIntoTree(root.left, value);
    else if (value > root.value) root.right = insertIntoTree(root.right, value);
    return root;
  };

  const insertIntoList = (head: ListNode | null, value: number): ListNode => {
    const newNode: ListNode = { value, next: null };
    if (!head) return newNode;
    let curr = head;
    while (curr.next) curr = curr.next;
    curr.next = newNode;
    return head;
  };

  const handleAdd = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    if (mode === 'tree') {
      setTreeRoot((prev) => insertIntoTree(prev ? structuredClone(prev) : null, val));
    } else {
      setListHead((prev) => insertIntoList(prev ? structuredClone(prev) : null, val));
    }
    setInputValue('');
  };

  const handleReset = () => {
    setTreeRoot(null);
    setListHead(null);
    setInputValue('');
  };

  // Render binary tree as SVG
  function renderTree(node: TreeNode | null, x: number, y: number, width: number): React.ReactNode {
    if (!node) return null;
    const halfWidth = width / 2;
    const childY = y + 80;
    return (
      <g>
        {node.left && (
          <>
            <line x1={x} y1={y + 20} x2={x - halfWidth / 2} y2={childY - 20} stroke="#cbd5e1" strokeWidth="2" />
            {renderTree(node.left, x - halfWidth / 2, childY, halfWidth)}
          </>
        )}
        {node.right && (
          <>
            <line x1={x} y1={y + 20} x2={x + halfWidth / 2} y2={childY - 20} stroke="#cbd5e1" strokeWidth="2" />
            {renderTree(node.right, x + halfWidth / 2, childY, halfWidth)}
          </>
        )}
        <circle cx={x} cy={y} r="20" fill={node.left || node.right ? "#3b82f6" : "#22c55e"} stroke="white" strokeWidth="2" />
        <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="monospace">
          {node.value}
        </text>
      </g>
    );
  }

  function countTreeNodes(node: TreeNode | null): number {
    if (!node) return 0;
    return 1 + countTreeNodes(node.left) + countTreeNodes(node.right);
  }

  function countListNodes(node: ListNode | null): number {
    let count = 0;
    let curr = node;
    while (curr) { count++; curr = curr.next; }
    return count;
  }

  const treeCount = countTreeNodes(treeRoot);
  const listCount = countListNodes(listHead);
  const svgWidth = Math.max(300, treeCount * 60);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white">
          {mode === 'tree' ? <Binary size={16} /> : <Link2 size={16} />}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">ויזואליזציה של מבני נתונים</h3>
          <p className="text-xs text-slate-500">עץ חיפוש בינארי (BST) ורשימה מקושרת — הוסף ערכים וראה את המבנה מתעדכן</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setMode('tree')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'tree' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Binary size={14} />
          <span>עץ בינארי</span>
        </button>
        <button
          onClick={() => setMode('linkedlist')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'linkedlist' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Link2 size={14} />
          <span>רשימה מקושרת</span>
        </button>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="הכנס ערך..."
          className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-center"
          dir="ltr"
        />
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          <span>הוסף</span>
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 text-sm hover:bg-slate-100 transition-colors"
        >
          <RefreshCw size={14} />
          <span>איפוס</span>
        </button>
        <span className="text-sm text-slate-400 mr-auto">
          {mode === 'tree' ? `${treeCount} צמתים` : `${listCount} צמתים`}
        </span>
      </div>

      {/* Visualization */}
      <div className="bg-slate-50 rounded-xl p-4 min-h-[200px] flex items-center justify-center overflow-x-auto">
        {mode === 'tree' ? (
          treeRoot ? (
            <svg width={svgWidth} height="300" className="overflow-visible">
              {renderTree(treeRoot, svgWidth / 2, 40, svgWidth)}
            </svg>
          ) : (
            <p className="text-slate-400 text-sm">הוסף ערכים כדי לבנות את העץ</p>
          )
        ) : (
          listHead ? (
            <div className="flex items-center gap-1 flex-wrap justify-center" dir="ltr">
              {renderList(listHead)}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">הוסף ערכים כדי לבנות את הרשימה</p>
          )
        )}
      </div>

      {mode === 'tree' && treeRoot && (
        <p className="mt-3 text-xs text-slate-500 text-center">
          צמתים כחולים = צמתים פנימיים • צמתים ירוקים = עלים (leaves)
        </p>
      )}
    </div>
  );
}

function renderList(node: ListNode | null): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let curr: ListNode | null = node;
  let i = 0;
  while (curr) {
    nodes.push(
      <div key={i} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className="px-4 py-2 rounded-lg bg-blue-600 text-white font-mono text-sm border-2 border-blue-700 shadow-sm">
            {curr.value}
          </div>
          <span className="text-xs text-slate-400 mt-0.5">next</span>
        </div>
        {curr.next && <span className="text-slate-400 text-xl mx-1">→</span>}
        {!curr.next && <span className="text-slate-400 text-xs mr-2">null</span>}
      </div>
    );
    curr = curr.next;
    i++;
  }
  return <>{nodes}</>;
}
