import { Code as Code2 } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 36, text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white">
        <Code2 size={s.icon} />
      </div>
      <span className={`${s.text} font-bold text-slate-900`}>
        Code<span className="text-blue-600">Bagrut</span>
      </span>
    </div>
  );
}
