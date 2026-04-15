import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const { title, description, quantity } = await request.json();
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const prompt = `Bạn là một Chuyên gia SEO Thực chiến & Tối ưu Chuyển đổi (CRO) hàng đầu trên Zazzle. Khách hàng của bạn CHỈ BÁN ÁO T-SHIRT.
    Dữ liệu thô từ Amazon:
    - Title Amazon: ${title}
    - Description Amazon: ${description}

    NHIỆM VỤ: Tạo CHÍNH XÁC ${qty} BỘ (VARIANTS) nội dung. 

    HỆ TƯ DUY TỐI THƯỢNG (HIERARCHY OF PRIORITY):
    Khi lựa chọn từ khóa, bạn PHẢI tuân thủ thứ tự ưu tiên sinh tử sau:
    1. SEARCH KEYWORD (Từ khóa khách thực sự gõ: Quote, Niche chính, Long-tail search).
    2. BUYER INTENT / AUDIENCE (Từ khóa ý định mua/tặng quà: Gift for..., occasion).
    3. VISUAL (Mô tả hình ảnh: Moon, forest, crow).
    4. CREATIVE (Từ ngữ hoa mỹ, tính từ: Beautiful, stunning - HẠN CHẾ TỐI ĐA).

    QUY TẮC TITLE (Tối đa 50 ký tự - Tối ưu Search & Click):
    - KHÔNG được viết kiểu miêu tả. Phải viết kiểu nhắm mục tiêu tìm kiếm.
    - Cấu trúc bắt buộc: [Primary Search Keyword / Quote] + [Secondary KW / Buyer Intent / Niche] + [T-Shirt hoặc Tee].
    - Tận dụng tối đa không gian 50 ký tự để nhồi từ khóa có volume, tuyệt đối không dùng tính từ vô thưởng vô phạt. 
    - Ví dụ chuẩn: "Dark Fantasy Raven Gothic Gift T-Shirt" (38 ký tự).

    QUY TẮC DESCRIPTION (Tối ưu Conversion & Keyword Density):
    - CẤU TRÚC 3 PHẦN RÕ RÀNG:
      + Đoạn 1 (Hook SEO - 150 ký tự đầu): Mật độ từ khóa cao. Bắt buộc chứa Primary Search Keyword + 1 Long-tail Keyword. Phải thể hiện rõ Buyer Intent ngay câu đầu.
      + Đoạn 2 (Audience & Occasion): Ép ý định mua hàng. Chỉ định rõ áo này tặng cho ai (Audience) và mặc dịp nào (Occasion).
      + Đoạn 3 (CTA): Kêu gọi hành động mạnh mẽ, dứt khoát.

    QUY TẮC TAGS (Chiến lược 10 slot cực gắt):
    - Trả về đúng 10 tags, viết thường, cách nhau bằng dấu phẩy.
    - BẮT BUỘC CÓ:
      + Ít nhất 3 Long-tail tags (Gồm 3-4 chữ, ví dụ: gothic raven moon tee).
      + Ít nhất 2 Buyer intent / Audience tags (ví dụ: dark fantasy lover gift, gothic aesthetic present).
    - LỆNH CẤM: Tuyệt đối CẤM dùng các tag chung chung yếu ớt, vô nghĩa (như: shirt, design, funny, black, beautiful, art). 
    - Bắt buộc phải có chữ "shirt" hoặc "tee" đi kèm trong ít nhất 5 tags.

    ĐỊNH DẠNG ĐẦU RA JSON BẮT BUỘC:
    {
      "variants": [
        {
          "newTitle": "Max 50 chars Search Intent Title",
          "newDescription": "SEO Structured Description...",
          "newTags": "tag1, tag2, tag3..."
        }
      ]
    }
    Hãy làm đủ ${qty} bộ khác biệt nhau theo chuẩn cấu trúc trên.`;

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