import { useEffect, useState, type FormEvent } from 'react';
import { Megaphone, Calendar, Plus, Trash2, Clock, Link as LinkIcon, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Announcement, ScheduleItem } from '@/types';

const ANNOUNCEMENT_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  announcement: { label: 'הודעה', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  reminder: { label: 'תזכורת', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  assignment: { label: 'מטלה', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  exam: { label: 'מבחן', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

const SCHEDULE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  lesson: { label: 'שיעור', color: 'bg-blue-100 text-blue-700' },
  exam: { label: 'מבחן', color: 'bg-red-100 text-red-700' },
  deadline: { label: 'מועד אחרון', color: 'bg-yellow-100 text-yellow-700' },
  event: { label: 'אירוע', color: 'bg-green-100 text-green-700' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Announcements() {
  const { user, profile } = useAuth();
  const isTeacher = profile?.role === 'teacher';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'announcements' | 'schedule'>('announcements');

  const [aTitle, setATitle] = useState('');
  const [aContent, setAContent] = useState('');
  const [aType, setAType] = useState<'announcement' | 'reminder' | 'assignment' | 'exam'>('announcement');
  const [aLink, setALink] = useState('');
  const [aDueDate, setADueDate] = useState('');
  const [aSubmitting, setASubmitting] = useState(false);
  const [showAForm, setShowAForm] = useState(false);

  const [sTitle, setSTitle] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sDate, setSDate] = useState('');
  const [sStart, setSStart] = useState('');
  const [sEnd, setSEnd] = useState('');
  const [sType, setSType] = useState<'lesson' | 'exam' | 'deadline' | 'event'>('lesson');
  const [sLink, setSLink] = useState('');
  const [sSubmitting, setSSubmitting] = useState(false);
  const [showSForm, setShowSForm] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: aData }, { data: sData }] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('schedule_items').select('*').order('item_date', { ascending: true }),
      ]);
      setAnnouncements((aData as Announcement[]) ?? []);
      setSchedule((sData as ScheduleItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleCreateAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setASubmitting(true);
    const { data } = await supabase
      .from('announcements')
      .insert({ author_id: user.id, title: aTitle, content: aContent, type: aType, link_url: aLink || null, due_date: aDueDate || null })
      .select().single();
    setASubmitting(false);
    if (data) {
      setAnnouncements((prev) => [data as Announcement, ...prev]);
      setATitle(''); setAContent(''); setALink(''); setADueDate('');
      setShowAForm(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreateSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSSubmitting(true);
    const { data } = await supabase
      .from('schedule_items')
      .insert({ author_id: user.id, title: sTitle, description: sDesc || null, item_date: sDate, start_time: sStart || null, end_time: sEnd || null, item_type: sType, link_url: sLink || null })
      .select().single();
    setSSubmitting(false);
    if (data) {
      setSchedule((prev) => [...prev, data as ScheduleItem].sort((a, b) => a.item_date.localeCompare(b.item_date)));
      setSTitle(''); setSDesc(''); setSDate(''); setSStart(''); setSEnd(''); setSLink('');
      setShowSForm(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    await supabase.from('schedule_items').delete().eq('id', id);
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">הודעות ולוח זמנים</h1>
        <p className="mt-1 text-slate-600">הודעות מורה, תזכורות, מועדי הגשה ושיעורים קרובים</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setTab('announcements')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'announcements' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Megaphone size={16} />
          <span>הודעות ({announcements.length})</span>
        </button>
        <button onClick={() => setTab('schedule')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Calendar size={16} />
          <span>לוח זמנים ({schedule.length})</span>
        </button>
      </div>

      {tab === 'announcements' && (
        <div>
          {isTeacher && (
            <div className="mb-6">
              <button onClick={() => setShowAForm(!showAForm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">
                <Plus size={18} />
                <span>{showAForm ? 'סגור טופס' : 'הודעה חדשה'}</span>
              </button>
            </div>
          )}

          {showAForm && isTeacher && (
            <form onSubmit={handleCreateAnnouncement} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">כותרת</label>
                  <input value={aTitle} onChange={(e) => setATitle(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="כותרת ההודעה" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">סוג</label>
                  <select value={aType} onChange={(e) => setAType(e.target.value as typeof aType)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm">
                    {Object.entries(ANNOUNCEMENT_TYPE_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תוכן</label>
                <textarea value={aContent} onChange={(e) => setAContent(e.target.value)} required rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="תוכן ההודעה..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">קישור (אופציונלי)</label>
                  <input value={aLink} onChange={(e) => setALink(e.target.value)} dir="ltr" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">תאריך יעד (אופציונלי)</label>
                  <input type="date" value={aDueDate} onChange={(e) => setADueDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                </div>
              </div>
              <button type="submit" disabled={aSubmitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
                {aSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>פרסם הודעה</span>
              </button>
            </form>
          )}

          {announcements.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-400">אין הודעות עדיין</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => {
                const cfg = ANNOUNCEMENT_TYPE_CONFIG[a.type];
                return (
                  <div key={a.id} className={`rounded-xl p-5 border ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} bg-white/60`}>{cfg.label}</span>
                        <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      </div>
                      {isTeacher && (<button onClick={() => handleDeleteAnnouncement(a.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>)}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{a.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>{formatDate(a.created_at)}</span>
                      {a.due_date && (<span className="flex items-center gap-1 text-red-600 font-medium"><AlertCircle size={12} />מועד אחרון: {formatDate(a.due_date)}</span>)}
                      {a.link_url && (<a href={a.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><LinkIcon size={12} />קישור</a>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'schedule' && (
        <div>
          {isTeacher && (
            <div className="mb-6">
              <button onClick={() => setShowSForm(!showSForm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">
                <Plus size={18} />
                <span>{showSForm ? 'סגור טופס' : 'אירוע חדש'}</span>
              </button>
            </div>
          )}

          {showSForm && isTeacher && (
            <form onSubmit={handleCreateSchedule} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">כותרת</label>
                  <input value={sTitle} onChange={(e) => setSTitle(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="שיעור / מבחן / מועד אחרון" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">סוג</label>
                  <select value={sType} onChange={(e) => setSType(e.target.value as typeof sType)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm">
                    {Object.entries(SCHEDULE_TYPE_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תיאור (אופציונלי)</label>
                <input value={sDesc} onChange={(e) => setSDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="תיאור קצר" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">תאריך</label>
                  <input type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">שעת התחלה</label>
                  <input type="time" value={sStart} onChange={(e) => setSStart(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">שעת סיום</label>
                  <input type="time" value={sEnd} onChange={(e) => setSEnd(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">קישור (אופציונלי)</label>
                <input value={sLink} onChange={(e) => setSLink(e.target.value)} dir="ltr" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="https://..." />
              </div>
              <button type="submit" disabled={sSubmitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
                {sSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>הוסף ללוח</span>
              </button>
            </form>
          )}

          {schedule.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-400">אין אירועים מתוכננים</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map((s) => {
                const cfg = SCHEDULE_TYPE_CONFIG[s.item_type];
                return (
                  <div key={s.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 text-center">
                      <p className="text-xs text-slate-400">{new Date(s.item_date).toLocaleDateString('he-IL', { month: 'short' })}</p>
                      <p className="text-2xl font-bold text-slate-900">{new Date(s.item_date).getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        <h3 className="font-semibold text-slate-900 truncate">{s.title}</h3>
                      </div>
                      {s.description && <p className="text-sm text-slate-600 mb-1">{s.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {s.start_time && (<span className="flex items-center gap-1"><Clock size={12} />{s.start_time}{s.end_time ? ` - ${s.end_time}` : ''}</span>)}
                        {s.link_url && (<a href={s.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><LinkIcon size={12} />קישור</a>)}
                      </div>
                    </div>
                    {isTeacher && (<button onClick={() => handleDeleteSchedule(s.id)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 size={16} /></button>)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
