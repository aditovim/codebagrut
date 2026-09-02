import { X, FileCode, FileCheck, FileText } from 'lucide-react';

export type CreationType = 'simple' | 'auto-tests' | 'import-doc';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: CreationType) => void;
}

const cards: {
  type: CreationType;
  icon: typeof FileCode;
  title: string;
  description: string;
  badge?: string;
}[] = [
  {
    type: 'simple',
    icon: FileCode,
    title: 'תרגיל פשוט חדש (בדיקת AI)',
    description: 'יצירת תרגיל חדש עם תיאור משימה',
  },
  {
    type: 'auto-tests',
    icon: FileCheck,
    title: 'תרגיל עם בדיקות אוטומטיות (בדיקות ידניות)',
    description: 'תרגיל עם אפשרויות בדיקה אוטומטית, קבצי קוד מוכנים ועוד',
  },
  {
    type: 'import-doc',
    icon: FileText,
    title: 'יבוא תרגילים במסמך',
    description: 'צרו תרגילים מתוך מסמך PDF או תמונה מוכנים',
    badge: 'בטא',
  },
];

export default function ExerciseCreationModal({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">יצירת תרגיל חדש</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.type}
                onClick={() => onSelect(card.type)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-right group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{card.title}</h3>
                    {card.badge && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{card.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-start">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
