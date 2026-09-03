import { useState, type FormEvent } from 'react';
import { ArrowRight, RotateCcw, Sparkles, Bold, Italic, Underline, Heading2, Code, Link2, Image, List, FileCode, Info, Loader, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Paperclip, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DIFFICULTY_LABELS } from '@/lib/constants';
import type { Exercise } from '@/types';

type Tab = 'details' | 'examples' | 'helpers' | 'files';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Props {
  onBack: () => void;
  onCreated: (exercise: Exercise) => void;
}

const languages = ['C#', 'Python', 'JavaScript', 'Java', 'C++'];

export default function ExerciseCreationForm({ onBack, onCreated }: Props) {
  const { profile } = useAuth();

  // Sidebar fields
  const [batchMode, setBatchMode] = useState(false);
  const [topics, setTopics] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [author, setAuthor] = useState(profile?.full_name ?? profile?.email ?? '');

  // Main content fields
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('C#');
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [details, setDetails] = useState('');
  const [examples, setExamples] = useState('');
  const [helpers, setHelpers] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [solutionCode, setSolutionCode] = useState('');
  const [testCases, setTestCases] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDetails('');
    setExamples('');
    setHelpers('');
    setStarterCode('');
    setSolutionCode('');
    setTestCases('');
    setTopics('');
    setDifficulty('beginner');
    setAttachmentFile(null);
    setAttachmentName('');
    setError(null);
    setSuccess(false);
    setActiveTab('details');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      setError('נא למלא את שם התרגיל ופירוט התרגיל');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Upload attachment if one was selected
    let attachmentUrl: string | null = null;
    if (attachmentFile) {
      const ext = attachmentFile.name.split('.').pop() ?? 'file';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      setUploadingFile(true);
      const { error: uploadError } = await supabase.storage
        .from('exercise-attachments')
        .upload(fileName, attachmentFile);
      setUploadingFile(false);

      if (uploadError) {
        setSubmitting(false);
        setError('שגיאה בהעלאת הקובץ: ' + uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('exercise-attachments')
        .getPublicUrl(fileName);
      attachmentUrl = urlData.publicUrl;
    }

    const topicList = topics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { data, error: insertError } = await supabase
      .from('exercises')
      .insert({
        title: title.trim(),
        topic: topicList[0] ?? 'General',
        difficulty,
        description: details,
        starter_code: starterCode,
        solution_code: solutionCode,
        test_cases: testCases,
        points: 10,
        tags: topicList,
        attachment_url: attachmentUrl,
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onCreated(data as Exercise);
    }, 1200);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: 'פירוט התרגיל' },
    { key: 'examples', label: 'דוגמאות' },
    { key: 'helpers', label: 'עזרים נוספים' },
    { key: 'files', label: 'קבצים מצורפים' },
  ];

  const toolbarButtons = [
    { icon: Bold, action: () => document.execCommand('bold') },
    { icon: Italic, action: () => document.execCommand('italic') },
    { icon: Underline, action: () => document.execCommand('underline') },
    { icon: Heading2, action: () => document.execCommand('formatBlock', false, 'h2') },
    { icon: Code, action: () => document.execCommand('formatBlock', false, 'pre') },
    { icon: List, action: () => document.execCommand('insertUnorderedList') },
    { icon: Link2, action: () => {
      const url = prompt('הכנס קישור:');
      if (url) document.execCommand('createLink', false, url);
    }},
    { icon: Image, action: () => {
      const url = prompt('הכנס כתובת תמונה:');
      if (url) document.execCommand('insertImage', false, url);
    }},
  ];

  const onEditorRef = (el: HTMLDivElement | null, field: Tab) => {
    if (el && el.innerText !== (field === 'details' ? details : field === 'examples' ? examples : helpers)) {
      // sync initial content only on mount
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Top header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowRight size={20} />
              <span className="text-sm font-medium hidden sm:inline">חזרה</span>
            </button>
            <h1 className="text-xl font-bold text-slate-900">יצירת תרגיל חדש</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">איפוס</span>
            </button>
            <button
              form="exercise-form"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {submitting || uploadingFile ? <Loader size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>{uploadingFile ? 'מעלה קובץ...' : submitting ? 'יוצר...' : 'יצירה'}</span>
            </button>
          </div>
        </div>
      </div>

      <form id="exercise-form" onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            <CheckCircle2 size={18} />
            <span>התרגיל נוצר בהצלחה!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* ===== SIDEBAR ===== */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="space-y-4">
                {/* Batch mode */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchMode}
                    onChange={(e) => setBatchMode(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">יצירת תרגילים ברצף</span>
                </label>

                {/* Topics */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">נושאים בתרגיל</label>
                  <input
                    type="text"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="Loops, Arrays, Methods"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">מופרדים בפסיק</p>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">רמת קושי</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  >
                    <option value="beginner">{DIFFICULTY_LABELS.beginner}</option>
                    <option value="intermediate">{DIFFICULTY_LABELS.intermediate}</option>
                    <option value="advanced">{DIFFICULTY_LABELS.advanced}</option>
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">מחבר/ת תרגיל</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="שם המחבר/ת"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* AI Info card */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">הערכת AI</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    הערכת ה-AI מתבססת על תיאור הבעיה שתכתוב בפירוט התרגיל.
                    ככל שהתיאור מפורט יותר, כך הבדיקה תהיה מדויקת יותר.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <div className="space-y-5">
            {/* Title + Language */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">שם התרגיל*</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="לולאות - סכום ספרות"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  />
                </div>
                <div className="sm:w-48">
                  <label className="block text-sm font-medium text-slate-700 mb-1">שפת תכנות</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors whitespace-nowrap"
                    >
                      <Sparkles size={14} />
                      <span>יצירה עם AI</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed editor */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-100 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5">
                {/* Details tab — rich text editor */}
                {activeTab === 'details' && (
                  <div>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 mb-3 pb-3 border-b border-slate-100 flex-wrap">
                      {toolbarButtons.map((btn, i) => {
                        const Icon = btn.icon;
                        return (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); btn.action(); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                    <div
                      ref={(el) => onEditorRef(el, 'details')}
                      contentEditable
                      onInput={(e) => setDetails((e.target as HTMLDivElement).innerText)}
                      className="min-h-[200px] p-4 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm leading-relaxed"
                      data-placeholder="כאן יש לכתוב הוראות לתרגיל..."
                      dir="rtl"
                    />
                  </div>
                )}

                {/* Examples tab */}
                {activeTab === 'examples' && (
                  <textarea
                    value={examples}
                    onChange={(e) => setExamples(e.target.value)}
                    rows={10}
                    dir="rtl"
                    placeholder="דוגמה:\n\nקלט: 123\nפלט: 6\n\nקלט: 0\nפלט: 0"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm leading-relaxed resize-y"
                  />
                )}

                {/* Helpers tab */}
                {activeTab === 'helpers' && (
                  <textarea
                    value={helpers}
                    onChange={(e) => setHelpers(e.target.value)}
                    rows={10}
                    dir="rtl"
                    placeholder="רמזים, נוסחאות או קישורים נוספים שיעזרו לתלמיד..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm leading-relaxed resize-y"
                  />
                )}

                {/* Files tab — code editors + attachment */}
                {activeTab === 'files' && (
                  <div className="space-y-4">
                    {/* Reference file attachment */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">חומר עזר מצורף (PDF / תמונה)</label>
                      <p className="text-xs text-slate-400 mb-2">ניתן לצרף קובץ PDF או תמונה שיהיה זמין לתלמידים בזמן פתרון התרגיל</p>
                      {attachmentFile ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <Paperclip className="text-blue-600 flex-shrink-0" size={18} />
                          <span className="text-sm text-slate-700 flex-1 truncate">{attachmentName}</span>
                          <button
                            type="button"
                            onClick={() => { setAttachmentFile(null); setAttachmentName(''); }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 cursor-pointer transition-colors">
                          <Paperclip className="text-slate-400" size={18} />
                          <span className="text-sm text-slate-500">לחץ לבחירת קובץ</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setAttachmentFile(f);
                                setAttachmentName(f.name);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">קוד התחלתי</label>
                      <textarea
                        value={starterCode}
                        onChange={(e) => setStarterCode(e.target.value)}
                        rows={6}
                        dir="ltr"
                        placeholder="// Starter code..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">קוד פתרון</label>
                      <textarea
                        value={solutionCode}
                        onChange={(e) => setSolutionCode(e.target.value)}
                        rows={6}
                        dir="ltr"
                        placeholder="// Solution..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">בדיקות אוטומטיות</label>
                      <textarea
                        value={testCases}
                        onChange={(e) => setTestCases(e.target.value)}
                        rows={4}
                        dir="ltr"
                        placeholder="Input: 123 -> Output: 6"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono resize-y"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom action */}
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FileCode size={16} />
                  <span>עריכת קבצים בתרגיל</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
