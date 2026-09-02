import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, BookOpen, GraduationCap, FileText, Calendar, MessageSquare, Code as Code2, FlaskConical, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { session, profile, signOut, effectiveRole, devRoleOverride, setDevRoleOverride } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
    { to: '/practice', label: 'תרגול', icon: Code2 },
    { to: '/exam', label: 'מבחן סימולציה', icon: GraduationCap },
    { to: '/archive', label: 'שאלות בגרות', icon: FileText },
    { to: '/skills', label: 'מיומנויות', icon: BookOpen },
    { to: '/announcements', label: 'עדכונים', icon: MessageSquare },
  ];

  const teacherLinks = [
    { to: '/teacher', label: 'לוח מורה', icon: LayoutDashboard },
    { to: '/announcements', label: 'עדכונים', icon: MessageSquare },
  ];

  const links = effectiveRole === 'teacher' ? teacherLinks : studentLinks;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {session ? (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Icon size={16} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {devRoleOverride && (
                  <button
                    onClick={() => setDevRoleOverride(null)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
                    title="חזרה לתפקיד מקורי"
                  >
                    <FlaskConical size={14} />
                    <span>dev: {devRoleOverride === 'teacher' ? 'מורה' : 'תלמיד'}</span>
                    <X size={12} />
                  </button>
                )}
                {!devRoleOverride && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDevRoleOverride(effectiveRole === 'teacher' ? 'student' : 'teacher')}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      title="מצב פיתוח — החלפת תפקיד"
                    >
                      <FlaskConical size={14} />
                    </button>
                  </div>
                )}
                <span className="hidden sm:block text-sm text-slate-500">
                  {profile?.full_name ?? profile?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">התנתק</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                התחברות
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                הרשמה
              </Link>
            </div>
          )}
        </div>

        {session && (
          <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  <Icon size={14} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
