# GAY GANG CINEMA · Mùa 2: Cuộn Phim Ngủ Đông

> Thiết kế hệ thống easter egg, huy hiệu và vòng khám phá cho GGMV 2.0. Viết ngày 2026-10-22.
> Kế thừa hệ thống đã chạy (`src/easterEggs.ts`, `server.ts` ledger `easterEggs`): 8 thành tích, 3 chuỗi manh mối A/B/C, Hồ sơ mật, House note. Tài liệu này **mở rộng**, không thay thế.

Nhãn độ tin cậy cho mọi reference điện ảnh:

- **[Có thật]**: chi tiết có trong phim hoặc lịch sử, kiểm chứng được.
- **[Có thật · tiểu thuyết]**: có trong sách gốc; bản phim chưa kiểm chứng có giữ hay không.
- **[Hư cấu trong phim]**: khái niệm do chính bộ phim bịa ra.
- **[Sáng tác]**: ý tưởng của hệ thống này, không phải trivia.

---

## Bước 1 · Phân tích dự án

**Đã biết (từ code và dữ liệu thật):**

| Mảng | Điểm chạm có thể gắn easter egg |
|---|---|
| Kho phim (24 phim, 6 thành viên vote) | Thẻ phim, trang chi tiết, vote, thêm phim qua OMDb |
| Vòng quay | Kim chỉ, góc dừng, tỷ lệ %, buff x2, luật nghỉ lượt, veto 3 lá/tháng, thắng giả 10%, Tiên tri |
| Bảng vàng | Thứ hạng, 3 giám khảo Teng / Lộc / Thành (thang 0–10, bước 0.05), tìm kiếm, Hồ sơ mật |
| Lịch chiếu | Đếm ngược, điểm danh (có mặt / muộn / bận), phân công mồi |
| Giao diện | 8 bảng màu, sáng / tối, theo mùa, bật tắt âm thanh |
| Giọng nói của rạp | Tiếng Anh khô, deadpan ("The committee has declined to interpret this.") |

**Chất liệu riêng của hội, có thật trong dữ liệu:**

- *Kẻ Đâm Lén (Knives Out)* là phim duy nhất có **cả 6 thành viên vote**.
- Lộc "góp mồi" bằng **Phòng Máy Chiếu 120-Inch & Loa 5.1**; buổi chiếu ở **phòng khách nhà Lộc**.
- *The Last Waltz* được đề xuất bởi **"Hệ thống"**, một bộ phim về buổi diễn chia tay do máy đề xuất.
- Ghi chú hội đồng toàn kiểu cụt lủn: "oke", "bth", "tinh duc va quai di".
- Shiba "có mặt đúng 20h20 chuẩn bị bia"; Hoèn "tan làm 20h sẽ phi qua".

**Thiếu, cần bạn bổ sung (không chặn thiết kế, xem cuối tài liệu):** biệt danh, inside joke có thật, chủ đề cấm đùa, và việc giữ giọng rạp tiếng Anh hay chuyển sang tiếng Việt.

## Bước 2 · Creative direction

**Một câu:** *Mỗi bộ phim trong kho mang theo một bí mật đang ngủ. Chiếu phim để đánh thức nó.*

Nguyên tắc (giữ nguyên từ Mùa 1, bổ sung 3 điều):

1. **Kết quả là thiêng liêng.** Không easter egg nào đổi phim trúng, điểm, thứ hạng hay veto. Chỉ đổi lời, hình, tiếng.
2. **Reference phải sống trong kho của hội.** Chỉ dùng phim hội thật sự sở hữu. Không gắn reference nổi tiếng mà hội chưa từng đề xuất.
3. **Bí mật khiến người ta muốn xem thêm phim.** Phần thưởng lớn nhất của Mùa 2 là lý do để chiếu bộ tiếp theo.
4. **Một lần là đủ.** Mỗi trò đùa có cooldown hoặc chỉ nổ một lần mỗi người.
5. **Không có ngõ cụt.** Mọi bí mật đều bỏ qua được, đều quay về đúng trạng thái cũ, và có cách kích hoạt không cần chuột (bàn phím hoặc chạm).

**Phong cách hài:** deadpan + callback. Rạp nói như một nhân viên lưu trữ mệt mỏi nhưng rất tận tâm. Trò đùa nhắm vào *tình huống*, không nhắm vào *người*.

**Ranh giới, không đùa với:**

- *Schindler's List*, *The Pianist* (Holocaust), *Hồi Ức Kẻ Sát Nhân* (vụ án có thật), *Cuộc Săn Lùng / The Hunt* (cáo buộc xâm hại). Bốn phim này **không có easter egg hài**. Chúng chỉ được hưởng các cơ chế trung lập (điểm, xếp hạng).
- Đời tư diễn viên thật (ví dụ các cáo buộc quanh Michael Jackson), chấn thương có thật (tai nạn của Niki Lauda).
- Xu hướng tính dục: tên hội là bản sắc tự chọn của hội, hệ thống không đùa về nó.
- Gắn nhãn tiêu cực vĩnh viễn cho một thành viên.

## Bước 3 · Ba hướng concept, chọn kết hợp

| Hướng | Ý tưởng | Đánh giá |
|---|---|---|
| **A. Người Chiếu Phim** | Rạp có một nhân vật vô hình, chỉ xuất hiện qua ghi chú, dần dần thành một con người | Tạo running gag và giọng nói, nhưng một mình không đủ phần thưởng |
| **B. Cuộn Phim Ngủ Đông** | Mỗi phim trong kho có một bí mật riêng, chỉ thức dậy sau khi hội chiếu nó | Gắn chặt với bản sắc, thúc đẩy hành vi cốt lõi (xem phim). **Chọn làm xương sống** |
| **C. Sổ Cuống Vé** | Mỗi phát hiện để lại một cuống vé trong cuốn sổ có ô trống in bóng | Lớp phần thưởng mang tính biểu tượng. **Chọn làm lớp phần thưởng** |

**Kết hợp:** B là nơi bí mật sống, C là nơi phát hiện được ghi lại, A là giọng kể kết nối tất cả.

Một chi tiết nối 3 lớp: trang chi tiết của phim chưa chiếu có dòng nhỏ **"Cuộn phim này đang ngủ."** nếu phim đó có bí mật. Không nói bí mật là gì, chỉ nói rằng nó tồn tại.

---

## Bước 4–5 · Hệ thống easter egg

### Nhóm I · Cuộn phim đã thức (phim hội đã chiếu, dùng được ngay)

#### E1. Remember Sammy Jankis
1. **Category:** Narrative · Visual.
2. **Core Idea:** Phim về trí nhớ để lại hình xăm trên chính hồ sơ của nó.
3. **Reference:** *Memento* (2001). Leonard xăm "remember Sammy Jankis" lên tay **[Có thật]**; tấm Polaroid của Teddy ghi "Don't believe his lies" **[Có thật]**; phần màu chạy ngược, phần đen trắng chạy xuôi **[Có thật]**. Biến tấu: hồ sơ phim tự "ghi chú cho chính mình".
4. **Trigger:** *Memento* đã xem. Hàng của nó trong Bảng vàng có dòng chữ viết tay rất nhỏ dưới tên: `remember Sammy Jankis`. Bấm hoặc focus vào dòng chữ đó.
5. **User Experience:** Các cảm nhận của phim lật thành **Polaroid**, hiện theo **thứ tự ngược** (mới nhất ở cuối, đọc từ dưới lên), kèm nhãn `Played in reverse. Leonard would approve.` Bấm lần nữa để trở về bình thường.
6. **Payoff:** Polaroid cuối cùng (cảm nhận đầu tiên từng được viết) có chữ ký tay: `Don't believe his lies. — đã ký: ghi chú của chính bạn`.
7. **Rarity:** Thường. Ai lướt Bảng vàng đủ kỹ đều thấy.
8. **Project Integration:** Nối với **Chuỗi A (Missing Frame)**: Polaroid cuối mang ký hiệu ⌁, gợi ý "trí nhớ của kho cũng có lỗ hổng".
9. **Implementation:** Thấp. Khớp phim bằng `originalTitle`/`title` chứa "Memento". Chỉ đảo thứ tự hiển thị, không đụng dữ liệu. Test: phim chưa xem thì không có dòng chữ; không có cảm nhận thì vẫn hiện Polaroid trống với chữ ký.

#### E2. Bốn Mươi Phút Mới Có Tên Phim
1. **Category:** Cinematic · Meta (thời gian).
2. **Core Idea:** Phim để tên phim xuất hiện cực muộn thì hồ sơ của nó cũng vậy.
3. **Reference:** *Drive My Car* (2021) chỉ hiện tên phim và credit mở đầu sau khoảng 40 phút **[Có thật]**. Biến tấu: thu nhỏ thời gian 60 lần, 40 phút thành 40 giây.
4. **Trigger:** *Drive My Car* đã xem. Ở yên trang Bảng vàng 40 giây khi hàng của phim đang nằm trong màn hình.
5. **User Experience:** Không báo trước. Đến giây thứ 40, một title card mảnh trượt vào giữa hàng: `DRIVE MY CAR` kèm dòng phụ `Opening credits. Right on schedule.` rồi tự lui sau 4 giây.
6. **Payoff:** Người chờ được là người hiểu phim. Ghi chú hội đồng thật của phim ("tinh duc va quai di") được trình bày lại như phụ đề: `Ban giám khảo đã ghi nhận.`
7. **Rarity:** Không thường. Cần kiên nhẫn và đúng chỗ.
8. **Project Integration:** Dùng **ghi chú cụt lủn có thật** của hội làm punchline. Đó là inside joke tự sinh từ dữ liệu.
9. **Implementation:** Thấp. `IntersectionObserver` cộng bộ đếm, mỗi người chỉ nổ một lần. Test: cuộn đi thì reset bộ đếm; bật giảm chuyển động thì card hiện tĩnh.

#### E3. Moonwalk
1. **Category:** Interaction.
2. **Core Idea:** Vòng quay đi lùi mà vẫn tới đích.
3. **Reference:** *Michael* (2026). Màn moonwalk nổi tiếng trên truyền hình ở Motown 25 (1983) **[Có thật]**. Chỉ dùng điệu nhảy, không đụng đời tư.
4. **Trigger:** *Michael* đã xem. Giữ **Shift** khi bấm **Quay!** (điện thoại: nhấn giữ nút 1 giây).
5. **User Experience:** Vòng quay quay **ngược chiều kim đồng hồ**, kim chỉ đổi chữ thành `Billie Jean is not my reel`. Lúc dừng, kim chỉ "lướt" lùi 3px rồi đứng yên.
6. **Payoff:** Cuống vé "Motown 25". Lần đầu có thêm dòng: `Same odds. Better footwork.`
7. **Rarity:** Không thường. Phải đoán ra phím tắt; tooltip của nút **Quay!** chỉ gợi ý `…hoặc đi lùi?` sau khi phim đã thức.
8. **Project Integration:** Biến thao tác cốt lõi nhất của app (quay) thành chỗ chơi chữ, không thêm nút mới.
9. **Implementation:** Trung bình. **Bắt buộc giữ công bằng:** góc dừng vẫn chọn đều ngẫu nhiên trong [0, 2π), chỉ đảo chiều chuyển động; test thống kê 10.000 lượt cho thấy phân phối phim trúng không đổi.

### Nhóm II · Cơ chế của hội, khoác áo điện ảnh (dùng ngay, không cần phim đã chiếu)

#### E4. At Least I Tried (Bàn Điều Khiển Của McMurphy)
1. **Category:** Interaction · Humor.
2. **Core Idea:** Lá veto đã hết vẫn bấm được, để thất bại cho thật đẹp.
3. **Reference:** *Bay Trên Tổ Chim Cúc Cu* (1975). McMurphy cố nhấc bàn điều khiển thủy trị liệu và thất bại: "But I tried, didn't I? Goddamnit, at least I did that." **[Có thật]**. Cuối phim Chief nhấc được nó **[Có thật]**.
4. **Trigger:** Giám khảo đã dùng hết 3 lá veto trong tháng, bấm vào nút veto của mình (hiện nay nút bị khóa, Mùa 2 cho bấm).
5. **User Experience:** Nút **gồng lên**: rung ngang 300ms, chữ đổi thành `…`, rồi hiện dòng `But I tried, didn't I?`. Kết quả quay không bị hủy, không gọi API veto.
6. **Payoff:** Nếu *Cúc Cu* đã được chiếu thì thêm dòng thứ hai: `The Chief could lift it. You are not the Chief.` Cuống vé "McMurphy's Console".
7. **Rarity:** Không thường. Cần một giám khảo đốt sạch veto trong tháng, đó là hành vi có thật và đáng nhớ.
8. **Project Integration:** Đùa với luật veto 3 lá/tháng, luật đặc sản của hội.
9. **Implementation:** Thấp. Thay `disabled` bằng trạng thái "cạn" có `aria-disabled` cùng thông báo cho trình đọc màn hình. Test: tuyệt đối không gọi `/api/veto/use`, không đóng modal kết quả.

#### E5. Everyone Had a Motive (Cả Nhà Đều Có Động Cơ)
1. **Category:** Narrative · Community.
2. **Core Idea:** Khi cả hội cùng vote một phim, phim đó thành "vụ án" mà ai cũng là nghi phạm.
3. **Reference:** *Kẻ Đâm Lén (Knives Out)* (2019), nơi mọi thành viên gia đình Thrombey đều có động cơ **[Có thật]**. Thám tử Benoit Blanc **[Có thật]**.
4. **Trigger:** Một phim chưa xem có phiếu của **tất cả thành viên trong danh sách**. *Hiện đã xảy ra: chính Knives Out có đủ 6 phiếu.*
5. **User Experience:** Thẻ phim trong Kho phim hiện con dấu `ALL SUSPECTS` thay cho số vote; tooltip ghi `6 phiếu. 6 động cơ. 0 bằng chứng ngoại phạm.` Trang chi tiết có "hồ sơ vụ án" liệt kê 6 người vote như danh sách nghi phạm, mỗi người kèm "động cơ" lấy từ chính lý do đề xuất (`whyWatch`) nếu là người đề xuất, còn lại ghi `Động cơ: đã bấm vote.`
6. **Payoff:** Nếu phim đó được vòng quay chọn: `The detective has reached a conclusion: it was all of you.` Thành tích cộng đồng **"Cả Nhà Đều Có Động Cơ"**.
7. **Rarity:** Hiếm theo bản chất (cần cả hội). Hiện đang có sẵn một ca để người dùng phát hiện ngay.
8. **Project Integration:** Phần thưởng cho hành vi tập thể; không ai đạt một mình được.
9. **Implementation:** Thấp. So `votes` với `BROTHERS_LIST`. Test: thêm thành viên tùy chỉnh thì điều kiện tính theo danh sách cố định, không theo tên lạ.

#### E6. Hypersleep (Hội Chứng Không Gian)
1. **Category:** Dynamic · Utility-humor.
2. **Core Idea:** Lâu không vào thì app "đánh thức" bạn như phi hành gia, kèm bản tóm tắt những gì đã xảy ra.
3. **Reference:** *Pandorum* (2009): phi hành đoàn tỉnh dậy sau giấc ngủ đông, mất trí nhớ; "Pandorum" là chứng loạn thần không gian **[Hư cấu trong phim]**.
4. **Trigger:** Lần truy cập cách lần trước **≥ 30 ngày** (lưu `lastVisit` trên trình duyệt).
5. **User Experience:** Màn mở đầu tối trong 1.5 giây: `HYPERSLEEP · 34 NGÀY`. Sau đó là một thẻ hữu ích thật: `Trong lúc bạn ngủ: 3 phim đã chiếu, 2 phim mới, bạn còn 3 lá veto.` Dòng cuối: `Triệu chứng Pandorum có thể gồm: quên mình đã đề xuất phim gì.`
6. **Payoff:** Thực sự giúp người quay lại bắt nhịp. Cuống vé "Hypersleep".
7. **Rarity:** Theo hoàn cảnh.
8. **Project Integration:** Biến bài toán giữ chân người dùng thành trò đùa có ích.
9. **Implementation:** Thấp. Dùng `localStorage` cộng dữ liệu phim có sẵn (`watchedDate`, `createdAt`). Test: lần đầu vào web thì không kích hoạt; storage bị chặn thì bỏ qua lặng lẽ.

#### E7. Mười Hai Tuổi (Ngày Kỷ Niệm Của Hội)
1. **Category:** Narrative · Dynamic (theo năm).
2. **Core Idea:** Đúng ngày hội chiếu bộ phim đầu tiên, rạp nhớ.
3. **Reference:** *Stand by Me* (1986), câu gõ máy cuối phim: "I never had any friends later on like the ones I had when I was twelve. Jesus, does anyone?" **[Có thật]**.
4. **Trigger:** Ngày hôm nay trùng ngày–tháng của `firstScreeningDate` (bộ phim được chiếu sớm nhất), từ năm thứ 2 trở đi.
5. **User Experience:** Dòng credit cuối trang được **gõ ra từng chữ** như máy đánh chữ của Gordie: câu trên, rồi `Gay Gang Cinema · năm thứ N · bắt đầu bằng [tên phim đầu tiên]`.
6. **Payoff:** Nếu *Stand by Me* đã được chiếu thì thêm một dòng nữa: `Chúng tôi vẫn đang đi dọc đường ray.` Thành tích cộng đồng **"Mười Hai Tuổi"** ghi theo năm.
7. **Rarity:** Mỗi năm một ngày.
8. **Project Integration:** Biến dữ liệu có thật (ngày chiếu đầu tiên) thành nghi lễ của hội.
9. **Implementation:** Thấp. Dùng lại `firstScreeningDate()` đã có. Test: bật giảm chuyển động thì hiện toàn câu, không gõ từng chữ; múi giờ tính theo Asia/Ho_Chi_Minh.

#### E8. Sổ Tay Người Chiếu Phim
1. **Category:** Narrative · Running gag (nhân vật).
2. **Core Idea:** House note trên logo không ngẫu nhiên nữa mà là **12 trang nhật ký**, mỗi lần một trang, kể về người chiếu phim vô hình của hội.
3. **Reference:** Truyền thống người chiếu phim trong rạp cũ **[Sáng tác]**. Cấu trúc nhật ký nhỏ giọt lấy cảm hứng từ các "ghi chú tìm thấy" trong game khám phá **[Sáng tác]**.
4. **Trigger:** Như House note hiện tại (rê/focus logo khoảng 1 giây), nhưng mỗi **ngày khác nhau** mở **trang kế tiếp**.
5. **User Experience:** Ví dụ một số trang:
   - Trang 1: `Day 1. Máy chiếu 120 inch. Loa 5.1. Không ai hỏi tôi có muốn ở đây không.`
   - Trang 5: `Họ cãi nhau 40 phút để chọn phim, rồi để một cái bánh xe quyết định. Tôi tôn trọng điều đó.`
   - Trang 9: `Ai đó chấm 2.0. Tôi đã tắt đèn sớm hơn một chút.`
   - Trang 12: `Tôi không phải người chiếu phim. Tôi là căn phòng.` (callback về THE HOUSE IS THE WITNESS)
6. **Payoff:** Trang 12 mở thành tích **"Bạn Của Người Chiếu Phim"** và một mục trong Hồ sơ mật.
7. **Rarity:** Kiên trì (12 ngày khác nhau).
8. **Project Integration:** Dựa trên lore có thật: **phòng máy chiếu 120 inch nhà Lộc**. Người chiếu phim không phải Lộc, mà là căn phòng. *Cần bạn duyệt chi tiết này.*
9. **Implementation:** Thấp. Lưu `pageIndex` và `lastPageDate` trên trình duyệt. Test: cùng ngày thì vẫn trang cũ; cookie bị xóa thì bắt đầu lại từ trang 1 (chấp nhận được).

#### E9. Dinner Is a Liquid
1. **Category:** Meta · Humor (lịch chiếu).
2. **Core Idea:** Rạp đọc danh sách mồi và có nhận xét.
3. **Reference:** Không cần reference phim. Đây là quan sát thuần của hội **[Sáng tác]**.
4. **Trigger:** Danh sách mồi của buổi chiếu có ≥ 2 món chứa "bia/beer/heineken/tiger" và **không có món nào ăn được** (ngô, khô, mực, gà…).
5. **User Experience:** Dưới tiêu đề "Mồi nhậu" hiện dòng xám: `Bữa tối tuần này ở dạng lỏng.`
6. **Payoff:** Biến thể: nếu ai đó "góp mồi" bằng một thứ không ăn được (ví dụ "Phòng Máy Chiếu 120-Inch", có thật trong dữ liệu) thì hiện `Đã ghi nhận. Không khuyến khích ăn.`
7. **Rarity:** Thường. Nó bắt chính hành vi của hội.
8. **Project Integration:** Lấy thẳng dữ liệu đồ ăn có thật làm trò đùa.
9. **Implementation:** Thấp. Danh sách từ khóa trong code. Test: tiếng Việt có dấu và không dấu; món "bia" trong "bia hơi + nem" vẫn được tính là có đồ ăn.

#### E10. Phòng Máy Chiếu (Console)
1. **Category:** Meta (dành cho người tò mò kỹ thuật).
2. **Core Idea:** Ai mở DevTools sẽ bước vào phòng máy.
3. **Reference:** Truyền thống "lời nhắn trong console" của các trang web **[Sáng tác]**.
4. **Trigger:** Mở console trình duyệt (in một lần khi tải trang).
5. **User Experience:** Chữ ASCII `GG` cùng dòng `Bạn đã vào phòng máy chiếu. Đừng chạm vào cuộn phim.` và gợi ý: `ggmv.projectionist()`.
6. **Payoff:** Gọi lệnh thì hiện **trang 0** của Sổ tay Người Chiếu Phim (trang không có trong 12 trang), cùng cuống vé ẩn "Phòng Máy".
7. **Rarity:** Hiếm, chỉ người tò mò kỹ thuật mới tìm ra.
8. **Project Integration:** Nối với E8.
9. **Implementation:** Rất thấp. Test: không lộ dữ liệu nội bộ, không lộ key; production vẫn in.

### Nhóm III · Cuộn phim đang ngủ (thức dậy khi hội chiếu phim đó)

> Đây là động lực xem phim. Trang chi tiết của từng phim sẽ hiện "Cuộn phim này đang ngủ."

#### E11. Call It, Friendo
1. **Category:** Interaction · Humor.
2. **Core Idea:** Đồng xu xuất hiện đúng lúc bảng xếp hạng không phân thắng bại, và không có quyền gì cả.
3. **Reference:** *Không Chốn Dung Thân (No Country for Old Men)* (2007). Chigurh tung đồng xu ở cây xăng: "Call it, friendo." và "What's the most you ever lost on a coin toss?" **[Có thật]**.
4. **Trigger:** Phim đã chiếu **và** Bảng vàng có hòa hạng nhất. Bấm vào nhãn "The jury refused to separate them".
5. **User Experience:** Hiện đồng xu xoay 600ms với lời mời `Call it.` cùng 2 nút Sấp / Ngửa. Kết quả hiện ra, rồi dòng `The coin has no jurisdiction in this archive. Rank unchanged.`
6. **Payoff:** Tung lần thứ 3 trong một phiên: `What's the most you ever lost on a coin toss?` kèm cuống vé "Friendo".
7. **Rarity:** Hiếm (cần cả hòa hạng lẫn phim đã chiếu).
8. **Project Integration:** Nối với **Chuỗi B (House Edge)** về tinh thần: may rủi không bao giờ thắng được sự bất đồng của hội.
9. **Implementation:** Thấp. Test: không thay đổi thứ tự; dùng bàn phím được.

#### E12. Photo Finish
1. **Category:** Visual · Rare event.
2. **Core Idea:** Kim chỉ dừng sát vạch giữa hai lát, và rạp làm như đang xem ảnh về đích.
3. **Reference:** *Ford v Ferrari* (2019). Le Mans 1966: Ford dàn cảnh về đích cùng lúc, nhưng Ken Miles mất chiến thắng vì McLaren xuất phát lùi hơn nên được tính đi xa hơn **[Có thật]**. Câu "7000 RPM" của Miles **[Có thật]**.
4. **Trigger:** Phim đã chiếu. Một lượt quay dừng trong vòng **1.5% độ rộng lát** tính từ vạch ranh giới.
5. **User Experience:** Trước màn công bố, vòng quay "đóng băng" 600ms, hiện khung ảnh đen trắng phóng to vùng kim chỉ, rồi con dấu `PHOTO FINISH`.
6. **Payoff:** Màn công bố có dòng: `Ban tổ chức xác nhận: phim kia xuất phát lùi hơn.` Phim trúng vẫn là phim kim chỉ vào.
7. **Rarity:** Hiếm, khoảng 3% lượt quay, xác suất thật chứ không cài cắm.
8. **Project Integration:** Khai thác chính vật lý của vòng quay canvas.
9. **Implementation:** Trung bình. Đã có `pointerAngle` và ranh giới lát. Test: không đổi `winningSlice`; khi giảm chuyển động thì bỏ phần đóng băng.

#### E13. Verse-Jumping
1. **Category:** Interaction · Meta (giao diện).
2. **Core Idea:** Nhảy qua đủ 8 vũ trụ màu là thành nhà du hành đa vũ trụ.
3. **Reference:** *Cuộc Chiến Đa Vũ Trụ (Everything Everywhere All at Once)* (2022). Muốn "verse-jump" phải làm một việc kỳ quặc khó xảy ra; vũ trụ ngón tay xúc xích; cặp mắt nhựa (googly eye); vũ trụ hòn đá **[Có thật]**.
4. **Trigger:** Phim đã chiếu. Chọn **đủ 8 bảng màu khác nhau trong 60 giây** ở bảng Giao diện.
5. **User Experience:** Lần đổi thứ 8: logo **GG** mọc một cặp mắt nhựa trong phần còn lại của phiên, và bảng chọn hiện `You have visited every universe. In one of them, we already picked a movie.`
6. **Payoff:** Để cửa sổ đứng yên 2 phút ở chế độ tối sau đó: hai hòn đá có mắt nhựa hiện ở chân trang, im lặng, kèm phụ đề nhỏ `…`. Cuống vé "Verse-Jumper".
7. **Rarity:** Không thường, rồi đến hiếm (tầng thứ hai).
8. **Project Integration:** Đây là easter egg duy nhất dùng **bộ bảng màu**, tính năng riêng của GGMV 2.0.
9. **Implementation:** Thấp. Đếm trong `AppearanceMenu`. Test: chế độ "Mặc định" cũng tính là một vũ trụ; lựa chọn của người dùng không bị ghi đè.

#### E14. Amaze Amaze Amaze
1. **Category:** Narrative · Rare (điểm số).
2. **Core Idea:** Khi ba giám khảo cho điểm y hệt nhau, rạp phấn khích kiểu người ngoài hành tinh.
3. **Reference:** *Project Hail Mary*. Rocky lặp từ ba lần để nhấn mạnh ("amaze amaze amaze"), và nói "fist my bump" **[Có thật · tiểu thuyết]**.
4. **Trigger:** Phim đã chiếu. Lưu điểm mà **Teng = Lộc = Thành**.
5. **User Experience:** Ba ô điểm giám khảo **khớp lại thành một ô** trong 400ms, kèm con dấu `AMAZE AMAZE AMAZE`.
6. **Payoff:** Thông báo `Fist my bump.` cùng thành tích **"Ba Ô Một Tim"**.
7. **Rarity:** Hiếm (thang 0–10 bước 0.05 khiến điểm trùng hoàn toàn rất khó).
8. **Project Integration:** Đối xứng với "Hội đồng tan vỡ": một bên là bất đồng cực điểm, bên kia là đồng thuận tuyệt đối.
9. **Implementation:** Thấp. Ghi thêm sự kiện `UNANIMOUS` trên server. Test: trùng cả ở 10.00 lẫn 0.00 đều tính; lưu lại không ghi trùng.

#### E15. Won by One Point
1. **Category:** Narrative · Dynamic (cuối năm).
2. **Core Idea:** Cuộc đua đề xuất của năm được phân định bằng đúng một phim.
3. **Reference:** *Đường Đua Nghẹt Thở (Rush)* (2013). Năm 1976 James Hunt vô địch hơn Niki Lauda đúng 1 điểm; Lauda bỏ cuộc ở chặng Fuji vì mưa **[Có thật]**.
4. **Trigger:** Phim đã chiếu. Vào ngày 31/12, hai người đề xuất dẫn đầu có số phim được chiếu trong năm **chênh đúng 1**.
5. **User Experience:** Bảng "Đề xuất mát tay nhất" trong Thống kê có cờ ca-rô giữa hai tên: `Phân định bằng một phim. Năm nay không ai đổ lỗi cho trời mưa.`
6. **Payoff:** Thành tích **"1976"** cho người thắng. Nối với **Chuỗi C (A-13)**, vì Rush là phim năm 2013.
7. **Rarity:** Mỗi năm tối đa một lần.
8. **Project Integration:** Biến thống kê khô thành mùa giải đua.
9. **Implementation:** Thấp. Tính từ `watchedDate`. Test: hòa nhau thì không kích hoạt; năm chưa kết thúc thì chỉ hiện `Mùa giải đang diễn ra`.

#### E16. It's the Pictures That Got Small
1. **Category:** Meta · Humor (trạng thái lỗi).
2. **Core Idea:** Trailer không có thì rạp trả lời bằng tự ái của một ngôi sao màn bạc.
3. **Reference:** *Đại Lộ Hoàng Hôn (Sunset Boulevard)* (1950). "I am big. It's the pictures that got small." và "All right, Mr. DeMille, I'm ready for my close-up." **[Có thật]**.
4. **Trigger:** Phim đã chiếu. Mở phòng chiếu của một phim **không có trailer**.
5. **User Experience:** Thay cho "Chưa có trailer" là `I am big. It's the pictures that got small.`, kèm gợi ý mở app nền tảng (giữ thông tin hữu ích).
6. **Payoff:** Mở phòng chiếu của chính *Sunset Boulevard*: poster từ từ phóng to toàn màn hình với dòng `Ready for my close-up.`
7. **Rarity:** Thường, khi đã thức.
8. **Project Integration:** Biến một trạng thái trống có thật thành một câu thoại.
9. **Implementation:** Rất thấp. Test: thông tin hành động (mở nền tảng) vẫn phải hiển thị.

---

## Hệ thống huy hiệu Mùa 2 · Sổ Cuống Vé

**Cơ chế:** mỗi phát hiện để lại một **cuống vé** trong "Sổ Cuống Vé" (mục mới trong Bảng vàng). Cuống chưa có chỉ hiện **bóng in mờ và số ghế**, không có tên. Cuống có rồi hiện tên, ngày và một dòng thoại. Huy hiệu là một số cuống đặc biệt, được ghi vào ledger chung trên server. Cuống thường chỉ lưu trên máy từng người.

| # | Huy hiệu | Nhóm | Mô tả (hiện sau khi mở) | Điều kiện kiểm thử được | Độ hiếm | Phản hồi | Liên kết |
|---|---|---|---|---|---|---|---|
| B1 | **Thợ Rửa Ảnh** | Khám phá | `Bạn đã đánh thức ba cuộn phim.` | Kích hoạt ≥ 3 egg thuộc nhóm I/III | Thường | Cuống vé lật, tiếng tách máy ảnh (nếu bật âm) | Mở dòng gợi ý "Cuộn phim này đang ngủ" |
| B2 | **McMurphy's Console** | Hài | `Bạn đã thử. Đó là tất cả những gì chúng tôi yêu cầu.` | E4 | Không thường | Nút rung, câu thoại | E4 |
| B3 | **Cả Nhà Đều Có Động Cơ** | Cộng đồng | `It was all of you.` | E5: phim đủ phiếu của mọi thành viên được chiếu | Hiếm | Con dấu ALL SUSPECTS chuyển thành CASE CLOSED | E5, Knives Out |
| B4 | **Hypersleep** | Kiên trì | `Bạn đã ngủ 30 ngày và vẫn quay về.` | E6 | Theo hoàn cảnh | Màn tỉnh dậy kèm tóm tắt | E6 |
| B5 | **Mười Hai Tuổi** | Cộng đồng | `Năm thứ N. Vẫn chưa ai đồng ý phim nào hay nhất.` | E7, một lần mỗi năm | Huyền thoại | Gõ chữ ở chân trang | E7, Stand by Me |
| B6 | **Bạn Của Người Chiếu Phim** | Kiên trì · Bí mật | `Tôi là căn phòng.` | Đọc đủ 12 trang (E8) | Hiếm | Trang 12, mục Hồ sơ mật | E8, E10, THE HOUSE IS THE WITNESS |
| B7 | **Friendo** | Hài · Bí mật | `Bạn đã thua đồng xu. Thứ hạng thì không.` | Tung xu 3 lần (E11) | Hiếm | Câu hỏi của Chigurh | E11, Chuỗi B |
| B8 | **Photo Finish** | Bí mật | `Xuất phát lùi hơn, về đích cùng lúc.` | E12 xảy ra | Hiếm | Khung ảnh đen trắng | E12 |
| B9 | **Verse-Jumper** | Meta | `Ở một vũ trụ khác, phim đã chọn xong rồi.` | E13 tầng 1 | Không thường | Mắt nhựa trên logo | E13 |
| B10 | **Ba Ô Một Tim** | Hiếm | `Amaze amaze amaze.` | E14 | Hiếm | Ba ô khớp lại | E14, đối xứng "Hội đồng tan vỡ" |
| B11 | **1976** | Cộng đồng · Theo năm | `Một điểm. Không mưa.` | E15 | Huyền thoại | Cờ ca-rô | E15, Chuỗi C |
| B12 | **Phòng Máy** | Meta · Ẩn | `Bạn không nên ở đây. Rất vui vì bạn ở đây.` | E10 | Hiếm | Trang 0 | E10, E8 |
| B13 | **Cuộn Phim Trọn Vẹn** | Huyền thoại (meta) | `Every reel is awake.` | Đánh thức mọi cuộn phim của các phim **đã chiếu** + đủ B1–B12 | Huyền thoại | Sổ Cuống Vé gập lại thành tờ contact sheet các buổi chiếu thật, theo thứ tự thời gian | Nối mọi thứ, mở đường cho THE HOUSE IS THE WITNESS |

8 thành tích Mùa 1 giữ nguyên và cũng được in thành cuống vé, để toàn bộ hệ thống nằm trong một cuốn sổ.

---

## Bản đồ liên kết

```
                    ┌──────── Logo / House note ────────┐
                    │  E8 Sổ tay (12 trang) ── B6        │
   Console E10 ── B12 ──┘          └── ⌁ ── Chuỗi A Missing Frame
                                              │
   Memento E1 ─(Polaroid ⌁)────────────────────┘

   Vòng quay ── E3 Moonwalk ── cuống Motown 25  Thắng giả (Mùa 1) ── ♧ ── Chuỗi B House Edge
        ├── E12 Photo Finish ── B8                                     │
        └── E4 McMurphy (veto cạn) ── B2                          hòa hạng #1
                                                                       │
   Bảng vàng ── E2 Drive My Car (40s) ── ghi chú thật           E11 Call It ── B7
        ├── E14 Amaze ×3 ── B10  ⟷ (đối xứng) Hội đồng tan vỡ (Mùa 1)
        └── Sổ Cuống Vé ── B13 Cuộn Phim Trọn Vẹn ── THE HOUSE IS THE WITNESS (Mùa 1)

   Kho phim ── E5 ALL SUSPECTS (Knives Out, đang có) ── B3
   Lịch chiếu ── E9 Bữa tối dạng lỏng
   Thống kê ── E15 Won by One Point ── B11 ── Rush ── Chuỗi C A-13
   Giao diện ── E13 Verse-Jumping ── B9
   Thời gian ── E6 Hypersleep ── B4      ── E7 Mười Hai Tuổi ── B5
```

Vòng khám phá: **tò mò** (dòng "Cuộn phim này đang ngủ") → **thử** (chiếu phim, bấm, chờ) → **phát hiện** → **phản hồi** (câu thoại, con dấu) → **cuống vé** → **ô trống tiếp theo trong sổ gợi ý** (số ghế, bóng in) → **kể cho hội** (phần lớn egg cần hành vi tập thể).

---

## Nên làm trước (6 ý tưởng nổi bật nhất)

1. **E5 Everyone Had a Motive.** Đã có sẵn một ca thật (Knives Out đủ 6 phiếu), cho khoảnh khắc "Wait, what?!" ngay hôm nay, chi phí thấp.
2. **E4 At Least I Tried.** Đùa đúng vào luật đặc sản của hội, nhỏ mà ai cũng sẽ kể lại.
3. **E1 Remember Sammy Jankis.** Phim đã chiếu, có sẵn dữ liệu cảm nhận thật, nối được Chuỗi A.
4. **E2 Bốn Mươi Phút.** Dùng ghi chú hội đồng có thật làm punchline.
5. **Dòng "Cuộn phim này đang ngủ"** cùng **Sổ Cuống Vé.** Đây là khung của cả Mùa 2; làm sớm để mọi egg sau đều có chỗ ghi nhận.
6. **E6 Hypersleep.** Vừa vui vừa có ích thật cho người quay lại.

## Lộ trình

| Đợt | Nội dung | Độ phức tạp | Ghi chú |
|---|---|---|---|
| **1 · Khung** | Registry "cuộn phim" theo tên phim; dòng "đang ngủ"; Sổ Cuống Vé (bóng in, số ghế) | Thấp–TB | Không cần thay đổi server |
| **2 · Đang thức** | E1, E2, E3 (Memento, Drive My Car, Michael: đã chiếu) và E5 | Thấp–TB | E3 cần test thống kê công bằng |
| **3 · Cơ chế hội** | E4, E6, E7, E8, E9, E10 | Thấp | Chủ yếu ở client và `localStorage` |
| **4 · Đang ngủ** | E11–E16, đánh thức dần khi hội chiếu từng phim | Thấp–TB | Ledger thêm `UNANIMOUS`, `PHOTO_FINISH` |
| **5 · Huyền thoại** | B13 và nối với THE HOUSE IS THE WITNESS | TB | Cần đủ dữ liệu cả mùa |

## Đo lường (không theo dõi cá nhân)

- **Tỉ lệ khám phá mỗi egg:** số lần kích hoạt / số phiên. Đề xuất một endpoint đếm ẩn danh `POST /api/eggs/found {eggId}`, chỉ cộng một số đếm, không lưu ai.
- **Thời gian đến lần khám phá đầu tiên** sau khi một cuộn phim thức.
- **Tác động lên hành vi cốt lõi:** số phim được chiếu mỗi tháng trước và sau Mùa 2, và tỉ lệ phim được chọn trong số các phim có cuộn phim đang ngủ.
- **Giữ chân:** số người quay lại sau ≥ 30 ngày (dựa trên E6).
- **Mức độ chịu đựng:** tỉ lệ đóng thông báo ngay dưới 1 giây. Cao nghĩa là quá phiền, cần giảm tần suất.
- **Định tính:** đếm số lần hội nhắc tới một câu thoại trong nhóm chat. Đây là thước đo thật của một inside joke.

## Bước 6 · Kiểm tra chất lượng

| Tiêu chí | Đánh giá |
|---|---|
| Độc đáo | Mọi egg nhóm I/III bám vào **một phim cụ thể trong kho của hội**; không dùng được nguyên xi ở sản phẩm khác |
| Hài hước | Dựa vào callback (đồng xu ⟷ House Edge, Amaze ⟷ Tan vỡ, trang 12 ⟷ THE HOUSE IS THE WITNESS) và dữ liệu thật (ghi chú, mồi, 6 phiếu) |
| Khả thi | Tất cả chạy trên kiến trúc hiện có (ledger Firestore, `localStorage`, canvas); không cần dịch vụ mới |
| Nhất quán | Một giọng nói (người lưu trữ/người chiếu phim), một vật phẩm (cuống vé), một luật (kết quả thiêng liêng) |
| Truy cập | Mọi thao tác chuột có phương án bàn phím/chạm; tôn trọng giảm chuyển động và tắt âm; dùng thông báo `aria-live` |
| Nguy cơ khó chịu | Có cooldown và nổ một lần; không chặn thao tác; không đùa vào người; danh sách phim và chủ đề cấm ở Bước 2 |

## Cần bạn xác nhận

1. **Inside joke có thật** của hội (biệt danh, câu cửa miệng, sự cố đáng nhớ trong các buổi chiếu). Đây là nguyên liệu tốt nhất cho các trang Sổ tay E8.
2. Có đồng ý **"người chiếu phim là căn phòng ở nhà Lộc"** làm lore không?
3. **Giọng rạp:** giữ tiếng Anh deadpan như Mùa 1, hay chuyển sang tiếng Việt, hay pha cả hai?
4. **Chủ đề cấm đùa** nào khác ngoài danh sách ở Bước 2?
