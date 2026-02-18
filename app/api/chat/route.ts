export const runtime = "edge";

import { NextResponse } from "next/server";
import { AI_MODEL, AI_SETTINGS } from "@/lib/aiConfig";

// In-memory daily rate limit
const DAILY_LIMIT = 15;
const usageMap: Map<string, { count: number; resetAt: number }> = new Map();

function getUserKey(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return ip.split(",")[0].trim();
}

export async function POST(req: Request) {
  try {
    // Cloudflare provides env vars via process.env in Next.js builds
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing OPENAI_API_KEY in environment");
      return NextResponse.json(
        { error: "Server missing API key" },
        { status: 500 }
      );
    }

    // -----------------------------
    // RATE LIMITING
    // -----------------------------
    const userKey = getUserKey(req);
    const now = Date.now();
    const record = usageMap.get(userKey);

    if (!record || now > record.resetAt) {
      usageMap.set(userKey, {
        count: 1,
        resetAt: now + 24 * 60 * 60 * 1000,
      });
    } else {
      if (record.count >= DAILY_LIMIT) {
        return NextResponse.json(
          {
            reply: "⚠️ Daily usage limit reached. Please try again tomorrow.",
          },
          { status: 429 }
        );
      }

      record.count += 1;
      usageMap.set(userKey, record);
    }

    // -----------------------------
    // READ USER INPUT
    // -----------------------------
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

    // -----------------------------
    // CALL OPENAI (Edge-compatible fetch)
    // -----------------------------
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        input: userMessage,
        max_output_tokens: AI_SETTINGS.maxOutputTokens,
        temperature: AI_SETTINGS.temperature,
        stream: true,
      }),
    });

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text();
      console.error("❌ OpenAI error:", err);
      return NextResponse.json(
        { error: "OpenAI request failed" },
        { status: 500 }
      );
    }

return new Response(openaiResponse.body, {
  headers: {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  },
});

  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json(
      { error: "Server error processing request" },
      { status: 500 }
    );
  }
}
