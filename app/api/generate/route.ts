import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      imageBase64, 
      textOnDesign, 
      etsyTitles, 
      coreSubject, 
      targetAudience, 
      vibe, 
      quantity 
    } = body;

    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const promptText = `[SYSTEM]
You are an expert SEO Copywriter for Zazzle. Your task is to analyze the provided design image and parameters to create a highly optimized Zazzle listing.

INSTRUCTIONS:
1. IMAGE ANALYSIS: Look at the provided image to understand the visual style, theme, and colors.
2. TEXT ON DESIGN: CRITICAL! DO NOT attempt to read text from the image itself. Use ONLY the exact text provided here: "${textOnDesign || 'No text on design'}".
3. KEYWORD INSPIRATION: Extract powerful SEO keywords from these competitor titles, but DO NOT copy their exact structure: ${etsyTitles.join(' | ')}.
4. FOCUS: Base your content around Core Subject: "${coreSubject}", Audience: "${targetAudience}", Vibe: "${vibe}".

### 1. TITLES
- Structure: [trait] [color] [style] [content] [design type] (e.g., Patriotic Red White Blue Messy Bun Graphic)
- DO: Use descriptive keywords. Make sure the Core Subject is the focal point.
- DON'T: Include Product types (e.g., T-shirt, shirt, tee, apparel). 
- DON'T: Use special characters (+ ^ } ~).

### 2. DESCRIPTION
- DO: Write 3 to 4 sentences. Tell the 'story' behind the design, mention the Core Subject, and use cases based on the Vibe.
- DO: Mention the exact "Text on Design" if provided.
- DON'T: Use product types (shirt, mug, accessory, etc.). Keep it as a "design", "artwork", or "graphic".

### 3. TAGS
- Limit: EXACTLY 10 tags. Min 3 chars per tag. Max 5 words per phrase.
- CRITICAL DON'T (ZERO TOLERANCE): NEVER repeat the same word across multiple tags. Every single word must be unique.
- CRITICAL DON'T: NEVER use product types (shirt, tee, apparel, clothing, accessory).
- CRITICAL DON'T USE RESTRICTED KEYWORDS: gear, custom, create, gifts, presents, gift idea, products, merchandise, personalize, personalized, customize, customized.

OUTPUT FORMAT:
Output ONLY a JSON object containing exactly ${qty} variant(s). NO markdown.
{
  "variants": [
    {
      "newTitle": "...",
      "newDescription": "...",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
    }
  ]
}`;

    // Cấu trúc message cho Vision Model
    const messages: any[] = [
      {
        role: "user",
        content: [
          { type: "text", text: promptText }
        ]
      }
    ];

    // Nếu có ảnh, đính kèm ảnh vào cho AI
    if (imageBase64) {
      messages[0].content.push({
        type: "image_url",
        image_url: { url: imageBase64 }
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/codespaces",
        "X-Title": "Zazzle SEO Pro"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-11b-vision-instruct:free", // Dùng Llama Vision của Meta
        messages: messages,
        temperature: 0.7 
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) return NextResponse.json({ error: 'AI Error' }, { status: 500 });

    const responseText = data.choices[0].message.content;
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        if (parsedData.variants && parsedData.variants.length > 0) return NextResponse.json(parsedData);
        throw new Error("Empty variants");
    } catch (e) {
        return NextResponse.json({ error: 'JSON Parse Error' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}