// Cinema trivia for the footer card. Kept to well-documented facts; no shaky numbers.

export interface CinemaFact {
  tag: string;
  title: string;
  body: string;
}

export const CINEMA_FACTS: CinemaFact[] = [
  { tag: '1895', title: 'Suất chiếu đầu tiên', body: 'Ngày 28/12/1895, anh em Lumière chiếu phim có bán vé lần đầu tại Grand Café ở Paris. Điện ảnh lấy ngày này làm sinh nhật.' },
  { tag: '1927', title: 'Phim biết nói', body: '"The Jazz Singer" (1927) là phim truyện đầu tiên có lời thoại đồng bộ với hình, mở ra kỷ nguyên phim có tiếng.' },
  { tag: '24 fps', title: 'Vì sao là 24 khung hình?', body: 'Khi phim có tiếng ra đời, tốc độ quay phải cố định để âm thanh khớp hình. 24 khung hình/giây trở thành chuẩn từ đó.' },
  { tag: 'Thuật ngữ', title: 'MacGuffin', body: 'Hitchcock phổ biến từ này: một món đồ khiến nhân vật lao vào đuổi bắt, nhưng bản thân nó là gì thì chẳng quan trọng.' },
  { tag: 'Kỹ thuật', title: 'Dolly zoom', body: 'Máy quay lùi ra trong khi ống kính zoom vào (hoặc ngược lại): nhân vật đứng yên, hậu cảnh co giãn. Kỹ thuật này nổi tiếng nhờ "Vertigo" (1958).' },
  { tag: 'Dựng phim', title: 'Hiệu ứng Kuleshov', body: 'Cùng một khuôn mặt vô cảm, ghép với bát súp, quan tài hay đứa trẻ, khán giả lại "thấy" đói, buồn hay trìu mến. Ý nghĩa nằm ở cú cắt.' },
  { tag: 'Âm thanh', title: 'Tiếng hét Wilhelm', body: 'Một tiếng hét trong kho âm thanh, đặt tên theo nhân vật Wilhelm trong "The Charge at Feather River" (1953), được cài vào rất nhiều phim như một trò đùa nội bộ.' },
  { tag: 'Âm thanh', title: 'Foley', body: 'Tiếng bước chân, tiếng áo sột soạt... thường được thu lại ở phòng thu sau khi quay. Nghề này mang tên Jack Foley, người đặt nền móng cho nó.' },
  { tag: '1941', title: 'Deep focus', body: '"Citizen Kane" nổi tiếng với những khung hình mà cả tiền cảnh lẫn hậu cảnh đều nét, nhờ nhà quay phim Gregg Toland.' },
  { tag: '1948', title: 'Một cú máy... gần như', body: '"Rope" của Hitchcock được dựng để trông như quay liền một mạch, các điểm cắt được giấu khi máy lướt qua lưng nhân vật.' },
  { tag: 'Ánh sáng', title: 'Giờ vàng', body: 'Khoảng ngắn sau bình minh và trước hoàng hôn cho ánh sáng mềm, ấm. "Days of Heaven" (1978) quay rất nhiều cảnh trong khung giờ này.' },
  { tag: 'Ánh sáng', title: 'Ánh sáng ba điểm', body: 'Đèn chính (key), đèn phụ (fill) và đèn ven (back light): công thức nền tảng để tách nhân vật khỏi hậu cảnh.' },
  { tag: 'Ngữ pháp', title: 'Quy tắc 180 độ', body: 'Hai nhân vật đối thoại nằm trên một đường tưởng tượng. Máy quay giữ một bên đường để khán giả không bị rối hướng nhìn.' },
  { tag: 'Khung hình', title: 'Góc máy Dutch', body: 'Nghiêng máy quay để đường chân trời lệch đi, tạo cảm giác bất an. Phim noir và kinh dị rất chuộng góc này.' },
  { tag: 'Khung hình', title: 'Tỷ lệ 2.39:1', body: 'Khung hình siêu rộng thường gọi là "scope", gắn với ống kính anamorphic: ống kính ép hình theo chiều ngang khi quay, rồi giãn ra khi chiếu.' },
  { tag: '1929', title: 'Oscar đầu tiên', body: 'Lễ trao giải Oscar đầu tiên diễn ra năm 1929 tại Hollywood. Buổi lễ chỉ kéo dài khoảng mười lăm phút.' },
  { tag: '1937', title: 'Bạch Tuyết', body: '"Snow White and the Seven Dwarfs" (1937) là phim hoạt hình dài đầu tiên của Disney, khi đó bị nhiều người gọi là "trò điên rồ của Disney".' },
  { tag: '1960', title: 'Psycho và cái bồn cầu', body: '"Psycho" thường được nhắc là phim Hollywood đầu tiên cho thấy cảnh bồn cầu xả nước, một chi tiết từng khiến giới kiểm duyệt khó chịu.' },
  { tag: 'Thuật ngữ', title: 'Mise-en-scène', body: 'Tiếng Pháp nghĩa là "đặt vào cảnh": mọi thứ trong khung hình, từ bối cảnh, ánh sáng, trang phục đến vị trí diễn viên.' },
  { tag: 'Thuật ngữ', title: 'Cameo', body: 'Một lần xuất hiện ngắn của người nổi tiếng. Hitchcock tự cameo trong rất nhiều phim của mình, khán giả từng chơi trò đi tìm ông.' },
];

// Handed out by the hidden silhouette: where Hitchcock actually hid
export const CAMEO_FACTS: CinemaFact[] = [
  { tag: '1959', title: 'Lỡ chuyến xe', body: 'Trong "North by Northwest", Hitchcock xuất hiện ngay đầu phim: cửa xe buýt đóng sập trước mặt ông.' },
  { tag: '1954', title: 'Chỉnh đồng hồ', body: 'Trong "Rear Window", ông đứng lên dây đồng hồ trong căn hộ của anh nhạc sĩ, ở phía bên kia sân.' },
  { tag: '1960', title: 'Chiếc mũ cao bồi', body: 'Trong "Psycho", ông đứng trên vỉa hè ngoài văn phòng của Marion, đội một chiếc mũ cao bồi.' },
  { tag: '1963', title: 'Hai con chó', body: 'Trong "The Birds", ông bước ra khỏi tiệm thú cưng, dắt theo hai con chó sục. Đó là chó của chính ông.' },
  { tag: '1944', title: 'Trên một con thuyền', body: '"Lifeboat" diễn ra toàn bộ trên một chiếc xuồng, nên ông xuất hiện trong mẩu quảng cáo thuốc giảm cân trên tờ báo cũ.' },
  { tag: '1954', title: 'Tấm ảnh họp lớp', body: '"Dial M for Murder" gần như chỉ có một căn hộ, nên ông nằm trong tấm ảnh họp lớp treo trên tường.' },
  { tag: '1976', title: 'Cameo cuối cùng', body: 'Trong "Family Plot", phim cuối của ông, chỉ thấy bóng ông in trên cánh cửa kính của phòng hộ tịch.' },
];

// 28 December: the Lumière screening, cinema's birthday
export const BIRTHDAY_FACT = CINEMA_FACTS[0];
