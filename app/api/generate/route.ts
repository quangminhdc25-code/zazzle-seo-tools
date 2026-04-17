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
    const joinedTitles = etsyTitles && etsyTitles.length > 0 ? etsyTitles.join(' | ') : 'None';

    const promptText = `[SYSTEM]
You are an expert SEO Copywriter for Zazzle. Your task is to analyze the provided design parameters (and image if provided) to create a highly optimized Zazzle listing.

INSTRUCTIONS:
1. TEXT ON DESIGN: CRITICAL! DO NOT attempt to read text from the image. Use ONLY the exact text provided here: "${textOnDesign || 'No text on design'}".
2. KEYWORD INSPIRATION: Extract SEO keywords from these competitor titles, but DO NOT copy their structure: ${joinedTitles}.
3. FOCUS: Base your content around Core Subject: "${coreSubject}", Audience: "${targetAudience}", Vibe: "${vibe}".

### 1. TITLES
- Structure: [trait] [color] [style] [content] [design type]
- DO: Use descriptive keywords. Core Subject must be the focal point.
- DON'T: Include Product types (e.g., T-shirt, shirt, tee, apparel). 

### 2. DESCRIPTION
- DO: Write 3 to 4 sentences. Tell the 'story' behind the design. Mention the Core Subject.
- DO: Mention the exact "Text on Design" if provided.
- DON'T: Use product types (shirt, mug, accessory). Use "design", "artwork", or "graphic".

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

    // Xử lý linh hoạt mảng Content để không bị lỗi 400
    let messageContent: any;
    
    if (imageBase64 && imageBase64.startsWith('data:image')) {
        messageContent = [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: imageBase64 } }
        ];
    } else {
        messageContent = promptText;
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
        model: "google/gemini-2.0-flash-exp:free", // Đã cập nhật Model ID chuẩn
        messages: [
            {
                role: "user",
                content: messageContent
            }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
       const errorText = await response.text();
       return NextResponse.json({ error: `Lỗi OpenRouter (${response.status}): ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
        return NextResponse.json({ error: 'AI trả về dữ liệu rỗng. Model có thể đang bảo trì.' }, { status: 500 });
    }

    const responseText = data.choices[0].message.content;
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        if (parsedData.variants) return NextResponse.json(parsedData);
        throw new Error("JSON thiếu key 'variants'");
    } catch (e: any) {
        return NextResponse.json({ error: `Lỗi Parse JSON: ${e.message}` }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: `Lỗi Backend: ${error.message}` }, { status: 500 });
  }
}