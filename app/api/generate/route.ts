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
  textDesign: string;
  quantity: number;
  targetAudience: string;
  coreEmotion: string;
  situation: string;
  tone: string;
  valueProp: string;
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
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Security Error: Missing GROQ_API_KEY.");

    const body = (await request.json()) as RequestBody;
    const { amazonItems, etsyItems, textDesign, quantity, targetAudience, coreEmotion, situation, tone, valueProp } = body;

    const qty = Math.min(Math.max(1, quantity || 1), 5);
    const amazonDataStr = amazonItems.map((item, i) => `[Amazon ${i+1}] Title: ${item.title}\nDesc: ${item.description}`).join('\n\n');
    const etsyDataStr = etsyItems.map((item, i) => `[Etsy ${i+1}] Title: ${item.title}\nTags: ${item.tags}`).join('\n\n');

    // STRUCTURED INSIGHT INTEGRATION
    const structuredInsight = `
    - Target Audience: ${targetAudience}
    - Core Emotion: ${coreEmotion}
    - Situation/Occasion: ${situation || 'Everyday lifestyle'}
    - Tone of Voice: ${tone}
    - Unique Value Proposition: ${valueProp || 'Premium design'}
    `;

    const promptText = `
You are an elite E-commerce SEO Specialist and Expert Copywriter for Zazzle.
Generate ${qty} highly optimized, DISTINCT listing variants based on the provided data.

[INPUT DATA]
- Text Design (Mandatory Prefix): "${textDesign}"
- Amazon Market Data: ${amazonDataStr}
- Etsy Market Data: ${etsyDataStr}
- Structured Buyer Insight: ${structuredInsight}

[STRICT RULES]
1. TITLE: 
   - MUST begin EXACTLY with: "${textDesign}".
   - Length: Under 70 characters. Must sound natural and human-written (NO machine keyword stuffing).

2. DESCRIPTION: 
   - Length: 3 to 5 sentences.
   - Style: Engaging storytelling. You MUST weave the Target Audience and Core Emotion from the "Structured Buyer Insight" into the text. Match the requested Tone.
   - Focus: Explicitly highlight the emotional value and the specified situation/occasion.
   - Formatting: DO NOT wrap the description in quotes.

3. TAGS: 
   - Quantity: EXACTLY 10 tags per variant.
   - Format: comma-separated, strictly lowercase. Maximum 3 words per tag.
   - SEO RULE: ZERO REPEATED WORDS across all 10 tags. Maximize vocabulary for broad search coverage.

4. VARIATION DIVERSITY:
   - Each variant MUST target a completely different search intent or angle based on the provided market data.

5. FORBIDDEN WORDS:
   - DO NOT USE: shirt, shirts, tee, tees, apparel, clothing, accessory, accessories, mug, gift, gifts, present, custom, customize, personalized, personalize.

[OUTPUT FORMAT]
- Return ONLY a raw, valid JSON object. 
- CRITICAL: DO NOT include markdown formatting like \`\`\`json or \`\`\`. No explanations.
- Exact Structure:
{ "variants": [ { "newTitle": "...", "newDescription": "...", "newTags": "..." } ] }
`;

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a JSON-only engine." },
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
    let aiText = data.choices?.[0]?.message?.content || "";
    
    // Safety Fallback for LLMs that ignore the "No Markdown" rule
    aiText = aiText.replace(/```json/gi, '').replace(/```/gi, '').trim();

    const parsed = JSON.parse(aiText);
    if (parsed.variants && Array.isArray(parsed.variants)) {
      parsed.variants = parsed.variants.slice(0, qty).map((v: ZazzleVariant) => sanitizeSEO(v));
      return NextResponse.json(parsed);
    }
    throw new Error("Invalid format received from AI.");

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}