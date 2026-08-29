import { Code as Code2 } from 'lucide-react';
import Logo from './Logo';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                <Code2 size={22} />
              </div>
              <span className="text-xl font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-sm text-slate-400">{APP_DESCRIPTION}</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-sm text-slate-400">כל הזכויות שמורות © {new Date().getFullYear()}</p>
            <p className="text-xs text-slate-500">פלטפורמת הכנה לבגרות במדעי המחשב</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
