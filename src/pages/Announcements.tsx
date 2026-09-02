import { useEffect, useState } from 'react';
import { Megaphone, CircleAlert as AlertCircle, Link as LinkIcon, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatSubmissionDate } from '@/lib/ai';
import type { Announcement } from '@/types';

export default function Announcements() {
  const { profile, effectiveRole } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements((data ?? []) as Announcement[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error: insertError } = await supabase.from('announcements').insert({
      title,
      content,
      type: 'announcement',
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setTitle('');
    setContent('');
    setShowForm(false);
    loadAnnouncements();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    loadAnnouncements();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">טוען...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">עדכונים</h1>
            <p className="mt-1 text-sm text-slate-500">הודעות ועדכונים חשובים</p>
          </div>
          {effectiveRole === 'teacher' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {showForm ? 'ביטול' : 'פרסם עדכון'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="כותרת"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-blue-500 mb-3"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="תוכן העדכון"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-blue-500 mb-3 min-h-[100px] resize-none"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              פרסם
            </button>
          </form>
        )}

        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Megaphone className="mx-auto text-slate-300" size={48} />
            <p className="mt-4 text-slate-500">אין עדכונים כרגע</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="text-blue-600" size={18} />
                    <h3 className="font-bold text-slate-900">{ann.title}</h3>
                  </div>
                  {effectiveRole === 'teacher' && (
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      מחק
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{ann.content}</p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{formatSubmissionDate(ann.created_at)}</span>
                  {ann.due_date && (
                    <span className="flex items-center gap-1 text-xs text-orange-600">
                      <Calendar size={12} />
                      {formatSubmissionDate(ann.due_date)}
                    </span>
                  )}
                  {ann.link_url && (
                    <a href={ann.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <LinkIcon size={12} />
                      קישור
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
