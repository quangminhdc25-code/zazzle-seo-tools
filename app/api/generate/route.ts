import { NextResponse } from 'next/server';

export const maxDuration = 60;

// --- Định nghĩa Interface chuẩn Strict TypeScript ---
interface ZazzleVariant {
  newTitle: string;
  newDescription: string;
  newTags: string;
}

interface RequestBody {
  imageBase64?: string;
  textOnDesign?: string;
  etsyInput?: string;
  coreSubject: string;
  targetAudience?: string;
  vibe?: string;
  quantity?: number;
}

// --- Middleware: Tự động cào Title từ Etsy URL ---
async function scrapeEtsyTitle(url: string): Promise<string> {
  try {
    if (!url.includes('etsy.com')) return url;
    const res = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      },
      next: { revalidate: 3600 }
    });
    const html = await res.text();
    const match = html.match(/<title>(.*?)<\/title>/);
    return match && match[1] ? match[1].replace(' - Etsy', '').trim() : url;
  } catch (e: unknown) {
    return url;
  }
}

// --- Middleware: Lọc trùng lặp Tags và từ cấm (Zero Tolerance) ---
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
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) throw new Error("Thiếu API Key trong Environment Variables.");

    const body = (await request.json()) as RequestBody;
    const { imageBase64, textOnDesign, etsyInput, coreSubject, targetAudience, vibe } = body;

    const etsyKeywords = await scrapeEtsyTitle(etsyInput || '');

    const promptText = `Bạn là chuyên gia SEO Zazzle. Hãy phân tích dữ liệu sau:
    - Chữ trên thiết kế: "${textOnDesign || 'Không có'}"
    - Cảm hứng từ Etsy: "${etsyKeywords}"
    - Chủ thể chính: "${coreSubject}"
    - Đối tượng: "${targetAudience || 'Mọi người'}"
    - Phong cách: "${vibe || 'Hàng ngày'}"

    YÊU CẦU NGHIÊM NGẶT:
    1. TITLE: Cấu trúc [trait] [color] [style] [content] [design type]. KHÔNG dùng tên sản phẩm (shirt, mug).
    2. DESCRIPTION: 3-4 câu kể chuyện. KHÔNG dùng tên sản phẩm.
    3. TAGS: Tạo 15 tags. Mỗi từ chỉ xuất hiện DUY NHẤT 1 lần trong toàn bộ các tags. KHÔNG lặp từ. KHÔNG dùng tên sản phẩm.

    TRẢ VỀ JSON DUY NHẤT:
    {
      "variants": [
        {
          "newTitle": "...",
          "newDescription": "...",
          "newTags": "tag1, tag2, tag3, ..."
        }
      ]
    }`;

    // Cấu trúc Payload cho Google AI Studio (Gemini 1.5 Flash)
    const geminiPayload: any = {
      contents: [{
        parts: [{ text: promptText }]
      }]
    };

    if (imageBase64 && imageBase64.includes('base64,')) {
      const base64Data = imageBase64.split(',')[1];
      const mimeType = imageBase64.split(';')[0].split(':')[1];
      geminiPayload.contents[0].parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google API Error: ${err}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanJson);
    if (parsedData.variants && Array.isArray(parsedData.variants)) {
      parsedData.variants = parsedData.variants.map((v: ZazzleVariant) => sanitizeSEO(v));
      return NextResponse.json(parsedData);
    }
    
    throw new Error("Dữ liệu AI không đúng định dạng JSON variants.");

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Lỗi hệ thống không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}