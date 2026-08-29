export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  title: string;
  topic: string;
  difficulty: ExerciseDifficulty;
  description: string;
  starter_code: string;
  solution_code: string;
  test_cases: string;
  points: number;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  exercise_id: string;
  code: string;
  grade: number;
  feedback: string;
  status: 'pending' | 'graded' | 'failed';
  created_at: string;
}

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher';
  created_at: string;
}

export interface BagrutQuestion {
  id: string;
  title: string;
  year: number;
  semester: 'a' | 'b';
  exam_code: string;
  topic: string;
  tags: string[];
  difficulty: ExerciseDifficulty;
  practice_type: 'class' | 'homework' | 'exam';
  points: number;
  description: string;
  starter_code: string;
  solution_code: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'assignment' | 'exam';
  link_url: string | null;
  due_date: string | null;
  created_at: string;
}

export interface ScheduleItem {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  item_date: string;
  start_time: string | null;
  end_time: string | null;
  item_type: 'lesson' | 'exam' | 'deadline' | 'event';
  link_url: string | null;
  created_at: string;
}

export interface ExamSession {
  id: string;
  student_id: string;
  started_at: string;
  ends_at: string;
  duration_minutes: number;
  status: 'in_progress' | 'submitted';
  total_score: number | null;
  created_at: string;
}

export interface ExamAnswer {
  id: string;
  exam_session_id: string;
  exercise_id: string;
  code_submitted: string;
  score: number | null;
  ai_feedback: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  teacher_id: string;
  exercise_id: string;
  assigned_to: string;
  student_id: string | null;
  due_date: string;
  created_at: string;
}
