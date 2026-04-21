import { NextResponse } from 'next/server';

export const maxDuration = 60;

interface ZazzleVariant {
  newTitle: string;
  newDescription: string;
  newTags: string;
}

interface AmazonItem {
  title: string;
  description: string;
}

interface EtsyItem {
  title: string;
  tags: string;
}

interface RequestBody {
  amazonItems: AmazonItem[];
  etsyItems: EtsyItem[];
  insightContext: string;
  textDesign: string;
  quantity: number;
}

function sanitizeSEO(variant: ZazzleVariant): ZazzleVariant {
  const blacklist = ['shirt', 'shirts', 'tee', 'tees', 'apparel', 'clothing', 'accessory', 'accessories', 'mug', 'gift', 'gifts', 'present', 'presents', 'merchandise', 'custom', 'customize', 'customized', 'personalize', 'personalised', 'gear', 'create'];
  
  let cleanTitle = variant.newTitle;
  let cleanDesc = variant.newDescription;
  
  blacklist.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanTitle = cleanTitle.replace(regex, '');
    cleanDesc = cleanDesc.replace(regex, 'design');
  });

  const rawTags = variant.newTags.split(',').map(t => t.trim().toLowerCase());
  const seenWords = new Set<string>();
  const cleanTags: string[] = [];

  for (const tag of rawTags) {
    const words = tag.split(/\s+/);
    let isValidTag = true;

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (!cleanWord) continue;
      if (blacklist.includes(cleanWord) || seenWords.has(cleanWord)) {
        isValidTag = false;
        break;
      }
    }

    if (isValidTag && cleanTags.length < 10) {
      words.forEach(w => seenWords.add(w.replace(/[^a-z0-9]/g, '')));
      cleanTags.push(tag);
    }
  }

  return {
    newTitle: cleanTitle.replace(/\s+/g, ' ').trim(),
    newDescription: cleanDesc.replace(/\s+/g, ' ').trim(),
    newTags: cleanTags.join(', ')
  };
}

export async function POST(request: Request) {
  try {
    // Tích hợp trực tiếp API Key của bạn
    const apiKey = process.env.OPENROUTER_API_KEY || "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";

    const body = (await request.json()) as RequestBody;
    const { amazonItems, etsyItems, insightContext, textDesign, quantity } = body;

    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const amazonDataStr = amazonItems.map((item, i) => `[Amazon Item ${i+1}]\nTitle: ${item.title}\nDescription: ${item.description}`).join('\n\n');
    const etsyDataStr = etsyItems.map((item, i) => `[Etsy Item ${i+1}]\nTitle: ${item.title}\nTags: ${item.tags}`).join('\n\n');

    const promptText = `
You are a Master-level SEO Copywriter specializing in Zazzle marketplace optimization.
Transform raw E-commerce data and Cultural Insight into highly optimized Zazzle listings.

RAW DATA INPUT:
---
[TEXT ON DESIGN]: "${textDesign || 'None'}"
---
[AMAZON DATA]: 
${amazonDataStr || 'None provided'}
---
[ETSY DATA]: 
${etsyDataStr || 'None provided'}
---
[CULTURAL/EMOTIONAL INSIGHT ARTICLE]: 
${insightContext || 'None provided'}
---

STEP 1: DESIGN CLASSIFICATION & KEYWORD EXTRACTION
Extract the core subject, style, mood, and target audience from the data. 
STRICTLY REMOVE: Brand names, sizing, materials (e.g., 100% cotton).

STEP 2: GENERATE VARIANTS
Generate EXACTLY ${qty} HIGH-QUALITY variants. Each must be meaningfully different in phrasing and emotional angle.

## 1. TITLES (SEO-CRITICAL)
- ABSOLUTE MANDATORY RULE: Every single title MUST begin with the exact Text on Design: "${textDesign}".
- Structure: "${textDesign}" + [color] + [style] + [content] + [audience/theme]
- DO NOT use keyword stuffing or special characters. DO NOT include product names.

## 3. DESCRIPTION (SEO + EMOTIONAL CONVERSION)
- Length: 3–5 sentences.
- Tell a story based on the cultural/emotional insight provided.
- Suggest real-life use cases. DO NOT repeat the exact title.

## 4. TAGS (DISCOVERABILITY ENGINE - STRICT ZERO-TOLERANCE RULES)
- Generate EXACTLY 10 tags per variant.
- Minimum 3 characters per tag. Maximum 5 words per tag.
- ABSOLUTE ZERO-TOLERANCE RULE: Every SINGLE WORD must be unique across all 10 tags. DO NOT reuse any word, even in different phrases.

STRICTLY FORBIDDEN KEYWORDS ACROSS ALL FIELDS:
shirt, shirts, tee, tees, apparel, clothing, accessory, mug, poster, gear, custom, create, gift, gifts, present, presents, gift idea, merchandise, personalize, personalized, customize, customized, custom made.

OUTPUT FORMAT
Output ONLY valid JSON. No markdown, no conversational text.
{
  "variants": [
    {
      "newTitle": "...",
      "newDescription": "...",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
    }
  ]
}`;

    // KIẾN TRÚC ROUTING TỰ ĐỘNG CỦA OPENROUTER (FALLBACK ARRAY)
    const openRouterPayload = {
      models: [
        "openai/gpt-oss-120b", // Lựa chọn 1 của bạn (Có rủi ro không tồn tại)
        "google/gemma-4-31b",  // Lựa chọn 2 của bạn (Có rủi ro không tồn tại)
        "google/gemma-2-9b-it:free", // Lưới an toàn số 1 (Model Free thực tế của Google trên OpenRouter)
        "meta-llama/llama-3.1-8b-instruct:free" // Lưới an toàn số 2 (Model Free thực tế của Meta trên OpenRouter)
      ],
      messages: [
        { role: "system", content: "You are a specialized JSON-only output engine. You must output raw JSON without markdown formatting." },
        { role: "user", content: promptText }
      ]
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://zazzleseo.com",
        "X-Title": "Zazzle SEO Tool"
      },
      body: JSON.stringify(openRouterPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API Error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "";
    
    // Xử lý chuỗi JSON an toàn
    const cleanJson = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanJson);
    if (parsedData.variants && Array.isArray(parsedData.variants)) {
      parsedData.variants = parsedData.variants.map((v: ZazzleVariant) => sanitizeSEO(v));
      return NextResponse.json(parsedData);
    }
    
    throw new Error("Cấu trúc JSON từ AI không hợp lệ.");

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống không xác định";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}