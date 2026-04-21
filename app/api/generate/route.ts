import { NextResponse } from 'next/server';

export const maxDuration = 60;

interface ZazzleVariant {
  newTitle: string;
  newDescription: string;
  newTags: string;
}

interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

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
    // CHỈ SỬ DỤNG BIẾN MÔI TRƯỜNG, TUYỆT ĐỐI KHÔNG HARDCODE KEY Ở ĐÂY NỮA
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Lỗi Bảo mật: Thiếu biến môi trường GROQ_API_KEY trên máy chủ Vercel.");

    const body = (await request.json()) as RequestBody;
    const { amazonItems, etsyItems, insightContext, textDesign, quantity } = body;

    const qty = Math.min(Math.max(1, quantity || 1), 5);
    const amazonDataStr = amazonItems.map((item, i) => `[Amazon ${i+1}] Title: ${item.title}\nDesc: ${item.description}`).join('\n\n');
    const etsyDataStr = etsyItems.map((item, i) => `[Etsy ${i+1}] Title: ${item.title}\nTags: ${item.tags}`).join('\n\n');

    const promptText = `
You are a Master-level Zazzle SEO Expert. Create optimized listings using provided data.

INPUT:
- Text Design (MUST be at the start of Title): "${textDesign}"
- Amazon Data: ${amazonDataStr}
- Etsy Data: ${etsyDataStr}
- Insight: ${insightContext}

RULES:
1. TITLE: MUST start with "${textDesign}". Structure: "${textDesign}" + [color/style] + [subject] + [audience]. 
2. DESCRIPTION: 3-5 sentences storytelling. No product types (shirt/mug).
3. TAGS: 10 tags per variant. ABSOLUTE rule: NO REPEATED WORDS across all 10 tags. 

FORBIDDEN: shirt, tee, clothing, gift, custom, personalize.

OUTPUT EXACTLY ${qty} VARIANTS. YOU MUST RETURN ONLY VALID JSON MATCHING THIS EXACT SCHEMA:
{
  "variants": [
    {
      "newTitle": "string",
      "newDescription": "string",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
    }
  ]
}`;

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a JSON-only API. You output JSON format only." },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API Error: ${err}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "";
    
    const parsed = JSON.parse(aiText);
    if (parsed.variants && Array.isArray(parsed.variants)) {
      parsed.variants = parsed.variants.slice(0, qty).map((v: ZazzleVariant) => sanitizeSEO(v));
      return NextResponse.json(parsed);
    }
    throw new Error("Invalid AI Output format");

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}