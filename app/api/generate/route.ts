import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const { title, description, quantity } = await request.json();
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const prompt = `Bạn là một Chuyên gia SEO Zazzle và Copywriter xuất sắc. User của bạn CHỈ BÁN DUY NHẤT SẢN PHẨM T-SHIRT.
    Dữ liệu gốc từ Amazon:
    - Title Amazon: ${title}
    - Description Amazon: ${description}

    NHIỆM VỤ: Tạo CHÍNH XÁC ${qty} BỘ (VARIANTS) nội dung khác nhau hoàn toàn.

    LOGIC LỌC TỪ KHÓA (QUYẾT ĐỊNH 70% THÀNH CÔNG):
    1. TỪ KHÓA VÀNG (BẮT BUỘC GIỮ LẠI): 
       - Bất kỳ câu quote, câu châm biếm, tiếng lóng (slang), hoặc cụm từ chơi chữ nào có trên áo (Ví dụ: F-Caw-F, Pew Pew, Ew People...). Tuyệt đối không được xóa hay sửa đổi chúng.
       - Chủ đề cốt lõi (Niche: ví dụ Black Crow, Cat).
    2. TỪ KHÓA RÁC (BẮT BUỘC XÓA SẠCH):
       - Các từ nhồi nhét của Amazon: "for men and women", "novelty", "apparel", "clothing", "premium", "fit", "graphic", "design".

    QUY TẮC TITLE (MAX 50 KÝ TỰ - KHÔNG ĐƯỢC VI PHẠM):
    - Cấu trúc ưu tiên: [Quote/Pun] + [Niche] + [T-Shirt hoặc Tee].
    - Vì giới hạn chỉ có 50 ký tự, hãy ưu tiên Quote và Niche. Bắt buộc phải có chữ "T-Shirt", "Shirt" hoặc "Tee" ở cuối. Lược bỏ bớt tính từ nếu quá dài.
    - Ví dụ chuẩn: "F-Caw-F Sarcastic Black Crow T-Shirt" (37 ký tự).

    QUY TẮC DESCRIPTION & TAGS:
    - Description: 150 ký tự đầu làm Meta Description chứa Main Keyword. Kể câu chuyện liên kết thiết kế với người mặc/người được tặng. Chốt bằng CTA mua áo.
    - Tags: 10 tags viết thường, cách nhau bằng dấu phẩy. Bắt buộc có các tag gắn chữ "shirt" hoặc "tee" (VD: funny crow shirt, f caw f tee) và các tag về audience (bird lover gift).

    ĐỊNH DẠNG ĐẦU RA JSON BẮT BUỘC:
    Trả về ĐÚNG cấu trúc JSON này, làm đủ ${qty} bộ:
    {
      "variants": [
        {
          "newTitle": "Max 50 chars Title",
          "newDescription": "SEO Description...",
          "newTags": "tag1, tag2..."
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
        "temperature": 0.8 
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) return NextResponse.json({ error: 'AI Error' }, { status: 500 });

    const responseText = data.choices[0].message.content;
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        if (parsedData.variants && parsedData.variants.length > 0) {
            return NextResponse.json(parsedData);
        }
        throw new Error("Mảng variants trống");
    } catch (e) {
        return NextResponse.json({ error: 'JSON Parse Error' }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}