import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    // 1. Nhận 3 biến đầu vào theo Ma trận Parametric Input thay vì Amazon data
    const { coreSubject, targetAudience, vibe, quantity } = await request.json();
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    // Bắt lỗi nếu thiếu dữ liệu đầu vào quan trọng
    if (!coreSubject) {
      return NextResponse.json({ error: 'Vui lòng nhập Chủ thể cốt lõi (Core Subject)' }, { status: 400 });
    }

    const prompt = `[SYSTEM]
You are an expert SEO Copywriter for Zazzle. Your task is to create a highly optimized Zazzle listing based on specific design parameters provided by the user.

INSTRUCTIONS:
Generate EXACTLY ${qty} variant(s) of the Title, Description, and Tags by STRICTLY adhering to the Zazzle Best Practices below. Focus the content entirely around the provided Core Subject, Target Audience, and Vibe/Theme.

### 1. TITLES
- Structure based on design type:
  * Graphic-based: [trait] [color] [style] [content] [design type]
  * Text-based: [full/partial phrase] [trait] [content] [color] [design type]
- DO: Use descriptive keywords (theme, color, pattern, target audience). Make sure the Core Subject is the focal point.
- DO: Use keywords customers normally search for.
- DON'T: Include the Product type (e.g., T-shirt, shirt, tee, apparel).
- DON'T: Use a numbering scheme.
- DON'T: Use less than 3 words or less than 20 characters.
- DON'T: Use special characters (+ ^ } ~).

### 2. DESCRIPTION
- DO: Write 3 to 5 sentences (~300 characters). Tell the 'story' behind the design, mention the Core Subject and Target Audience clearly, give interesting use cases based on the Vibe/Theme, and customization tips.
- DO: Use human-readable sentences; write for customers.
- DO: Include related keywords used in the title.
- DON'T: Leave empty, employ keyword stuffing, or use irrelevant keywords.

### 3. TAGS
- Limit: EXACTLY 10 tags. Minimum 3 characters per tag. Maximum 5 words per phrase tag.
- DO: Build tags around phrases. Use specific, descriptive keywords (color, theme, holiday, audience).
- CRITICAL DON'T (ZERO TOLERANCE): NEVER repeat the same word across multiple tags. Every single word must be unique across all 10 tags.
- CRITICAL DON'T: NEVER use product types (e.g., shirt, tee, apparel, clothing).
- CRITICAL DON'T USE RESTRICTED KEYWORDS: gear, custom, create, gifts, presents, gift idea, products, merchandise, personalize, personalized, personalizable, customize, customized, customizable, custom made, customise, customisable, customised, made to order, make your own, personal, personalised, personalise, personalisable.

[USER]
Design Parameters:
- Core Subject (What is the artwork?): ${coreSubject}
- Target Audience (Who is it for?): ${targetAudience || 'General / Anyone'}
- Vibe / Theme / Occasion (What is the style or event?): ${vibe || 'Everyday wear / Casual'}

OUTPUT FORMAT:
Output ONLY a JSON object containing exactly ${qty} variant(s). NO markdown, NO extra text. The JSON MUST exactly match this structure:
{
  "variants": [
    {
      "newTitle": "Generated Title here",
      "newDescription": "Generated Description here",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
    }
  ]
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/codespaces",
        "X-Title": "Zazzle SEO Pro"
      },
      body: JSON.stringify({
        "model": "openrouter/free",
        "messages": [{ "role": "user", "content": prompt }],
        "temperature": 0.7 
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