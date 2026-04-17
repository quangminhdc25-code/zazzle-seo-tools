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
3. KEYWORD INSPIRATION: Extract SEO keywords from these competitor titles, but DO NOT copy their structure: ${etsyTitles.join(' | ')}.
4. FOCUS: Base your content around Core Subject: "${coreSubject}", Audience: "${targetAudience}", Vibe: "${vibe}".

### 1. TITLES
- Structure: [trait] [color] [style] [content] [design type]
- DO: Use descriptive keywords. Core Subject must be the focal point.
- DON'T: Include Product types (e.g., T-shirt, shirt, tee, apparel). 
- DON'T: Use special characters (+ ^ } ~).

### 2. DESCRIPTION
- DO: Write 3 to 4 sentences. Tell the 'story' behind the design, mention the Core Subject, and use cases based on the Vibe.
- DO: Mention the exact "Text on Design" if provided.
- DON'T: Use product types (shirt, mug, accessory). Keep it as "design", "artwork", or "graphic".

### 3. TAGS
- Limit: EXACTLY 10 tags. Min 3 chars per tag. Max 5 words per phrase.
- CRITICAL DON'T: NEVER repeat the same word across multiple tags. Every single word must be unique.
- CRITICAL DON'T: NEVER use product types (shirt, tee, apparel, clothing, accessory).
- CRITICAL DON'T USE RESTRICTED KEYWORDS: gear, custom, create, gifts, presents, gift idea, products, merchandise, personalize, personalized, customize, customized.

OUTPUT FORMAT:
Output ONLY valid JSON. The JSON MUST exactly match this structure without markdown formatting:
{
  "variants": [
    {
      "newTitle": "Generated Title here",
      "newDescription": "Generated Description here",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
    }
  ]
}`;

    const messages: any[] = [
      {
        role: "user",
        content: [
          { type: "text", text: promptText }
        ]
      }
    ];

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
        model: "google/gemini-1.5-flash", // Model xịn, cực nhanh và thông minh
        messages: messages,
        temperature: 0.7
        // ĐÃ XÓA response_format để tránh lỗi 400 trên OpenRouter
      })
    });

    if (!response.ok) {
       const errorText = await response.text();
       return NextResponse.json({ error: `OpenRouter API Error (${response.status}): ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.error) {
       return NextResponse.json({ error: `AI Model Error: ${data.error.message || JSON.stringify(data.error)}` }, { status: 500 });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return NextResponse.json({ error: 'AI trả về dữ liệu rỗng. Vui lòng thử lại.' }, { status: 500 });
    }

    const responseText = data.choices[0].message.content;
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        if (parsedData.variants && parsedData.variants.length > 0) return NextResponse.json(parsedData);
        throw new Error("Lỗi cấu trúc Variants rỗng.");
    } catch (e: any) {
        return NextResponse.json({ error: `Lỗi parse JSON: ${e.message}. AI Output: ${responseText.substring(0, 50)}...` }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: `Lỗi hệ thống nội bộ: ${error.message}` }, { status: 500 });
  }
}