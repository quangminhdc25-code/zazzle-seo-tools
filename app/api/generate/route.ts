import { NextResponse } from 'next/server';

export const maxDuration = 60;

// 1. Interfaces Chuẩn TypeScript
interface ZazzleVariant {
  newTitle: string;
  newDescription: string;
  newTags: string;
}

interface RequestBody {
  amazonData: string;
  etsyData: string;
  insightContext: string;
}

// 2. Middleware: Lọc sạch rác SEO và trùng lặp Tags (Zero-Tolerance)
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

    // Lấy tối đa 10 tags hợp lệ
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
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) throw new Error("Thiếu biến môi trường GOOGLE_AI_STUDIO_API_KEY");

    const body = (await request.json()) as RequestBody;
    const { amazonData, etsyData, insightContext } = body;

    if (!amazonData && !etsyData && !insightContext) {
       throw new Error("Phải cung cấp ít nhất một nguồn dữ liệu (Amazon, Etsy, hoặc Insight).");
    }

    const promptText = `[SYSTEM]
You are a Master-level SEO Copywriter specializing in Zazzle marketplace optimization.
Your task is to transform raw E-commerce data and Cultural Insight into highly optimized Zazzle listings designed for search visibility, uniqueness, and emotional conversion.

RAW DATA INPUT:
---
[AMAZON DATA (Titles/Descriptions)]: 
${amazonData || 'None provided'}
---
[ETSY DATA (Titles/Tags)]: 
${etsyData || 'None provided'}
---
[CULTURAL/EMOTIONAL INSIGHT ARTICLE]: 
${insightContext || 'None provided'}
---

STEP 1: DESIGN CLASSIFICATION
Analyze the input and classify the intent into ONE:
- "Graphic-based" → visual elements (illustration, pattern, artwork)
- "Text-based" → quote, phrase, typography-driven design

STEP 2: KEYWORD & INSIGHT EXTRACTION
Extract the core subject, style, mood, and target audience. 
STRICTLY REMOVE: Brand names, sizing, materials (e.g., 100% cotton), and product SKUs.

STEP 3: GENERATE HIGH-QUALITY VARIANTS
CRITICAL: Generate EXACTLY 1 variant. It MUST be highly emotional and search intent-driven based on the Cultural Insight.

## 1. TITLES (SEO-CRITICAL)
- Graphic-based structure: [primary keyword] [color] [style] [content] [audience or theme]
- Text-based structure: [phrase/quote] [tone] [topic] [audience or theme]
RULES: Minimum 3 words. Most important keywords first. DO NOT use keyword stuffing or special characters.

## 2. DESCRIPTION (SEO + EMOTIONAL CONVERSION)
- Length: 3–5 sentences.
- Tell a story based on the cultural/emotional insight provided.
- Suggest real-life use cases (e.g., perfect for a weekend hike, ideal for a baby shower).
- DO NOT repeat the exact title. Make it natural and conversational.

## 3. TAGS (DISCOVERABILITY ENGINE - STRICT ZERO-TOLERANCE RULES)
- Generate EXACTLY 10 tags.
- Minimum 3 characters per tag. Maximum 5 words per tag.
- ABSOLUTE ZERO-TOLERANCE RULE: Every SINGLE WORD must be unique across all 10 tags. DO NOT reuse any word, even in different phrases. (If you use "funny cat", you CANNOT use "cat mom").

STRICTLY FORBIDDEN KEYWORDS ACROSS ALL FIELDS (TITLE, DESC, TAGS):
shirt, shirts, tee, tees, apparel, clothing, accessory, mug, poster, gear, custom, create, gift, gifts, present, presents, gift idea, merchandise, personalize, personalized, customize, customized, custom made.

OUTPUT FORMAT
Output ONLY valid JSON. No explanations. No markdown.
{
  "variants": [
    {
      "newTitle": "...",
      "newDescription": "...",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
    }
  ]
}`;

    // Gọi API thế hệ mới nhất: Gemini 2.5 Pro
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google API Error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanJson);
    if (parsedData.variants && Array.isArray(parsedData.variants)) {
      parsedData.variants = parsedData.variants.map((v: ZazzleVariant) => sanitizeSEO(v));
      return NextResponse.json(parsedData);
    }
    
    throw new Error("Cấu trúc JSON từ AI không hợp lệ.");

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}