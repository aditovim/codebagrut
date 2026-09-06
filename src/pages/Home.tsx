import { Link } from 'react-router-dom';
import { Code as Code2, GraduationCap, Brain, FileText, TrendingUp, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { session, effectiveRole } = useAuth();

  const features = [
    { icon: Code2, title: 'תרגול אינטראקטיבי', desc: 'תרגלו תרגילי C# בעורך קוד מקצועי עם בדיקה אוטומטית', accent: 'blue', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', hoverBorder: 'hover:border-blue-200' },
    { icon: Brain, title: 'מנטור AI', desc: 'קבלו עזרה והכוונה ממנטור AI חכם במהלך התרגול', accent: 'purple', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', hoverBorder: 'hover:border-purple-200' },
    { icon: GraduationCap, title: 'סימולציית בגרות', desc: 'תרגלו בתנאי מבחן אמיתיים עם ניהול זמן וציון', accent: 'green', iconBg: 'bg-green-50', iconColor: 'text-green-600', hoverBorder: 'hover:border-green-200' },
    { icon: FileText, title: 'ארכיון בגרויות', desc: 'גישה לשאלות בגרות אמיתיות משנים קודמות', accent: 'orange', iconBg: 'bg-orange-50', iconColor: 'text-orange-600', hoverBorder: 'hover:border-orange-200' },
    { icon: TrendingUp, title: 'מעקב התקדמות', desc: 'עקבו אחר ההתקדמות שלכם, הציונים והתחומים לשיפור', accent: 'cyan', iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600', hoverBorder: 'hover:border-cyan-200' },
    { icon: Zap, title: 'כלים ויזואליים', desc: 'ויזואליזציה של רקורסיה, מבני נתונים וניתוח יעילות קוד', accent: 'amber', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', hoverBorder: 'hover:border-amber-200' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white">
        {/* Glow mesh background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-sm text-slate-200 mb-6">
                <Sparkles size={14} className="text-blue-400" />
                <span>הכנה לבגרות במדעי המחשב — C#</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                קוד<span className="text-blue-400">Bagrut</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                הפלטפורמה המקיפה להכנה לבגרות — תרגול, מנטור AI, סימולציות מבחנים, כלים ויזואליים ועוד
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                {session ? (
                  <Link
                    to={effectiveRole === 'teacher' ? '/teacher' : '/dashboard'}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
                  >
                    <span>כניסה ללוח הבקרה</span>
                    <ArrowLeft size={18} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
                    >
                      <span>התחילו לתרגל עכשיו</span>
                      <ArrowLeft size={18} />
                    </Link>
                    <Link
                      to="/practice"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur text-white font-semibold hover:bg-white/20 transition-all border border-white/20"
                    >
                      <Zap size={18} className="text-cyan-400" />
                      <span>נסו ללא הרשמה</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Code preview card */}
            <div className="hidden lg:block">
              <div className="rounded-2xl bg-slate-950/80 backdrop-blur border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="mr-2 text-xs text-slate-400 font-mono">Program.cs</span>
                </div>
                <pre className="p-5 text-sm leading-relaxed font-mono text-slate-300 overflow-x-auto" dir="ltr"><code>{`public static int BestRunner()
{
    int minTime = int.MaxValue;
    int bestNumber = -1;

    for (int i = 0; i < runners.Length; i++)
    {
        if (runners[i] != null &&
            runners[i].GetTime() < minTime)
        {
            minTime = runners[i].GetTime();
            bestNumber = runners[i].GetNumber();
        }
    }
    return bestNumber;
}`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">
            מה מציעה הפלטפורמה?
          </h2>
          <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
            כל מה שצריך כדי להגיע מוכן לבגרות — במקום אחד
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-white rounded-2xl border border-slate-200/80 p-6 ${feature.hoverBorder} hover:shadow-lg transition-all group`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={feature.iconColor} size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      {!session && (
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-right">
                <h2 className="text-2xl font-bold mb-1">מוכנים להתחיל?</h2>
                <p className="text-blue-100">הצטרפו עכשיו בחינם והתחילו לתרגל</p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                <span>יצירת חשבון</span>
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
