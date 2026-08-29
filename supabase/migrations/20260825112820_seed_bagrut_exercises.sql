/*
# Seed 3 Bagrut Coding Exercises

Inserts 3 real Bagrut 5-unit style exercises:
1. Loops — Sum of digits (beginner)
2. Arrays — Find max and its index (intermediate)
3. OOP — Simple Student class (advanced)

Idempotent: uses ON CONFLICT DO NOTHING on title.
*/

INSERT INTO exercises (title, topic, difficulty, description, starter_code, solution_code, points)
VALUES
(
  'לולאות - סכום ספרות של מספר',
  'Loops',
  'beginner',
  'כתבו תוכנית המקבלת מספר שלם חיובי מהמשתמש. התוכנית תחשב ותדפיס את סכום הספרות של המספר.

דוגמה:
קלט: 1234
פלט: 10

הסבר: 1+2+3+4 = 10',
  $$using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("הכנס מספר:");
        int num = int.Parse(Console.ReadLine());
        
        // כתוב את הקוד שלך כאן
        
    }
}$$,
  $$using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("הכנס מספר:");
        int num = int.Parse(Console.ReadLine());
        
        int sum = 0;
        while (num > 0)
        {
            sum += num % 10;
            num /= 10;
        }
        
        Console.WriteLine("סכום הספרות: " + sum);
    }
}$$,
  15
)
ON CONFLICT DO NOTHING;

INSERT INTO exercises (title, topic, difficulty, description, starter_code, solution_code, points)
VALUES
(
  'מערכים - מציאת האיבר המקסימלי ומיקומו',
  'Arrays',
  'intermediate',
  'כתבו תוכנית המקבלת מהמשתמש N מספרים שלמים ומאחסנת אותם במערך. התוכנית תמצא ותדפיס את הערך המקסימלי במערך ואת האינדקס שלו.

דוגמה:
קלט: 5 3 8 1 9 2
פלט: הערך המקסימלי: 9, באינדקס: 4',
  $$using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("הכנס מספרים מופרדים ברווח:");
        string input = Console.ReadLine();
        string[] parts = input.Split(' ');
        int[] arr = new int[parts.Length];
        for (int i = 0; i < parts.Length; i++)
        {
            arr[i] = int.Parse(parts[i]);
        }
        
        // כתוב את הקוד שלך כאן - מצא את המקסימלי והאינדקס שלו
        
    }
}$$,
  $$using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("הכנס מספרים מופרדים ברווח:");
        string input = Console.ReadLine();
        string[] parts = input.Split(' ');
        int[] arr = new int[parts.Length];
        for (int i = 0; i < parts.Length; i++)
        {
            arr[i] = int.Parse(parts[i]);
        }
        
        int max = arr[0];
        int maxIndex = 0;
        for (int i = 1; i < arr.Length; i++)
        {
            if (arr[i] > max)
            {
                max = arr[i];
                maxIndex = i;
            }
        }
        
        Console.WriteLine($"הערך המקסימלי: {max}, באינדקס: {maxIndex}");
    }
}$$,
  20
)
ON CONFLICT DO NOTHING;

INSERT INTO exercises (title, topic, difficulty, description, starter_code, solution_code, points)
VALUES
(
  'מחלקות - מחלקת Student',
  'OOP',
  'advanced',
  'כתבו מחלקה בשם Student המייצגת תלמיד. המחלקה תכיל:
- שדות: שם (string), גיל (int), ציון (int)
- בנאי המקבל את שלושת הערכים
- מתודה IsPassing המחזירה true אם הציון מעל 60
- מתודה PrintDetails המדפיסה את פרטי התלמיד

בפונקציית Main צרו אובייקט מהמחלקה והדפיסו את פרטיו.',
  $$using System;

class Student
{
    // הגדר את השדות והמתודות כאן
    
}

class Program
{
    static void Main()
    {
        // צור אובייקט ובדוק את המתודות
        
    }
}$$,
  $$using System;

class Student
{
    private string name;
    private int age;
    private int grade;

    public Student(string name, int age, int grade)
    {
        this.name = name;
        this.age = age;
        this.grade = grade;
    }

    public bool IsPassing()
    {
        return grade > 60;
    }

    public void PrintDetails()
    {
        Console.WriteLine($"שם: {name}, גיל: {age}, ציון: {grade}, עבר: {IsPassing()}");
    }
}

class Program
{
    static void Main()
    {
        Student s = new Student("ישראל", 17, 85);
        s.PrintDetails();
    }
}$$,
  25
)
ON CONFLICT DO NOTHING;
