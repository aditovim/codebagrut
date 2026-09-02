import { Link } from 'react-router-dom';
import { Code as Code2, GraduationCap, Brain, FileText, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function Home() {
  const { session, profile } = useAuth();

  const features = [
    { icon: Code2, title: 'תרגול אינטראקטיבי', desc: 'תרגלו תרגילי C# בעורך קוד מקצועי עם בדיקה אוטומטית' },
    { icon: Brain, title: 'מנטור AI', desc: 'קבלו עזרה והכוונה ממנטור AI חכם במהלך התרגול' },
    { icon: GraduationCap, title: 'סימולציית בגרות', desc: 'תרגלו בתנאי מבחן אמיתיים עם ניהול זמן וציון' },
    { icon: FileText, title: 'ארכיון בגרויות', desc: 'גישה לשאלות בגרות אמיתיות משנים קודמות' },
    { icon: TrendingUp, title: 'מעקב התקדמות', desc: 'עקבו אחר ההתקדמות שלכם, הציונים והתחומים לשיפור' },
  ];

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              קוד<span className="text-blue-400">Bagrut</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              הפלטפורמה המקיפה להכנה לבגרות במדעי המחשב - C#
              <br />
              תרגול, מנטור AI, סימולציות מבחנים ועוד
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {session ? (
                <Link
                  to={profile?.role === 'teacher' ? '/teacher' : '/dashboard'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
                >
                  <span>כניסה ללוח הבקרה</span>
                  <ArrowLeft size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
                  >
                    <span>התחילו לתרגל עכשיו</span>
                    <ArrowLeft size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur text-white font-semibold hover:bg-white/20 transition-colors border border-white/20"
                  >
                    יש לי חשבון
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            מה מציעה הפלטפורמה?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
