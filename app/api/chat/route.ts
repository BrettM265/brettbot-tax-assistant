export const runtime = "edge";

import { NextResponse } from "next/server";
import OpenAI from "openai";
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

export async function POST(
  req: Request,
  context: { env: { OPENAI_API_KEY: string } }
) {
  try {
    const apiKey = context.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ ERROR: OPENAI_API_KEY missing in Cloudflare env");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    // Rate Limiting
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

    // Validate Input
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

    // OpenAI Request
    const response = await client.responses.create({
      model: AI_MODEL,
      input: userMessage,
      max_output_tokens: AI_SETTINGS.maxOutputTokens,
      temperature: AI_SETTINGS.temperature,
    });

    let text = "No response.";
    const first = response.output?.[0];

    if (first && "content" in first && Array.isArray(first.content)) {
      const chunk = first.content[0];
      if (chunk && "text" in chunk) text = chunk.text;
    }

    return NextResponse.json({ reply: text });
    } catch (error: any) {
      console.error("🔥 Server Runtime Error:", error?.message || error);
      return NextResponse.json(
        { error: "OpenAI request failed." },
        { status: 500 }
      );
    }
}
