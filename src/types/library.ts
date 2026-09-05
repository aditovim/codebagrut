export interface ExercisePart {
  label: string;
  prompt: string;
  code: string;
  explanation: string;
}

export interface LibraryExercise {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  summary: string;
  parts: ExercisePart[];
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  exercises: LibraryExercise[];
}

export interface ExerciseLibraryData {
  categories: ExerciseCategory[];
}
