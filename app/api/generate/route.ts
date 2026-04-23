import { NextResponse } from 'next/server';

export const maxDuration = 60;

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

interface RequestBody {
  amazonItems: AmazonItem[];
  etsyItems: EtsyItem[];
  textDesign: string;
  quantity: number;
  customerContext: string;
  coreEmotion: string;
  tone: string;
}

function sanitizeSEO(variant: ZazzleVariant): ZazzleVariant {
  const blacklist = ['shirt', 'shirts', 'tee', 'tees', 'apparel', 'clothing', 'accessory', 'accessories', 'mug', 'gift', 'gifts', 'present', 'presents', 'merchandise', 'custom', 'customize', 'customized', 'personalize', 'personalised', 'gear', 'create'];
  let cleanTitle = variant.newTitle; let cleanDesc = variant.newDescription;
  blacklist.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanTitle = cleanTitle.replace(regex, ''); cleanDesc = cleanDesc.replace(regex, 'design');
  });
  const rawTags = variant.newTags.split(',').map(t => t.trim().toLowerCase());
  const seenWords = new Set<string>(); const cleanTags: string[] = [];
  for (const tag of rawTags) {
    const words = tag.split(/\s+/); let isValidTag = true;
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (!cleanWord) continue;
      if (blacklist.includes(cleanWord) || seenWords.has(cleanWord)) { isValidTag = false; break; }
    }
    if (isValidTag && cleanTags.length < 10) {
      words.forEach(w => seenWords.add(w.replace(/[^a-z0-9]/g, ''))); cleanTags.push(tag);
    }
  }
  return { newTitle: cleanTitle.replace(/\s+/g, ' ').trim(), newDescription: cleanDesc.replace(/\s+/g, ' ').trim(), newTags: cleanTags.join(', ') };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Security Error: Missing GROQ_API_KEY.");

    const body = (await request.json()) as RequestBody;
    const { amazonItems, etsyItems, textDesign, quantity, customerContext, coreEmotion, tone } = body;

    const qty = Math.min(Math.max(1, quantity || 1), 5);
    const amazonDataStr = amazonItems.map((item, i) => `[Amazon ${i+1}] Title: ${item.title}\nDesc: ${item.description}`).join('\n\n');
    const etsyDataStr = etsyItems.map((item, i) => `[Etsy ${i+1}] Title: ${item.title}\nTags: ${item.tags}`).join('\n\n');

    const structuredInsight = `
    - Raw Customer Context: "${customerContext}"
    - Core Emotion: ${coreEmotion}
    - Tone of Voice: ${tone}
    `;

    const promptText = `
You are an elite E-commerce SEO Specialist and Direct-Response Copywriter for Zazzle.
Generate ${qty} highly optimized, DISTINCT listing variants based on the provided data.

[INPUT DATA]
- Text Design (Mandatory Prefix): "${textDesign}"
- Amazon Market Data: ${amazonDataStr}
- Etsy Market Data: ${etsyDataStr}
- Buyer Insight: ${structuredInsight}

[STRICT RULES]
1. TITLE: 
   - MUST begin EXACTLY with: "${textDesign}". Under 70 characters. Natural phrasing.

2. DESCRIPTION (SEO & CONVERSION MASTERCLASS): 
   - Length: Exactly 3 to 4 sentences. Paragraph format.
   - Front-loading SEO: The first sentence MUST include "${textDesign}" seamlessly.
   - Product Agnostic (CRITICAL): NEVER use "shirt", "mug", "sticker". ONLY use "this design", "this artwork", "this piece".
   - Copywriting Formula: Autonomously extract the Target Audience, Situation/Occasion, and Value Proposition from the "Raw Customer Context" provided. Weave these extracted elements together with the "Core Emotion" to explain the emotional benefit to the buyer. Match the requested "Tone of Voice".
   - Formatting: DO NOT wrap the description in quotes. No bullet points.

3. TAGS: 
   - Exactly 10 tags. Comma-separated, lowercase. Max 3 words per tag. ZERO REPEATED WORDS across all 10 tags.

4. DIVERSITY:
   - Each variant MUST target a different angle based on the market data.

5. FORBIDDEN WORDS:
   - shirt, shirts, tee, apparel, clothing, accessory, mug, gift, present, custom, personalized.

[OUTPUT FORMAT]
- Return ONLY a raw, valid JSON object. DO NOT include markdown \`\`\`json.
{ "variants": [ { "newTitle": "...", "newDescription": "...", "newTags": "..." } ] }
`;

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [ { role: "system", content: "You are a JSON-only engine." }, { role: "user", content: promptText } ],
      response_format: { type: "json_object" }, temperature: 0.7
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Groq API Error: ${await response.text()}`);
    const data = await response.json();
    let aiText = data.choices?.[0]?.message?.content || "";
    aiText = aiText.replace(/```json/gi, '').replace(/```/gi, '').trim();

    const parsed = JSON.parse(aiText);
    if (parsed.variants && Array.isArray(parsed.variants)) {
      parsed.variants = parsed.variants.slice(0, qty).map((v: ZazzleVariant) => sanitizeSEO(v));
      return NextResponse.json(parsed);
    }
    throw new Error("Invalid format received from AI.");

  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}