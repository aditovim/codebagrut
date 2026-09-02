export const TOPICS = [
  'Basics',
  'Variables',
  'Conditionals',
  'Loops',
  'Arrays',
  'Strings',
  'Methods',
  'Recursion',
  'OOP',
];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'קל',
  intermediate: 'בינוני',
  advanced: 'קשה',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};
