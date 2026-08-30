import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RATE_LIMIT_PER_HOUR = 20;
const RATE_LIMIT_WINDOW_MINUTES = 60;
const FUNCTION_NAME = "ai-tutor";

const GEMINI_MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `אתה מנטור AI ידידותי וסבלני המלווה תלמידי תיכון בהכנה לבגרות במדעי המחשב (C#).
ענה תמיד בעברית, בקצרה ובבהירות. עודד חשיבה עצמאית: כשתלמיד תקוע, הדרך אותו בשאלות מנחות
ובכיוונים, אך אל תיתן לו את התשובה/הפתרון המלא - אלא אם הוא מבקש זאת באופן מפורש וברור.`;

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

    // --- Real AI reply via Google Gemini (free tier) ---
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server. Run: supabase secrets set GEMINI_API_KEY=..." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, exerciseTitle, exerciseDescription, studentCode } = await req.json();

    const userMessage = `תרגיל: ${exerciseTitle}

תיאור: ${exerciseDescription}

הקוד הנוכחי של התלמיד:
\`\`\`csharp
${studentCode ?? ""}
\`\`\`

שאלת התלמיד: ${message}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 500 },
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
    const replyText: string =
      geminiData.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

    return new Response(JSON.stringify({ reply: replyText || "לא התקבלה תשובה מהמנטור." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
