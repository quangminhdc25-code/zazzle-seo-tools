import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Chỉ nhận title và description
    const { title, description } = await request.json();

    const prompt = `Bạn là một Chuyên gia SEO Thương mại điện tử và Copywriter bậc thầy cho Zazzle.
    Dữ liệu thô của tôi là một sản phẩm đang bán rất chạy trên Amazon. Hãy tự đọc hiểu, trích xuất Niche (Ngách) và chủ đề thiết kế cốt lõi từ dữ liệu sau:
    - Title Amazon: ${title}
    - Description Amazon: ${description}

    NHIỆM VỤ: Lột xác dữ liệu "nhồi nhét từ khóa" lộn xộn của Amazon thành 1 bộ nội dung chuẩn SEO 100/100 cho Zazzle và Google Search. Tuân thủ NGHIÊM NGẶT các quy tắc sau:

    1. TITLE (Tiêu đề Zazzle):
    - Lọc bỏ rác: Loại bỏ triệt để các từ khóa nhồi nhét vô nghĩa của Amazon (như: for men women, novelty, tee, apparel, v.v.).
    - Độ dài BẮT BUỘC: 50 - 70 ký tự. Không được dài hơn.
    - Cấu trúc: [Main Keyword / Niche] + [Tính từ thu hút] + [Loại sản phẩm]. Đưa Main Keyword lên đầu tiên để tối ưu Index.
    - Format: Viết hoa chữ cái đầu của mỗi từ (Title Case).

    2. DESCRIPTION (Mô tả Zazzle):
    - ĐOẠN 1 (SEO Mồi - ~150 ký tự đầu): Viết 1-2 câu lôi cuốn. Tích hợp [Main Keyword] và 1 [Long-tail Keyword] thật tự nhiên để làm Meta Description cho Google.
    - ĐOẠN 2 (Storytelling & Đối tượng mục tiêu): Suy luận thiết kế này hợp làm quà cho ai (Ví dụ: Introverts, Dog moms, Coworkers...) và dịp nào (Birthday, Christmas, Retirement...). Nhắc trực tiếp đối tượng và dịp lễ vào câu văn để ăn thuật toán "Suggested Items" của Zazzle.
    - ĐOẠN 3 (CTA): 1 câu Call To Action chốt sale mạnh mẽ (vd: "Get this unique design today!").

    3. TAGS (Thẻ từ khóa tự động):
    - Dựa vào Niche đã phân tích, tạo ra CHÍNH XÁC 10 tags chiến lược. Không thiếu, không thừa. Phân cách bằng dấu phẩy (,).
    - Format: Toàn bộ viết thường (lowercase), TUYỆT ĐỐI KHÔNG dùng dấu hashtag (#).
    - Cấu trúc 10 tags bắt buộc theo thứ tự:
      1. [Style] [Niche] [Product] (Primary Keyword)
      2. [Adjective] [Niche] [Product] (Long-tail)
      3. [Niche] [Occasion/Context] (Long-tail)
      4. [Action/Verb] [Niche] (Long-tail)
      5. [Niche] lover gift (Audience 1)
      6. gift for [Specific Demographic] (Audience 2)
      7. best birthday present idea (hoặc Buyer Intent tương đương)
      8. [Holiday/Season] [Product] (Occasion)
      9. trending [Niche] aesthetic (Trend)
      10. [Related Sub-niche] (Mở rộng thuật toán)

    ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
    Chỉ trả về ĐÚNG 1 object JSON hợp lệ bên dưới, tuyệt đối không có markdown (\`\`\`), không có bất kỳ dòng chữ nào khác:
    {
      "newTitle": "...",
      "newDescription": "...",
      "newTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
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
        "temperature": 0.5 
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