import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, description, quantity } = await request.json();
    
    // Giới hạn an toàn từ 1 đến 5 để tránh quá tải AI hoặc timeout server
    const qty = Math.min(Math.max(1, quantity || 1), 5);

    const prompt = `Bạn là một Chuyên gia SEO Thương mại điện tử bậc thầy cho Zazzle.
    Dữ liệu thô từ Amazon:
    - Title Amazon: ${title}
    - Description Amazon: ${description}

    NHIỆM VỤ: Lột xác dữ liệu lộn xộn trên thành CHÍNH XÁC ${qty} BỘ NỘI DUNG HOÀN TOÀN KHÁC NHAU (về từ vựng, cấu trúc câu, chiến lược từ khóa) nhưng đều phải chuẩn SEO 100/100 cho Zazzle.
    Tuân thủ NGHIÊM NGẶT các quy tắc sau cho từng bộ:

    1. TITLE:
    - Lọc bỏ rác nhồi nhét.
    - Độ dài: 50 - 70 ký tự.
    - Cấu trúc: [Main Keyword] + [Tính từ] + [Loại sản phẩm]. (Main keyword đặt lên đầu). Viết Title Case.

    2. DESCRIPTION:
    - ~150 ký tự đầu làm SEO Mồi chứa Main Keyword thật tự nhiên.
    - Phân tích đối tượng tặng quà và dịp lễ, đưa trực tiếp vào văn bản.
    - Chốt bằng Call To Action.

    3. TAGS:
    - CHÍNH XÁC 10 tags phân cách bằng dấu phẩy. Viết thường, KHÔNG có hashtag.
    - Phải có ít nhất 1 tag Primary, 2 tags Long-tail, 2 tags Audience (gift for...), 1 tag Buyer Intent, 1 tag Occasion.

    ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
    Chỉ trả về ĐÚNG 1 cấu trúc JSON chứa mảng 'variants' như sau, tuyệt đối không có markdown hay bất kỳ văn bản nào khác:
    {
      "variants": [
        {
          "newTitle": "...",
          "newDescription": "...",
          "newTags": "..."
        }
        // ... tạo đủ ${qty} bộ theo cấu trúc này
      ]
    }`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/codespaces",
        "X-Title": "Zazzle SEO Professional Tool"
      },
      body: JSON.stringify({
        "model": "openrouter/free",
        "messages": [{ "role": "user", "content": prompt }],
        "temperature": 0.7 // Tăng nhẹ để AI sáng tạo ra các bộ khác biệt nhau hơn
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
        console.error("LỖI TỪ OPENROUTER:", data);
        return NextResponse.json({ error: 'AI không phản hồi' }, { status: 500 });
    }

    const responseText = data.choices[0].message.content;
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        return NextResponse.json(parsedData);
    } catch (parseError) {
        console.error("LỖI ĐỊNH DẠNG JSON:", cleanJson);
        return NextResponse.json({ error: 'AI trả về sai định dạng' }, { status: 500 });
    }

  } catch (error: any) {
    console.error("LỖI HỆ THỐNG:", error.message || error); 
    return NextResponse.json({ error: 'Lỗi xử lý dữ liệu' }, { status: 500 });
  }
}