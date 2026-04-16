import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const { title, description, quantity } = await request.json();
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const prompt = `[SYSTEM]
You are an expert SEO copywriter for the Zazzle marketplace. Your task is to analyze an Amazon T-shirt listing (Title and Description) and rewrite it into a highly optimized Zazzle listing (Title, Description, and Tags) for a redesigned product with the same core design.

INSTRUCTIONS:
First, analyze the provided Amazon data to determine if the core design is primarily "Graphic-based" or "Text-based". Then, generate the new Title, Description, and Tags by STRICTLY adhering to the following Zazzle Guidelines. Do not omit any rules.

### ZAZZLE GUIDELINES ###

1. TITLES
Titles are a select group of keywords that thoroughly describe your design. Those keywords are what search algorithms use when determining if your product accurately matches what a customer is searching for. Ask yourself: “What keywords would a customer use when searching for a design like mine?" Maximize effectiveness by using keywords that describe the design's theme, color, specific design elements, and who the product may be intended for.

Structure based on your design type analysis:
- If Graphic-based design: [trait] [color] [style] [content] [design type]
  (Example: "Vintage Navy and Pink Watercolor Floral")
- If Text-based design: [full/partial phrase] [trait] [content] [color] [design type]
  (Example: "No Bad Days Funny Quote with Yellow Text")

Title Quality: Make sure the title is unique and keywords are relevant to one another. Do not stuff a bunch of non-relevant keywords (e.g., stuffing keywords like birthday/wedding/rsvp/graduation into the same title).
DO:
- DO use descriptive words that accurately describe your design and the theme, such as color or pattern.
- DO use keywords a customer would normally search for.
- DO use a unique title for each design.
DON'T:
- DON'T use a numbering scheme to distinguish similar designs.
- DON'T include the Product type within the title (e.g., do not use words like T-shirt, shirt, tee).
- DON'T use less than 3 words (or less than 20 characters).
- DON'T only use artistic/abstract naming conventions.
- DON'T only use keywords such as “Create Your Own”, “Design Your Own”, “Your Text Here”.
- DON'T use the same title more than once or copy another design's title.
- DON'T use special characters or any obscure (unicode) such as + ^ } ~

2. DESCRIPTION
Your design description is a great opportunity to let customers know the story behind your art, help them understand what makes your design unique, detail interesting use cases, and give customization tips. Write lengthy descriptions for Google to crawl and include relevant keywords.
DO:
- DO use at least 3 to 5 sentences (~300 characters) when forming your design description. Try to tell your 'story' behind the design.
- DO use human readable sentences; write for your customers, not for search engines.
- DO try to include related keywords that you’ve used in your title.
- DO use a unique description for each design. Unique content is key!
DON'T:
- DON'T leave your description empty or use phrases/ sentences that don't provide any additional information beyond your title.
- DON'T employ keyword stuffing or use repetitive keywords (e.g., using keywords too often, or using keywords not relevant to the design).
- DON'T use keywords not relevant to your design.
- DON'T repeat the same design description within your store or use copy from other stores. Include NO details about Amazon, shipping, or fabric.

3. TAGS
Tags help customers find your design. Ask yourself: if you were to look for your design, what would be the most common search terms?
Limit: You MUST provide exactly 10 tags. Individual tags require a minimum of 3 characters. Phrases can have a maximum of 5 words. Do not overuse phrase tags by inserting random words.
DO:
- DO build tags around phrases when it makes sense and give each phrase a maximum of five words.
- DO use keywords that are descriptive and specific to your design.
- DO repeat keywords in your title and use other related keywords that users may use to find the design.
DON'T:
- DON'T use product types as tags, unless they are relevant to your design.
- DON'T use tags or keywords that are irrelevant and have nothing to do with your design.
- DON'T use plural variations of keywords or employ keyword stuffing.
- DON'T repeat keywords across multiple tags.
- DON'T use the following restricted keywords: gear, custom, create, gifts, presents, gift idea, products, merchandise, personalize, personalized, personalizable, customize, customized, customizable, custom made, customise, customisable, customised, made to order, make your own, personal, personalised, personalise, personalisable.

[USER]
Here is the original Amazon data to process:
- Amazon Title: ${title}
- Amazon Description: ${description}

Task: Output ONLY a JSON object containing exactly ${qty} variant(s). The output MUST strictly follow this array structure:
{
  "variants": [
    {
      "newTitle": "Generated Title here",
      "newDescription": "Generated Description here",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
    }
  ]
}
Do not include any markdown formatting, explanations, or other text.`;

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