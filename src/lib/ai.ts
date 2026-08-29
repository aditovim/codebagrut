import { supabase } from '@/lib/supabase';

/**
 * Calls to review-code and ai-tutor Edge Functions.
 *
 * IMPORTANT FIX: the previous version sent VITE_SUPABASE_ANON_KEY as the
 * Authorization header. The Edge Functions use that header to identify
 * *which user* is calling (via supabase.auth.getUser()) for auth checks and
 * per-user rate limiting - the anon key does not represent a signed-in user,
 * so every call would likely have failed with 401 Unauthorized in practice.
 * We now fetch the current user's real session access token instead.
 */
async function getAuthHeader(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('לא מחובר/ת - יש להתחבר מחדש');
  }
  return `Bearer ${token}`;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export interface ReviewResult {
  grade: number;
  feedback: string;
  status: 'graded' | 'failed';
}

export async function reviewCode(
  code: string,
  exerciseTitle: string,
  exerciseDescription: string,
  topic: string,
): Promise<ReviewResult> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ code, exerciseTitle, exerciseDescription, topic }),
  });

  if (res.status === 429) {
    const data = await res.json().catch(() => null);
    throw new RateLimitError(data?.error ?? 'הגעת למגבלת השימוש השעתית ב-AI, נסה שוב בעוד כמה דקות');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? 'שגיאה בבדיקת הקוד, נסה שוב');
  }

  const data = await res.json();
  return {
    grade: data.grade,
    feedback: data.feedback,
    status: data.status,
  };
}

export async function askTutor(
  message: string,
  exerciseTitle: string,
  exerciseDescription: string,
  studentCode: string,
): Promise<string> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ message, exerciseTitle, exerciseDescription, studentCode }),
  });

  if (res.status === 429) {
    const data = await res.json().catch(() => null);
    throw new RateLimitError(data?.error ?? 'הגעת למגבלת השימוש השעתית ב-AI, נסה שוב בעוד כמה דקות');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? 'שגיאה בתקשורת עם המנטור, נסה שוב');
  }

  const data = await res.json();
  return data.reply ?? 'לא התקבלה תשובה מהמנטור.';
}

export function formatSubmissionDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getGradeColor(grade: number): string {
  if (grade >= 90) return 'text-green-600';
  if (grade >= 70) return 'text-yellow-600';
  if (grade >= 60) return 'text-orange-600';
  return 'text-red-600';
}
