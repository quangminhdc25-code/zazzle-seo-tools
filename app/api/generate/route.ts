import { NextResponse } from 'next/server';

export const maxDuration = 60; // Giữ nguyên gia hạn thời gian

export async function POST(request: Request) {
  try {
    const { title, description, quantity } = await request.json();
    
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const prompt = `Bạn là một Chuyên gia SEO Thương mại điện tử bậc thầy cho Zazzle.
    Dữ liệu thô từ Amazon:
    - Title Amazon: ${title}
    - Description Amazon: ${description}

    NHIỆM VỤ QUAN TRỌNG: Bạn phải tạo ra CHÍNH XÁC ${qty} BỘ (VARIANTS) nội dung khác nhau hoàn toàn. Không được gộp, không được làm thiếu.

    Mỗi bộ (variant) phải tuân thủ:
    1. TITLE: 50 - 70 ký tự, Main Keyword lên đầu, viết Title Case.
    2. DESCRIPTION: 150 ký tự đầu chuẩn SEO Google, có storytelling cho đối tượng cụ thể và dịp lễ, kết thúc bằng CTA.
    3. TAGS: Đúng 10 tags chiến lược, phân cách bằng dấu phẩy, viết thường, không hashtag.

    ĐỊNH DẠNG ĐẦU RA BẮT BUỘC (JSON):
    Trả về duy nhất 1 object JSON có mảng 'variants' chứa đúng ${qty} phần tử bên trong. 
    Ví dụ nếu quantity là 2, bạn phải trả về:
    {
      "variants": [
        { "newTitle": "Bộ 1...", "newDescription": "Mô tả 1...", "newTags": "tag, bộ, 1..." },
        { "newTitle": "Bộ 2...", "newDescription": "Mô tả 2...", "newTags": "tag, bộ, 2..." }
      ]
    }
    Hãy làm đủ ${qty} bộ như cấu trúc trên.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/codespaces",
        "X-Title": "Zazzle SEO Professional Tool"
      },
      body: JSON.stringify({
        "model": "openrouter/free", // Hệ thống tự chọn model miễn phí tốt nhất
        "messages": [{ "role": "user", "content": prompt }],
        "temperature": 0.8 // Tăng độ sáng tạo để các bộ không bị trùng lặp nhau
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
        return NextResponse.json({ error: 'AI không phản hồi' }, { status: 500 });
    }

    const responseText = data.choices[0].message.content;
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        // Kiểm tra lại nếu AI vẫn "lười" trả về ít hơn yêu cầu
        if (parsedData.variants && parsedData.variants.length > 0) {
            return NextResponse.json(parsedData);
        }
        throw new Error("Mảng variants trống");
    } catch (parseError) {
        console.error("LỖI JSON:", responseText);
        return NextResponse.json({ error: 'AI trả về sai định dạng' }, { status: 500 });
    }

  } catch (error: any) {
    console.error("LỖI HỆ THỐNG:", error.message || error); 
    return NextResponse.json({ error: 'Lỗi xử lý dữ liệu' }, { status: 500 });
  }
}