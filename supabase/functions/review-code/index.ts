import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RATE_LIMIT_PER_HOUR = 20;
const RATE_LIMIT_WINDOW_MINUTES = 60;
const FUNCTION_NAME = "review-code";

const GEMINI_MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `אתה בודק תרגילי תכנות במדעי המחשב ברמת בגרות תיכונית בישראל (C#).
תקבל את כותרת התרגיל, תיאור הדרישות, הנושא, ואת הקוד שהתלמיד כתב.

בדוק ברצינות האם הקוד באמת פותר את הבעיה שתוארה - שגיאות תחביר, שגיאות לוגיקה, טיפול במקרי קצה.
אל תיתן ציון גבוה רק כי יש מילות מפתח מתאימות בקוד - בדוק את הלוגיקה בפועל.

החזר אך ורק JSON תקין (ללא markdown, ללא טקסט נוסף) במבנה המדויק הבא:
{
  "grade": מספר שלם בין 0 ל-100,
  "feedback": "משוב מפורט בעברית: מה טוב, מה לשפר, עד 150 מילים",
  "status": "graded" אם grade >= 60, אחרת "failed"
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { Authorization: `Bearer ${supabaseServiceRoleKey}` } },
    });

    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await adminClient
      .from("ai_usage_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if (count !== null && count >= RATE_LIMIT_PER_HOUR) {
      return new Response(
        JSON.stringify({
          error: "הגעת למגבלת השימוש השעתית ב-AI, נסה שוב בעוד כמה דקות",
          rate_limited: true,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await adminClient.from("ai_usage_log").insert({
      user_id: user.id,
      function_name: FUNCTION_NAME,
    });

    // --- Real AI grading via Google Gemini (free tier) ---
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server. Run: supabase secrets set GEMINI_API_KEY=..." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { code, exerciseTitle, exerciseDescription, topic } = await req.json();

    const userMessage = `כותרת התרגיל: ${exerciseTitle}
נושא: ${topic}

תיאור הדרישות:
${exerciseDescription}

הקוד שהתלמיד כתב:
\`\`\`csharp
${code}
\`\`\``;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 900 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${geminiRes.status}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText: string =
      geminiData.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let result: { grade: number; feedback: string; status: "graded" | "failed" };
    try {
      const parsed = JSON.parse(cleaned);
      result = {
        grade: Number(parsed.grade) || 0,
        feedback: String(parsed.feedback ?? ""),
        status: parsed.status === "graded" ? "graded" : "failed",
      };
    } catch {
      result = {
        grade: 0,
        feedback: "לא ניתן היה לנתח את תשובת ה-AI. נסה/י שוב.",
        status: "failed",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
