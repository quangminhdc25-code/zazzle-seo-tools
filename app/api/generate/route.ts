import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const { title, description, quantity } = await request.json();
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const prompt = `Bạn là một Chuyên gia SEO Thương mại điện tử bậc thầy cho Zazzle, chuyên về tối ưu hóa tỷ lệ nhấp chuột (CTR).
    Dữ liệu thô từ Amazon:
    - Title Amazon: ${title}
    - Description Amazon: ${description}

    NHIỆM VỤ: Tạo CHÍNH XÁC ${qty} BỘ nội dung chuẩn SEO Zazzle.

    QUY TẮC TIÊU ĐỀ (TITLE) CỰC GẮT:
    - ĐỘ DÀI: Tối đa 50 ký tự (Kể cả khoảng trắng). Tuyệt đối không được vượt quá.
    - CÔNG THỨC: [Main Keyword chính] + [Tính từ đắt giá/Cảm xúc].
    - YÊU CẦU: Phải hiển thị trọn vẹn thông điệp quan trọng nhất trong 50 ký tự đầu. Loại bỏ mọi từ thừa như "t-shirt", "apparel", "gift for".
    - Ví dụ tốt: "Funny Sarcastic Cat Retro Design" (32 ký tự).

    QUY TẮC MÔ TẢ & TAGS:
    - Description: 150 ký tự đầu chuẩn SEO Google, chứa Main Keyword, có CTA.
    - Tags: Đúng 10 tags chiến lược, viết thường, không hashtag.

    ĐỊNH DẠNG ĐẦU RA JSON BẮT BUỘC:
    {
      "variants": [
        {
          "newTitle": "Max 50 chars title",
          "newDescription": "SEO description...",
          "newTags": "tag1, tag2..."
        }
      ]
    }
    Hãy tạo đúng ${qty} bộ khác nhau hoàn toàn.`;

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
        "temperature": 0.8 
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) return NextResponse.json({ error: 'AI Error' }, { status: 500 });

    const responseText = data.choices[0].message.content;
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        return NextResponse.json(parsedData);
    } catch (e) {
        return NextResponse.json({ error: 'JSON Parse Error' }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}