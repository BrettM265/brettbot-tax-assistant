// In-memory daily rate limit
const DAILY_LIMIT = 10;
const usageMap = new Map<
  string,
  { count: number; resetAt: number }
>();


import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AI_MODEL, AI_SETTINGS } from "@/lib/aiConfig";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getUserKey(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return ip.split(",")[0].trim();
}


export async function POST(req: Request) {
  
  try {
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
    {
      reply: "⚠️ Daily usage limit reached. Please try again tomorrow.",
    },
    { status: 429 }
  );
}

      record.count += 1;
      usageMap.set(userKey, record);
    }
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // hard user cap
    if (userMessage.length > 800) {
      return NextResponse.json(
        { error: "Message too long." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: AI_MODEL, // model lock from config
      input: userMessage,
      max_output_tokens: AI_SETTINGS.maxOutputTokens,
      temperature: AI_SETTINGS.temperature,
    });

    const text =
      response.output?.[0]?.content?.[0]?.text || "No response.";

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: "OpenAI request failed" },
      { status: 500 }
    );
  }
}
