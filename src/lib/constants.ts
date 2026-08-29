export const APP_NAME = 'CodeBagrut';
export const APP_DESCRIPTION = 'הכנה לבגרות 5 יחידות במדעי המחשב';

export const NAV_LINKS = [
  { label: 'דף הבית', path: '/' },
  { label: 'תרגול', path: '/practice' },
  { label: 'מבחן מדמה', path: '/exam' },
  { label: 'מיומנויות', path: '/skills' },
  { label: 'ארכיון בגרויות', path: '/archive' },
  { label: 'הודעות', path: '/announcements' },
  { label: 'לוח בקרה', path: '/dashboard' },
  // הוסר: 'מורה' — לא אמור להופיע בתפריט לכולם. מוצג ב-Navbar.tsx רק
  // כשprofile?.role === 'teacher', עבור משתמש מחובר שהוא באמת מורה.
];

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'מתחיל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};
