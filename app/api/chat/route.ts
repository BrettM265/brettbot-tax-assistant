export const runtime = "edge";

import { NextResponse } from "next/server";
import { AI_MODEL, AI_SETTINGS } from "@/lib/aiConfig";

// In-memory daily rate limit
const DAILY_LIMIT = 15;
const usageMap: Map<string, { count: number; resetAt: number }> = new Map();

// Identify the user via IP so rate limits work
function getUserKey(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return ip.split(",")[0].trim();
}

// MAIN POST HANDLER
export async function POST(
  req: Request,
  ctx: { env: { OPENAI_API_KEY: string } }
) {
  try {
    // Cloudflare environment variable
    const apiKey = ctx.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing OPENAI_API_KEY in Cloudflare environment");
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    // RATE LIMITING
    const userKey = getUserKey(req);
    const now = Date.now();
    const record = usageMap.get(userKey);

    if (!record || now > record.resetAt) {
      usageMap.set(userKey, {
        count: 1,
        resetAt: now + 24 * 60 * 60 * 1000, // 24 hours
      });
    } else {
      if (record.count >= DAILY_LIMIT) {
        return NextResponse.json(
          { reply: "⚠️ Daily usage limit reached. Please try again tomorrow." },
          { status: 429 }
        );
      }
      record.count += 1;
      usageMap.set(userKey, record);
    }

    // READ USER MESSAGE
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    if (userMessage.length > 800) {
      return NextResponse.json(
        { error: "Message too long." },
        { status: 400 }
      );
    }

    // CALL OPENAI (Edge Compatible)
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        input: userMessage,
        max_output_tokens: AI_SETTINGS.maxOutputTokens,
        temperature: AI_SETTINGS.temperature,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("❌ OpenAI API Error:", errText);
      return NextResponse.json(
        { error: "OpenAI request failed" },
        { status: 500 }
      );
    }

    const data = await openaiResponse.json();

    // EXTRACT MODEL TEXT SAFELY

    let text = "No response.";

    try {
      const firstOutput = data.output?.[0];

      if (firstOutput?.content?.[0]?.text) {
        text = firstOutput.content[0].text;
      }
    } catch (err) {
      console.error("❌ Extracting OpenAI output failed:", err);
    }

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("❌ Chat Route Fatal Error:", error);
    return NextResponse.json(
      { error: "Server error processing request" },
      { status: 500 }
    );
  }
}
