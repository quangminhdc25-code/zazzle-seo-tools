import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {import { NextResponse } from 'next/server';

export const maxDuration = 60; // Timeout 60s cho phép Scraping và Fallback Model

// Hàm cào Title Etsy (Dùng Regex thuần, không cần cài thêm thư viện để tránh lỗi)
async function scrapeEtsyTitle(url: string) {
  try {
    if (!url.includes('etsy.com')) return url; // Nếu người dùng nhập text bình thường thì trả về text
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    const match = html.match(/<title>(.*?)<\/title>/);
    return match && match[1] ? match[1].replace(' - Etsy', '').trim() : url;
  } catch (e) {
    return url; // Nếu bị chặn, dùng tạm URL/Text đó làm nguyên liệu luôn
  }
}

// Middleware: Lớp kiểm duyệt SEO (Chặt chẽ tuyệt đối)
function sanitizeSEO(variant: any) {
  const blacklist = ['shirt', 'shirts', 'tee', 'tees', 'apparel', 'clothing', 'accessory', 'accessories', 'mug', 'gift', 'gifts', 'present', 'presents', 'merchandise', 'custom', 'customize', 'customized', 'personalize', 'personalised', 'gear', 'create'];
  
  // Dọn dẹp Title & Description
  let cleanTitle = variant.newTitle;
  let cleanDesc = variant.newDescription;
  blacklist.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanTitle = cleanTitle.replace(regex, '');
    cleanDesc = cleanDesc.replace(regex, 'design'); // Thay từ cấm bằng từ 'design' an toàn
  });

  // Thuật toán lọc Tags: Đảm bảo KHÔNG LẶP TỪ và LOẠI BỎ TỪ CẤM
  const rawTags = variant.newTags.split(',').map((t: string) => t.trim().toLowerCase());
  const seenWords = new Set<string>();
  const cleanTags: string[] = [];

  for (let tag of rawTags) {
    const words = tag.split(/\s+/);
    let isValidTag = true;

    for (let word of words) {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (!cleanWord) continue;
      // Bỏ tag nếu chứa từ cấm hoặc từ đã từng xuất hiện
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
    const body = await request.json();
    const { imageBase64, textOnDesign, etsyInput, coreSubject, targetAudience, vibe, quantity } = body;
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    // Xử lý Input: Cào dữ liệu Etsy tự động
    const etsyKeywords = await scrapeEtsyTitle(etsyInput || '');

    // Yêu cầu AI sinh ra 15 tags để lớp Middleware có "vốn" lọc xuống còn 10 tags
    const promptText = `[SYSTEM] You are a Zazzle SEO Expert.
    INPUTS:
    - Text on Design: "${textOnDesign || 'None'}" (DO NOT read image text, use ONLY this).
    - Etsy Inspiration: "${etsyKeywords}" (Extract intent, ignore product types).
    - Core Subject: "${coreSubject}"
    - Audience: "${targetAudience}"
    - Vibe: "${vibe}"

    RULES:
    1. TITLE: [trait] [color] [style] [content] [design type]. NO product names (shirt, mug).
    2. DESC: 3-4 sentences. Story-driven. Mention Core Subject. NO product names.
    3. TAGS: Generate EXACTLY 15 tags. Every single word MUST be unique across all tags. NO repeated words. NO product names.

    OUTPUT ONLY JSON:
    {
      "variants": [
        {
          "newTitle": "...",
          "newDescription": "...",
          "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12, tag13, tag14, tag15"
        }
      ]
    }`;

    let messageContent: any = imageBase64 && imageBase64.startsWith('data:image') 
        ? [{ type: "text", text: promptText }, { type: "image_url", image_url: { url: imageBase64 } }]
        : promptText;

    // Cơ chế Auto-Fallback (Thử Gemini trước, Llama sau)
    const modelsToTry = ["google/gemini-1.5-flash", "meta-llama/llama-3.2-11b-vision-instruct:free"];
    let aiResponseText = null;
    let lastError = null;

    for (const modelId of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/codespaces",
            "X-Title": "Zazzle SEO Pro"
          },
          body: JSON.stringify({ model: modelId, messages: [{ role: "user", content: messageContent }], temperature: 0.7 })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices.length > 0) {
            aiResponseText = data.choices[0].message.content;
            break; // Thành công thì thoát vòng lặp
          }
        } else {
            lastError = await response.text();
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!aiResponseText) {
      return NextResponse.json({ error: `Tất cả Model đều thất bại. Lỗi cuối: ${lastError}` }, { status: 500 });
    }

    const cleanJson = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);
    
    // Đưa kết quả qua lớp Middleware Kiểm duyệt (Sanitization)
    if (parsedData.variants) {
        parsedData.variants = parsedData.variants.map((v: any) => sanitizeSEO(v));
        return NextResponse.json(parsedData);
    }
    
    throw new Error("JSON thiếu variants");
  } catch (error: any) {
    return NextResponse.json({ error: `Lỗi Hệ Thống: ${error.message}` }, { status: 500 });
  }
}
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