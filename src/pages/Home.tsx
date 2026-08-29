import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Code as Code2, GraduationCap, Brain, CircleCheck as CheckCircle2, Gauge, GitBranch, Binary, Megaphone, Archive } from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

const FEATURES = [
  {
    icon: Code2,
    title: 'תרגול אינטראקטיבי',
    description: 'תרגל תרגילי תכנות אמיתיים מהבגרות עם עורך קוד מקצועי',
  },
  {
    icon: Brain,
    title: 'משוב AI מפורט',
    description: 'קבל הערכה ומשוב חכם בעברית על הקוד שלך מיד לאחר ההגשה',
  },
  {
    icon: Gauge,
    title: 'בדיקת יעילות קוד',
    description: 'ניתוח סיבוכיות זמן/מקום (O(n), O(n^2)) עם המלצות לייעול',
  },
  {
    icon: GitBranch,
    title: 'ויזואליזציה של רקורסיה',
    description: 'עץ קריאות ויזואלי המציג את פתיחת הקריאות והחזרת הערכים',
  },
  {
    icon: Binary,
    title: 'מבני נתונים חיים',
    description: 'ויזואליזציה דינמית של עצים בינאריים ורשימות מקושרות',
  },
  {
    icon: Archive,
    title: 'ארכיון בגרויות',
    description: 'מאגר שאלות מסווג לפי שנה, מועד, שאלון ונושא עם תגיות',
  },
  {
    icon: Megaphone,
    title: 'הודעות ולוח זמנים',
    description: 'ניהול הודעות, תזכורות, מועדי הגשה ושיעורים קרובים',
  },
  {
    icon: GraduationCap,
    title: 'מעקב התקדמות',
    description: 'צפה בציונים, בהיסטוריה ובהתקדמות שלך לאורך זמן',
  },
];

const STEPS = [
  { num: '1', title: 'הירשם', description: 'צור חשבון תלמיד או מורה במהירות' },
  { num: '2', title: 'תרגל', description: 'פתור תרגילי תכנות בנושאי לולאות, מערכים ומחלקות' },
  { num: '3', title: 'קבל משוב', description: 'קבל ציון והערות מפורטות מה-AI' },
  { num: '4', title: 'התקדם', description: 'עקוב אחר ההתקדמות ושפר את הביצועים' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <GraduationCap size={16} />
            <span>בגרות 5 יחידות • מדעי המחשב</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto">
            {APP_NAME}
            <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 text-blue-600">{APP_DESCRIPTION}</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            פלטפורמת תרגול חכמה לתלמידי מדעי המחשב. תרגל תרגילי בגרות אמיתיים, קבל משוב מיידי מ-AI, ועקוב אחר ההתקדמות שלך.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <span>התחל לתרגל עכשיו</span>
              <ArrowLeft size={20} />
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              <span>צפה בתרגילים</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">למה {APP_NAME}?</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">כל מה שצריך כדי להתכונן לבגרות במדעי המחשב במקום אחד</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">איך זה עובד?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-blue-200 text-blue-600 text-2xl font-bold mb-4 shadow-sm">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
                {step.num !== '4' && (
                  <div className="hidden md:block absolute top-8 -left-4 w-8 h-0.5 bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">מוכנים להתחיל?</h2>
          <p className="text-blue-50 mb-8 text-lg">הצטרפו עכשיו והתחילו לתרגל לבגרות במדעי המחשב</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-all shadow-lg"
          >
            <span>יצירת חשבון</span>
            <ArrowLeft size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
