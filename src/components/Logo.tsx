import { Code as Code2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 36 : 28;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20" style={{ width: iconSize + 12, height: iconSize + 12 }}>
        <Code2 size={iconSize} />
      </div>
      <span className={`font-bold ${textSize} text-slate-800`}>
        {APP_NAME}
      </span>
    </div>
  );
}
