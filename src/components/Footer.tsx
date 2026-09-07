import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="[&_*]:!text-white [&_.text-blue-600]:!text-blue-400">
            <Logo size="sm" />
          </div>
          <p className="text-sm text-slate-400 text-center">
            פלטפורמה לתרגול והכנה לבגרות במדעי המחשב - C#
          </p>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} CodeBagrut. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
