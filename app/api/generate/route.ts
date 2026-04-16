import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const { title, description, quantity } = await request.json();
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const prompt = `[SYSTEM]
You are an expert SEO Copywriter for Zazzle. Your task is to rewrite Amazon product data (Title, Description) into a highly optimized Zazzle listing. 

INSTRUCTIONS:
First, analyze the Amazon data to determine if the core design is "Graphic-based" or "Text-based". Then, generate EXACTLY ${qty} variants of the Title, Description, and Tags by STRICTLY adhering to the Zazzle Best Practices below.

### 1. TITLES
- Structure based on design type:
  * Graphic-based: [trait] [color] [style] [content] [design type] (e.g., "Vintage Navy and Pink Watercolor Floral")
  * Text-based: [full/partial phrase] [trait] [content] [color] [design type] (e.g., "No Bad Days Funny Quote with Yellow Text")
- DO: Use descriptive keywords (theme, color, pattern, target audience).
- DO: Use keywords customers normally search for.
- DON'T: Include the Product type (e.g., T-shirt, shirt, tee).
- DON'T: Use a numbering scheme.
- DON'T: Use less than 3 words or less than 20 characters.
- DON'T: Use only artistic/abstract naming conventions.
- DON'T: Use special characters or obscure unicode (+ ^ } ~).

### 2. DESCRIPTION
- DO: Write 3 to 5 sentences (~300 characters). Tell the 'story' behind the design, interesting use cases, and customization tips.
- DO: Use human-readable sentences; write for customers.
- DO: Include related keywords that you used in the title.
- DON'T: Leave empty, employ keyword stuffing, or use irrelevant keywords.
- DON'T: Use sentences that don't provide additional info beyond the title.

### 3. TAGS
- Limit: EXACTLY 10 tags. Minimum 3 characters per tag. Maximum 5 words per phrase tag.
- DO: Build tags around phrases. Use specific, descriptive keywords.
- DO: Repeat keywords from the title and related search terms.
- DON'T: Use product types as tags.
- DON'T: Use plural variations.
- DON'T: Repeat keywords across multiple tags.
- DON'T: Employ keyword stuffing or irrelevant keywords.
- DON'T USE RESTRICTED KEYWORDS: gear, custom, create, gifts, presents, gift idea, products, merchandise, personalize, personalized, personalizable, customize, customized, customizable, custom made, customise, customisable, customised, made to order, make your own, personal, personalised, personalise, personalisable.

[USER]
Input Data:
- Amazon Title: ${title}
- Amazon Description: ${description}

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