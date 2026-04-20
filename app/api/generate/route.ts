import { NextResponse } from 'next/server';

export const maxDuration = 60;

// 1. Định nghĩa Interfaces để triệt tiêu lỗi TypeScript "any"
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

// Middleware: Cào dữ liệu từ tiêu đề Etsy (Xử lý lỗi chặn server)
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

// Middleware: Lọc sạch từ khóa cấm và trùng lặp (Zero-Tolerance)
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
    if (!apiKey) throw new Error("Thiếu biến môi trường GOOGLE_AI_STUDIO_API_KEY");

    const body = (await request.json()) as RequestBody;
    const { imageBase64, textOnDesign, etsyInput, coreSubject, targetAudience, vibe } = body;

    const etsyKeywords = await scrapeEtsyTitle(etsyInput || '');

    const promptText = `Bạn là chuyên gia SEO Zazzle chuyên nghiệp. Hãy tạo nội dung niêm yết dựa trên:
    - Text trên áo: "${textOnDesign || 'Không có'}"
    - Keyword từ Etsy: "${etsyKeywords}"
    - Chủ thể cốt lõi: "${coreSubject}"
    - Đối tượng: "${targetAudience || 'General'}"
    - Vibe: "${vibe || 'Modern'}"

    QUY TẮC BẮT BUỘC:
    1. TITLE: [trait] [color] [style] [content] [design type]. CẤM từ sản phẩm (shirt, mug).
    2. DESCRIPTION: 3-4 câu kể chuyện. CẤM từ sản phẩm.
    3. TAGS: Tạo 15 tags. KHÔNG lặp từ. KHÔNG dùng từ sản phẩm.

    TRẢ VỀ ĐỊNH DẠNG JSON:
    {
      "variants": [
        {
          "newTitle": "...",
          "newDescription": "...",
          "newTags": "tag1, tag2, tag3, ..."
        }
      ]
    }`;

    // Cấu trúc Payload cho Google Gemini API
    const contents = [{
      parts: [{ text: promptText }]
    }];

    if (imageBase64 && imageBase64.includes('base64,')) {
      const [header, data] = imageBase64.split('base64,');
      const mimeType = header.split(':')[1].split(';')[0];
      contents[0].parts.push({
        inline_data: { mime_type: mimeType, data: data }
      } as any);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google API Error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanJson);
    if (parsedData.variants && Array.isArray(parsedData.variants)) {
      parsedData.variants = parsedData.variants.map((v: ZazzleVariant) => sanitizeSEO(v));
      return NextResponse.json(parsedData);
    }
    
    throw new Error("Cấu trúc JSON từ AI không hợp lệ.");

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}