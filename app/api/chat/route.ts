export const runtime = "edge";

import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { AI_MODEL, AI_SETTINGS } from "@/lib/aiConfig";

// In-memory daily rate limit
const DAILY_LIMIT = 15;
const usageMap: Map<string, { count: number; resetAt: number }> = new Map();

// get IP
function getUserKey(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return ip.split(",")[0].trim();
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ ERROR: Missing OPENAI_API_KEY in environment.");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });

    // RATE LIMITING
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
          { reply: "⚠️ Daily usage limit reached. Try again tomorrow." },
          { status: 429 }
        );
      }

      record.count += 1;
      usageMap.set(userKey, record);
    }

    // READ BODY
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // LENGTH CHECK
    if (userMessage.length > 800) {
      return NextResponse.json({ error: "Message too long." }, { status: 400 });
    }

    // OPENAI CALL
    const response = await client.responses.create({
      model: AI_MODEL,
      input: userMessage,
      max_output_tokens: AI_SETTINGS.maxOutputTokens,
      temperature: AI_SETTINGS.temperature,
    });

    const firstOutput = response.output?.[0];
    let text = "No response.";

    if (firstOutput && "content" in firstOutput && Array.isArray(firstOutput.content)) {
      const chunk = firstOutput.content[0];
      if (chunk && "text" in chunk) text = chunk.text;
    }

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("🔥 Server Error:", error?.message || error);
    return NextResponse.json({ error: "OpenAI request failed" }, { status: 500 });
  }
}
