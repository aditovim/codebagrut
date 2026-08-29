/*
# Seed Bagrut Archive Questions

Inserts sample archived Bagrut questions across years, topics, and practice types.
Idempotent via ON CONFLICT DO NOTHING.
*/

INSERT INTO bagrut_questions (title, year, semester, exam_code, topic, tags, difficulty, practice_type, points, description) VALUES
('סכום ספרות במספר', 2023, 'a', '271', 'Loops', ARRAY['loops','while','digits'], 'beginner', 'class', 15, 'כתוב תוכנית המקבלת מספר ומדפיסה את סכום ספרותיו'),
('מציאת מקסימלי במערך', 2023, 'a', '271', 'Arrays', ARRAY['arrays','max','loop'], 'beginner', 'homework', 15, 'כתוב תוכנית המוצאת את האיבר המקסימלי במערך'),
('מיון בועות', 2022, 'b', '271', 'Arrays', ARRAY['arrays','sorting','bubble-sort','nested-loops'], 'intermediate', 'class', 20, 'ממש אלגוריתם מיון בועות על מערך'),
('מחלקת מעגל', 2022, 'b', '371', 'OOP', ARRAY['oop','class','constructor','methods'], 'intermediate', 'homework', 20, 'כתוב מחלקה המייצגת מעגל עם חישוב שטח והיקף'),
('עץ בינארי - סריקת inorder', 2021, 'a', '371', 'Trees', ARRAY['binary-tree','recursion','inorder','traversal'], 'advanced', 'exam', 25, 'ממש סריקת inorder רקורסיבית על עץ בינארי'),
('רשימה מקושרת - הוספת צומת', 2021, 'a', '371', 'Linked Lists', ARRAY['linked-list','nodes','pointers'], 'advanced', 'exam', 25, 'ממש הוספת צומת לסוף רשימה מקושרת'),
('פלינדרום - בדיקת מחרוזת', 2023, 'b', '271', 'Strings', ARRAY['strings','palindrome','loop'], 'intermediate', 'class', 15, 'כתוב תוכנית הבודקת האם מחרוזת היא פלינדרום'),
('סדרת פיבונאצי רקורסיבית', 2022, 'a', '371', 'Recursion', ARRAY['recursion','fibonacci','base-case'], 'advanced', 'homework', 25, 'ממש את סדרת פיבונאצי בצורה רקורסיבית'),
('מחלקת סטודנט - ניהול ציונים', 2021, 'b', '371', 'OOP', ARRAY['oop','class','arrays','methods'], 'advanced', 'exam', 25, 'כתוב מחלקת Student עם ניהול מערך ציונים וחישוב ממוצע'),
('מעבר על מערך דו-ממדי', 2020, 'a', '271', 'Arrays', ARRAY['arrays','2d','matrix','nested-loops'], 'intermediate', 'class', 20, 'כתוב תוכנית המחשבת את סכום האלכסון במטריצה')
ON CONFLICT DO NOTHING;
