# GAY GANG CINEMA · Mùa 2: Cuộn Phim Ngủ Đông

> Thiết kế hệ thống easter egg, huy hiệu và vòng khám phá cho GGMV 2.0. Bản 2, ngày 2026-10-22.
> Kế thừa hệ thống đã chạy (`src/easterEggs.ts`, ledger `easterEggs` trên Firestore): 8 thành tích, 3 chuỗi manh mối A/B/C, Hồ sơ mật, House note. Tài liệu này **mở rộng**, không thay thế.
>
> **Thay đổi so với bản 1:** bản 1 gắn bí mật vào 24 tựa phim cụ thể, nên phim mới thêm vào không có gì, còn phim xem xong thì cạn. Bản 2 gắn bí mật vào **đặc điểm** của phim (đạo diễn, thể loại, thập niên, thời lượng, điểm số, cách hội vote) và cho **thành viên tự viết bí mật**. Kho phim lớn lên thì thế giới bí mật lớn lên theo.

Nhãn độ tin cậy cho mọi reference điện ảnh:

- **[Có thật]**: chi tiết có trong phim hoặc lịch sử, kiểm chứng được.
- **[Có thật · tiểu thuyết]**: có trong sách gốc; bản phim chưa kiểm chứng có giữ hay không.
- **[Hư cấu trong phim]**: khái niệm do chính bộ phim bịa ra.
- **[Sáng tác]**: ý tưởng của hệ thống này, không phải trivia.

---

## Bước 1 · Phân tích dự án

**Điểm chạm có sẵn trong code:**

| Mảng | Điểm chạm có thể gắn easter egg |
|---|---|
| Kho phim | Thẻ phim, trang chi tiết, vote, thêm phim qua OMDb (tự điền đạo diễn, thể loại, năm, thời lượng) |
| Vòng quay | Kim chỉ, góc dừng, tỷ lệ %, buff x2, luật nghỉ lượt, veto 3 lá/tháng, thắng giả 10%, Tiên tri |
| Bảng vàng | Thứ hạng, 3 giám khảo Teng / Lộc / Thành (thang 0–10, bước 0.05), tìm kiếm, Hồ sơ mật |
| Lịch chiếu | Đếm ngược, điểm danh (có mặt / muộn / bận), phân công mồi |
| Giao diện | 8 bảng màu, sáng / tối, theo mùa, bật tắt âm thanh |
| Giọng nói của rạp | Tiếng Anh khô, deadpan ("The committee has declined to interpret this.") |

**Dữ liệu sinh ra chất liệu mới theo thời gian** (đây là thứ giữ cho hệ thống không cạn):

- Mỗi phim mới mang theo **đạo diễn, thể loại, năm, thời lượng** từ OMDb.
- Mỗi buổi chiếu sinh ra **điểm giám khảo, ghi chú hội đồng, cảm nhận, điểm danh, mồi**.
- Mỗi lượt quay sinh ra **góc dừng, veto, lời tiên tri**.

**Chất liệu riêng của hội, có thật trong dữ liệu hiện tại** (dùng làm ví dụ, không làm giới hạn):

- *Knives Out* có phiếu của **cả 6 thành viên**.
- Lộc "góp mồi" bằng **Phòng Máy Chiếu 120-Inch & Loa 5.1**; buổi chiếu ở **phòng khách nhà Lộc**.
- *The Last Waltz* được đề xuất bởi **"Hệ thống"**.
- Ghi chú hội đồng toàn kiểu cụt lủn: "oke", "bth", "tinh duc va quai di".

## Bước 2 · Creative direction

**Một câu:** *Mỗi bộ phim bước vào kho đều mang theo một bí mật. Cách duy nhất để mở nó là cả hội cùng xem.*

Nguyên tắc:

1. **Kết quả là thiêng liêng.** Không easter egg nào đổi phim trúng, điểm, thứ hạng hay veto. Chỉ đổi lời, hình, tiếng.
2. **Gắn vào đặc điểm, không gắn vào tên phim.** Một bí mật phải áp được cho cả những phim hội *chưa* thêm vào kho.
3. **Hội là tác giả.** Thành viên viết được bí mật cho chính phim mình đề xuất; hệ thống chỉ là người giữ két.
4. **Bí mật khiến người ta muốn xem thêm phim.** Phần thưởng lớn nhất là lý do để chiếu bộ tiếp theo.
5. **Một lần là đủ.** Mỗi trò đùa có cooldown hoặc chỉ nổ một lần mỗi người; nhiều câu thoại xoay vòng để không lặp.
6. **Không có ngõ cụt.** Mọi bí mật đều bỏ qua được, quay về đúng trạng thái cũ, và có cách kích hoạt không cần chuột.

**Phong cách hài:** deadpan + callback. Rạp nói như một nhân viên lưu trữ mệt mỏi nhưng tận tâm. Trò đùa nhắm vào *tình huống*, không nhắm vào *người*.

**Ranh giới, không đùa với:**

- Phim về **thảm kịch hoặc tội ác có thật** (diệt chủng, vụ án có thật, xâm hại). Tự động loại theo danh sách loại trừ (xem §4.6). Hiện có: *Schindler's List*, *The Pianist*, *Hồi Ức Kẻ Sát Nhân*, *Cuộc Săn Lùng (The Hunt)*. Những phim này chỉ nhận cơ chế trung lập.
- Đời tư hoặc cáo buộc về người thật; chấn thương có thật.
- Xu hướng tính dục: tên hội là bản sắc tự chọn của hội, hệ thống không đùa về nó.
- Gắn nhãn tiêu cực vĩnh viễn cho một thành viên.

## Bước 3 · Các hướng concept

| Hướng | Ý tưởng | Đánh giá |
|---|---|---|
| A. Người Chiếu Phim | Nhân vật vô hình, chỉ xuất hiện qua ghi chú | Tốt cho giọng kể và running gag |
| B. Cuộn phim theo tên phim (bản 1) | Mỗi tựa phim cụ thể có một bí mật | **Loại bỏ làm xương sống:** bó buộc, cạn nhanh, không mở rộng |
| **C. Cuộn phim theo đặc điểm** | Bí mật bám vào đạo diễn, thể loại, thập niên, thời lượng, điểm số, cách vote | **Chọn làm xương sống:** phim nào cũng có, kể cả phim chưa thêm |
| **D. Bí mật hội tự viết** | Người đề xuất cất một bí mật vào phim; mở ra sau buổi chiếu | **Chọn:** nguồn bí mật vô hạn, và là lore có thật của hội |
| E. Sổ Cuống Vé | Mỗi phát hiện để lại một cuống vé | **Chọn làm lớp phần thưởng** |

**Kết hợp:** C và D là nơi bí mật sống, E là nơi ghi lại, A là giọng kể.

---

## Bước 4 · Kiến trúc: 5 tầng cuộn phim

Một phim có thể mang **nhiều cuộn** cùng lúc, mỗi tầng một cuộn. Mỗi lần chiếu, **tối đa một cuộn** được đánh thức và trình diễn: ưu tiên tầng cao hơn, cùng tầng thì chọn theo ngày (không ngẫu nhiên từng khung hình). Các cuộn còn lại vẫn ngủ, chờ lần mở hồ sơ sau. Nhờ vậy một phim không cạn sau một lần.

| Tầng | Nguồn | Áp cho phim mới? | Ai thêm được |
|---|---|---|---|
| **T1 · Cơ chế của hội** | Hành vi trong app (veto, vote, điểm, lịch, giao diện) | Không phụ thuộc phim | Dev |
| **T2 · Hoa văn** | Thể loại, thập niên, thời lượng, điểm số | **Có, tự động** | Dev (sửa file cấu hình) |
| **T3 · Chữ ký đạo diễn** | Trường `director` từ OMDb | **Có, tự động** khi đạo diễn có trong sổ | Dev hoặc curator (sửa file cấu hình) |
| **T4 · Cuộn đặc tuyển** | Danh sách tựa phim nổi tiếng có trivia riêng | Có, nếu phim nằm trong danh sách | Curator |
| **T5 · Bí mật hội tự viết** | Người đề xuất viết lúc thêm phim | **Có, mọi phim** | **Bất kỳ thành viên nào** |

Cấu hình T2–T4 nằm trong **một file dữ liệu** (`src/data/reels.ts`): thêm một mục là xong, không cần sửa component.

```ts
// Ví dụ một mục cấu hình
{ id: 'decade-80s', layer: 'pattern', match: { yearFrom: 1980, yearTo: 1989 },
  effect: 'vhs-rewind', lines: ['Be kind, rewind.'], label: 'Có thật' }
{ id: 'dir-nolan', layer: 'director', match: { director: /christopher nolan/i },
  effect: 'reverse-order', lines: ['Played in reverse. As intended.'], label: 'Có thật' }
```

---

## Bước 4–5 · Hệ thống easter egg

### T1 · Cơ chế của hội (không phụ thuộc phim)

#### E1. At Least I Tried
1. **Category:** Interaction · Humor.
2. **Core Idea:** Lá veto đã hết vẫn bấm được, để thất bại cho thật đẹp.
3. **Reference:** *One Flew Over the Cuckoo's Nest* (1975). McMurphy cố nhấc bàn điều khiển và thất bại: "But I tried, didn't I? Goddamnit, at least I did that." **[Có thật]**. Câu thoại dùng cho mọi tình huống hết veto, không cần phim đó nằm trong kho.
4. **Trigger:** Giám khảo đã dùng hết 3 lá trong tháng, bấm nút veto của mình (hiện bị khóa, Mùa 2 cho bấm).
5. **User Experience:** Nút rung ngang 300ms, chữ đổi thành `…`, rồi hiện `But I tried, didn't I?`. Không gọi API, không hủy kết quả.
6. **Payoff:** Câu thoại xoay vòng theo tháng (pool thất bại điện ảnh **[Có thật]**, ví dụ "Houston, we have a problem." từ *Apollo 13*). Cuống vé "McMurphy's Console".
7. **Rarity:** Không thường. Cần một giám khảo đốt sạch veto.
8. **Project Integration:** Đùa với luật veto 3 lá/tháng, đặc sản của hội.
9. **Implementation:** Thấp. Đổi `disabled` thành `aria-disabled` cùng thông báo. Test: tuyệt đối không gọi `/api/veto/use`.

#### E2. Everyone Had a Motive
1. **Category:** Narrative · Community.
2. **Core Idea:** Phim được **mọi thành viên** vote thành "vụ án" mà ai cũng là nghi phạm.
3. **Reference:** *Knives Out* (2019), nơi cả gia đình đều có động cơ **[Có thật]**. Áp cho **mọi phim** đủ phiếu.
4. **Trigger:** Phim chưa xem có phiếu của tất cả thành viên. *Hiện có một ca: Knives Out, đủ 6 phiếu.*
5. **User Experience:** Thẻ phim hiện con dấu `ALL SUSPECTS`; trang chi tiết liệt kê người vote như danh sách nghi phạm; động cơ của người đề xuất lấy từ lý do đề xuất (`whyWatch`), người khác ghi `Động cơ: đã bấm vote.`
6. **Payoff:** Nếu vòng quay chọn đúng phim đó: `The detective has reached a conclusion: it was all of you.` Nếu chính phim đó là *Knives Out*: thêm dòng `Lần này thám tử thậm chí không cần tới bánh donut.` (callback bài phát biểu "donut hole" của Benoit Blanc **[Có thật]**).
7. **Rarity:** Hiếm theo bản chất (cần cả hội).
8. **Project Integration:** Phần thưởng cho hành vi tập thể.
9. **Implementation:** Thấp. So `votes` với `BROTHERS_LIST`.

#### E3. Hypersleep
1. **Category:** Dynamic · Utility-humor.
2. **Core Idea:** Lâu không vào thì app đánh thức bạn như phi hành gia, kèm bản tóm tắt.
3. **Reference:** Motif ngủ đông trong sci-fi, ví dụ *Alien*, *Pandorum* **[Có thật]**; "Pandorum" là chứng loạn thần do phim bịa **[Hư cấu trong phim]**.
4. **Trigger:** Lần truy cập cách lần trước ≥ 30 ngày.
5. **User Experience:** Màn tối 1.5 giây `HYPERSLEEP · 34 NGÀY`, sau đó thẻ tóm tắt thật: `Trong lúc bạn ngủ: 3 phim đã chiếu, 2 phim mới, bạn còn 3 lá veto.`
6. **Payoff:** Có ích thật cho người quay lại. Cuống vé "Hypersleep".
7. **Rarity:** Theo hoàn cảnh.
8. **Project Integration:** Biến bài toán giữ chân người dùng thành trò đùa có ích.
9. **Implementation:** Thấp. Dùng `localStorage` cùng `watchedDate`/`createdAt`.

#### E4. Mười Hai Tuổi
1. **Category:** Narrative · Theo năm.
2. **Core Idea:** Đúng ngày hội chiếu bộ phim đầu tiên, rạp nhớ.
3. **Reference:** *Stand by Me* (1986), câu gõ máy cuối phim: "I never had any friends later on like the ones I had when I was twelve. Jesus, does anyone?" **[Có thật]**.
4. **Trigger:** Hôm nay trùng ngày–tháng của buổi chiếu đầu tiên, từ năm thứ 2.
5. **User Experience:** Dòng credit cuối trang gõ ra từng chữ: câu trên, rồi `Gay Gang Cinema · năm thứ N · bắt đầu bằng [tên phim đầu tiên]`.
6. **Payoff:** Thành tích cộng đồng "Mười Hai Tuổi", ghi theo năm.
7. **Rarity:** Một ngày mỗi năm.
8. **Project Integration:** Ngày chiếu đầu tiên là dữ liệu có thật của hội.
9. **Implementation:** Thấp. Dùng lại `firstScreeningDate()`.

#### E5. Sổ Tay Người Chiếu Phim
1. **Category:** Narrative · Running gag.
2. **Core Idea:** House note trên logo thành **nhật ký nhiều trang**, mỗi ngày một trang, về người chiếu phim vô hình.
3. **Reference:** **[Sáng tác]**.
4. **Trigger:** Rê/focus logo khoảng 1 giây; mỗi **ngày khác nhau** mở trang kế tiếp.
5. **User Experience:** Trang được **sinh từ dữ liệu thật** chứ không cố định 12 trang. Ví dụ:
   - `Day 1. Máy chiếu 120 inch. Không ai hỏi tôi có muốn ở đây không.`
   - `Tuần trước ai đó chấm 2.0 cho [tên phim]. Tôi đã tắt đèn sớm hơn một chút.` (lấy điểm thấp nhất có thật)
   - `[Thành viên] vừa đề xuất phim thứ 10. Tôi đã bắt đầu chuẩn bị tinh thần.`
   - Trang cuối của mỗi mùa: `Tôi không phải người chiếu phim. Tôi là căn phòng.`
6. **Payoff:** Đọc hết các trang của mùa thì nhận thành tích "Bạn Của Người Chiếu Phim" và một mục Hồ sơ mật.
7. **Rarity:** Kiên trì.
8. **Project Integration:** Lore "phòng máy chiếu nhà Lộc" (*cần bạn duyệt*). Trang tự sinh nên không bao giờ cạn.
9. **Implementation:** Thấp–TB. Bộ khung câu (template) cộng dữ liệu, lưu tiến độ trên `localStorage`.

#### E6. Dinner Is a Liquid
1. **Category:** Meta · Humor.
2. **Core Idea:** Rạp đọc danh sách mồi và có nhận xét.
3. **Reference:** **[Sáng tác]**.
4. **Trigger:** Danh sách mồi có ≥ 2 món là đồ uống có cồn và không có món ăn nào.
5. **User Experience:** Dưới tiêu đề "Mồi nhậu": `Bữa tối tuần này ở dạng lỏng.`
6. **Payoff:** Ai "góp mồi" bằng thứ không ăn được (ví dụ "Phòng Máy Chiếu 120-Inch", có thật trong dữ liệu) thì hiện `Đã ghi nhận. Không khuyến khích ăn.`
7. **Rarity:** Thường.
8. **Project Integration:** Dữ liệu buổi chiếu có thật.
9. **Implementation:** Thấp. Danh sách từ khóa có dấu và không dấu.

#### E7. Photo Finish
1. **Category:** Visual · Rare event.
2. **Core Idea:** Kim chỉ dừng sát vạch giữa hai lát, rạp xem lại như ảnh về đích.
3. **Reference:** Ảnh về đích trong đua xe/điền kinh; Le Mans 1966, Ken Miles mất chiến thắng vì đối thủ xuất phát lùi hơn **[Có thật]**.
4. **Trigger:** Lượt quay dừng trong vòng 1.5% độ rộng lát tính từ vạch.
5. **User Experience:** Vòng quay đóng băng 600ms, khung ảnh đen trắng phóng vùng kim chỉ, con dấu `PHOTO FINISH`.
6. **Payoff:** `Ban tổ chức xác nhận: phim kia xuất phát lùi hơn.` Phim trúng không đổi.
7. **Rarity:** Khoảng 3% lượt quay, xác suất thật.
8. **Project Integration:** Vật lý của vòng quay canvas.
9. **Implementation:** TB. Test: không đổi `winningSlice`.

#### E8. Verse-Jumping
1. **Category:** Interaction · Meta.
2. **Core Idea:** Nhảy qua đủ 8 vũ trụ màu.
3. **Reference:** *Everything Everywhere All at Once* (2022): verse-jump bằng một hành động kỳ quặc; mắt nhựa; vũ trụ hòn đá **[Có thật]**.
4. **Trigger:** Chọn đủ 8 bảng màu khác nhau trong 60 giây.
5. **User Experience:** Logo GG mọc cặp mắt nhựa trong phần còn lại của phiên: `You have visited every universe. In one of them, we already picked a movie.`
6. **Payoff:** Tầng 2: để yên 2 phút ở chế độ tối thì hai hòn đá có mắt nhựa hiện ở chân trang.
7. **Rarity:** Không thường, rồi đến hiếm.
8. **Project Integration:** Easter egg duy nhất dùng bộ bảng màu.
9. **Implementation:** Thấp. Đếm trong `AppearanceMenu`.

#### E9. Amaze Amaze Amaze
1. **Category:** Narrative · Rare.
2. **Core Idea:** Ba giám khảo cho điểm y hệt nhau.
3. **Reference:** Câu thoại xoay vòng từ pool "đồng thuận tuyệt đối". Mặc định là Rocky trong *Project Hail Mary*, lặp từ ba lần để nhấn mạnh **[Có thật · tiểu thuyết]**.
4. **Trigger:** Lưu điểm Teng = Lộc = Thành.
5. **User Experience:** Ba ô điểm khớp thành một ô, kèm con dấu `AMAZE AMAZE AMAZE`.
6. **Payoff:** Thành tích "Ba Ô Một Tim". Đối xứng với "Hội đồng tan vỡ" của Mùa 1.
7. **Rarity:** Hiếm (bước 0.05).
8. **Project Integration:** Bộ đôi bất đồng và đồng thuận.
9. **Implementation:** Thấp. Ledger thêm `UNANIMOUS`.

#### E10. Won by One Point
1. **Category:** Narrative · Cuối năm.
2. **Core Idea:** Cuộc đua đề xuất của năm phân định bằng một phim.
3. **Reference:** F1 1976: Hunt hơn Lauda đúng 1 điểm; Lauda bỏ cuộc ở Fuji vì mưa **[Có thật]**.
4. **Trigger:** Ngày 31/12, hai người đề xuất dẫn đầu chênh đúng 1 phim được chiếu trong năm.
5. **User Experience:** Cờ ca-rô trong Thống kê: `Phân định bằng một phim. Năm nay không ai đổ lỗi cho trời mưa.`
6. **Payoff:** Thành tích "1976".
7. **Rarity:** Mỗi năm tối đa một lần.
8. **Project Integration:** Thống kê thành mùa giải.
9. **Implementation:** Thấp.

#### E11. Phòng Máy Chiếu (Console)
1. **Category:** Meta.
2. **Core Idea:** Ai mở DevTools sẽ bước vào phòng máy.
3. **Reference:** **[Sáng tác]**.
4. **Trigger:** Mở console.
5. **User Experience:** ASCII `GG`, dòng `Bạn đã vào phòng máy chiếu. Đừng chạm vào cuộn phim.`, gợi ý `ggmv.projectionist()`.
6. **Payoff:** Trang 0 của Sổ tay, cuống vé ẩn "Phòng Máy".
7. **Rarity:** Hiếm.
8. **Project Integration:** Nối với E5.
9. **Implementation:** Rất thấp. Không lộ dữ liệu nội bộ.

### T2 · Hoa văn (tự áp cho mọi phim, kể cả phim chưa thêm)

Mỗi hoa văn thức dậy khi **phim mang hoa văn đó được chiếu**. Lúc phim chưa chiếu, trang chi tiết chỉ ghi "Cuộn phim này đang ngủ."

#### E12. Thập niên (Decade Reels)
1. **Category:** Visual · Cinematic.
2. **Core Idea:** Hồ sơ phim mang dấu vết công nghệ của thời nó ra đời.
3. **Reference:**
   - **Trước 1960:** intertitle phim câm, poster đen trắng **[Có thật, lịch sử điện ảnh]**.
   - **1980s:** nhãn băng VHS "Be kind, rewind" **[Có thật]**.
   - **1990s:** "Please rewind" cùng sọc nhiễu tracking.
   - **2020s:** `Đã xem bản 4K. Vẫn chưa ai hiểu kết phim.` **[Sáng tác]**.
4. **Trigger:** Mở hàng của phim đã chiếu trong Bảng vàng.
5. **User Experience:** Ví dụ phim năm 1983: rê poster thì 0.4 giây sọc VHS chạy qua, và dưới năm phát hành hiện `Be kind, rewind.`
6. **Payoff:** Đủ 5 thập niên khác nhau thì nhận huy hiệu **"Cỗ Máy Thời Gian"**.
7. **Rarity:** Thường đến không thường; tự tăng khi kho đa dạng.
8. **Project Integration:** Khuyến khích hội đề xuất phim nhiều thời đại.
9. **Implementation:** Thấp. Dựa trên `movie.year`.

#### E13. Thời lượng (Runtime Reels)
1. **Category:** Cinematic · Meta.
2. **Core Idea:** Phim dài có giải lao, phim ngắn được khen gọn.
3. **Reference:** Phim dài thời hoàng kim có màn giải lao (*Lawrence of Arabia*) **[Có thật]**; *Drive My Car* (179 phút) để tên phim hiện sau khoảng 40 phút **[Có thật]**.
4. **Trigger:**
   - **≥ 170 phút:** ở yên trên hàng của phim 40 giây thì title card trễ hiện ra `Opening credits. Right on schedule.`
   - **≥ 150 phút:** đếm ngược buổi chiếu có thêm dòng `Có giải lao không? Không.`
   - **≤ 90 phút:** `Gọn. Ban giám khảo cảm ơn.`
5. **User Experience:** Không báo trước, tự lui sau 4 giây.
6. **Payoff:** Ghi chú hội đồng có thật của phim (nếu có) được trình bày như phụ đề: `Ban giám khảo đã ghi nhận.`
7. **Rarity:** Thường.
8. **Project Integration:** Thời lượng là thứ hội thật sự cân nhắc (bộ lọc "< 2 tiếng" trên vòng quay).
9. **Implementation:** Thấp. Bỏ qua phim có thời lượng mặc định 120 (khả năng chưa có dữ liệu thật).

#### E14. Thể loại (Genre Reels)
1. **Category:** Visual · Humor.
2. **Core Idea:** Mỗi thể loại có một phản xạ nhỏ, chỉ hiện ở khoảnh khắc liên quan.
3. **Reference:** Quy ước thể loại, **[Sáng tác]** trên nền quy ước có thật.
4. **Trigger và trải nghiệm** (mỗi dòng một cuộn):
   - **Kinh dị**, được vòng quay chọn sau 22h: màn công bố "mất" một khung hình (nháy đen 80ms) với dòng `Máy chiếu vừa do dự.`
   - **Hài hước**: điểm trung bình < 5 thì `Phim hài, không ai cười. Đây mới là trò đùa.`
   - **Khoa học viễn tưởng**: điểm hiển thị kèm dạng nhị phân khi rê chuột `8.50 = 1000.1₂`.
   - **Hoạt hình**: đúng 12 khung hình nhấp nháy cờ "đã xem" (hoạt hình truyền thống thường vẽ 12 khung/giây, "on twos" **[Có thật]**).
   - **Tài liệu / Tiểu sử**: con dấu `BASED ON A TRUE STORY` lên hồ sơ, rồi dấu nhỏ `(the archive checked)`.
   - **Âm nhạc**: giữ Shift khi bấm Quay thì vòng quay chạy ngược ("moonwalk", Michael Jackson, Motown 25, 1983 **[Có thật]**); kim chỉ đổi chữ `Same odds. Better footwork.`
5. **User Experience:** Mỗi phim chỉ trình diễn một cuộn mỗi lần (luật §4).
6. **Payoff:** Đánh thức đủ cuộn của 6 thể loại thì nhận huy hiệu **"Đa Thể Loại"**.
7. **Rarity:** Thường, rải đều.
8. **Project Integration:** Dùng đúng danh sách thể loại tiếng Việt mà app map từ OMDb.
9. **Implementation:** TB. "Moonwalk" bắt buộc test công bằng: góc dừng vẫn chọn đều trong [0, 2π), chỉ đảo chiều chuyển động; 10.000 lượt cho phân phối không đổi.

#### E15. Điểm số (Score Reels)
1. **Category:** Narrative.
2. **Core Idea:** Con số tự kể chuyện.
3. **Reference:** **[Sáng tác]**, mở rộng từ "Under review 6.66" của Mùa 1.
4. **Trigger và trải nghiệm:**
   - **Trung bình đúng 4.20 hoặc 6.90:** `Ban giám khảo phủ nhận mọi ý đồ.`
   - **Trung bình .00 tròn:** `A suspiciously tidy verdict.` (lấy từ bộ câu "Rạp tự cà khịa" của Mùa 1)
   - **Một giám khảo chấm 10 và một người chấm < 5:** hai ô điểm nhìn nhau (xoay nhẹ 4°) và tooltip `Hai người này cần nói chuyện.`
   - **Phim được chấm thấp nhất năm** nhưng đứng đầu số vote: `Cả hội đã mong chờ nó. Đó là lỗi đầu tiên.`
5. **User Experience:** Hiện ngay trên hàng Bảng vàng, không popup.
6. **Payoff:** Câu thoại riêng cho từng số.
7. **Rarity:** Theo dữ liệu.
8. **Project Integration:** Chấm điểm 3 giám khảo là nghi lễ chính của hội.
9. **Implementation:** Thấp.

### T3 · Chữ ký đạo diễn (tự áp khi đạo diễn có trong sổ)

Trường `director` đến từ OMDb nên phim mới tự khớp. **Sổ đạo diễn** khởi đầu với các đạo diễn có phong cách nhận diện cao và trivia kiểm chứng được; mở rộng bằng cách thêm một mục cấu hình.

| Đạo diễn | Chữ ký [Có thật] | Cuộn phim (sau khi chiếu) |
|---|---|---|
| Christopher Nolan | Kể chuyện phi tuyến tính (*Memento* chạy ngược, *Tenet* đảo ngược thời gian) | Cảm nhận của phim hiện theo **thứ tự ngược**: `Played in reverse. As intended.` |
| Joel & Ethan Coen | Đồng xu của Chigurh trong *No Country for Old Men*: "Call it, friendo."; *Fargo* mở đầu bằng dòng "This is a true story" dù không phải chuyện thật | Nhãn hòa hạng có đồng xu `Call it.` → `The coin has no jurisdiction in this archive.`; hồ sơ phim ghi `This is a true story.` rồi gạch đi |
| Alfred Hitchcock | Tự xuất hiện chớp nhoáng trong phim của mình | Một **bóng người nhỏ** đứng ở góc hàng Bảng vàng trong 2 giây |
| Wes Anderson | Bố cục đối xứng, tiêu đề chương | Hàng phim tự **căn giữa đối xứng**, thêm tiêu đề `Chapter One: The Screening.` |
| Stanley Kubrick | Phối cảnh một điểm tụ đối xứng | Ba ô điểm giám khảo xếp đối xứng tuyệt đối với vạch tụ ở giữa |
| Quentin Tarantino | Hãng thuốc lá hư cấu Red Apple; góc quay từ trong cốp xe | Rê poster thì khung nhìn "từ trong cốp xe" (poster lật ngược, nhìn lên) |
| Martin Scorsese | Freeze frame kèm thoại dẫn chuyện; bài "Gimme Shelter" dùng trong nhiều phim | Màn công bố đóng băng một nhịp với dòng dẫn chuyện `Như mọi khi, hội không nghe lời ai.` |
| M. Night Shyamalan | Cú twist cuối phim; tự đóng cameo | Điểm trung bình hiện ra **sau cùng**, ngược thứ tự thông thường, kèm `Bạn có thấy trước không?` |
| Hayao Miyazaki / Studio Ghibli | Cảnh đồ ăn được vẽ rất kỹ | Buổi chiếu phim Ghibli mà danh sách mồi trống: `Không có cơm hộp Ghibli? Thất vọng.` |
| Edgar Wright | Montage cắt nhanh cho thao tác đời thường | Bấm "Đã xem" thì 3 khung cắt nhanh (vé, bỏng, ghế) trong 450ms |
| Bong Joon-ho | Motif cầu thang và tầng lớp trong *Parasite* | Chỉ áp cho phim **ngoài danh sách loại trừ**: hàng phim "bước xuống" 3 bậc khi cuộn qua |

### T4 · Cuộn đặc tuyển (tựa phim cụ thể, tùy chọn)

Dành cho phim có trivia riêng quá hay để bỏ qua. Không còn là xương sống, chỉ là phần thưởng thêm. Khởi đầu bằng các phim **đang có trong kho**, và danh sách mở cho curator bổ sung:

| Phim | Trivia [Có thật] | Cuộn |
|---|---|---|
| *Memento* | Hình xăm "remember Sammy Jankis"; Polaroid "Don't believe his lies" | Dòng xăm dưới tên phim; bấm thì Polaroid ký `Don't believe his lies.` và ký hiệu ⌁ (nối Chuỗi A) |
| *Sunset Boulevard* | "I am big. It's the pictures that got small."; "Mr. DeMille, I'm ready for my close-up." | Phòng chiếu không có trailer thì hiện câu thoại; mở phòng chiếu của chính phim thì poster phóng to: `Ready for my close-up.` |
| *Rush* | F1 1976, Hunt thắng 1 điểm | Bổ sung câu thoại cho E10; đã là mắt xích Chuỗi C (A-13) |
| *Top Gun: Maverick* | "It's not the plane, it's the pilot." | Khi phim được chọn bằng chế độ "Chia đều": `It's not the odds. It's the pilot.` |
| *The Last Waltz* | Buổi diễn chia tay của The Band (1976) | Nếu đây là phim chưa xem cuối cùng trong kho: `Bài cuối. Do Hệ thống đề xuất. Hệ thống xin phép cúi chào.` |

### T5 · Bí mật hội tự viết (nguồn vô hạn)

#### E16. Hồ Sơ Hậu Trường
1. **Category:** Narrative · Community · Dynamic.
2. **Core Idea:** Lúc thêm phim, người đề xuất được **cất một bí mật** vào phim: trivia, inside joke, lời thách đố. Bí mật bị niêm phong cho tới khi hội chiếu phim đó.
3. **Reference:** Truyền thống "phim có cảnh sau credit" **[Có thật]**: phần thưởng cho người ở lại.
4. **Trigger:** Phim được đánh dấu đã xem hoặc chấm điểm.
5. **User Experience:**
   - Lúc thêm phim: ô tùy chọn `Niêm phong một bí mật (mở sau buổi chiếu)`, kèm nhãn bắt buộc **Chuyện thật / Tin đồn / Inside joke**.
   - Trước khi chiếu: trang chi tiết hiện phong bì niêm phong `Shiba đã niêm phong một bí mật.`
   - Sau khi chiếu: phong bì mở trong Bảng vàng; bí mật hiện kèm nhãn và tên tác giả.
6. **Payoff:** Biến thể **"Lời thách đố"**: người viết đặt một câu hỏi về phim (`Con số trên tấm biển ở cảnh cuối là gì?`); thành viên trả lời đúng lần đầu thì nhận cuống vé "Thám Tử".
7. **Rarity:** Theo hội. Mỗi phim mới là một bí mật mới.
8. **Project Integration:** Chính hội viết lore; hệ thống không bịa chuyện thay hội. Nhãn Chuyện thật / Tin đồn giữ đúng tinh thần phân biệt sự thật của tài liệu này.
9. **Implementation:** TB. Thêm trường `sealedNote` và `sealedNoteLabel` vào phim. **Lưu ý bảo mật:** API `/api/movies` đang trả về mọi trường. Cần ẩn `sealedNote` khi phim chưa xem (lọc ở server), nếu không ai mở DevTools cũng đọc được trước.

---

## Hệ thống huy hiệu · Sổ Cuống Vé

Mỗi phát hiện để lại một **cuống vé**. Cuống chưa có chỉ hiện bóng in mờ và số ghế. Vì T2–T5 sinh cuộn phim theo kho, **cuốn sổ lớn dần theo kho**: thêm phim mới là có thêm ô trống mới.

| # | Huy hiệu | Nhóm | Mô tả (hiện sau khi mở) | Điều kiện kiểm thử được | Độ hiếm | Liên kết |
|---|---|---|---|---|---|---|
| B1 | **Thợ Rửa Ảnh** | Khám phá | `Bạn đã đánh thức ba cuộn phim.` | 3 cuộn bất kỳ ở T2–T5 | Thường | Mở dòng "Cuộn phim này đang ngủ" |
| B2 | **McMurphy's Console** | Hài | `Bạn đã thử.` | E1 | Không thường | E1 |
| B3 | **Cả Nhà Đều Có Động Cơ** | Cộng đồng | `It was all of you.` | E2, phim đó được chiếu | Hiếm | E2 |
| B4 | **Hypersleep** | Kiên trì | `Bạn đã ngủ 30 ngày và vẫn quay về.` | E3 | Theo hoàn cảnh | E3 |
| B5 | **Mười Hai Tuổi** | Cộng đồng · Năm | `Năm thứ N. Vẫn chưa ai đồng ý phim nào hay nhất.` | E4 | Huyền thoại | E4 |
| B6 | **Bạn Của Người Chiếu Phim** | Kiên trì · Bí mật | `Tôi là căn phòng.` | Đọc hết trang của mùa (E5) | Hiếm | E5, E11 |
| B7 | **Cỗ Máy Thời Gian** | Khám phá | `Năm thập niên. Một phòng khách.` | Phim của 5 thập niên khác nhau đã chiếu (E12) | Không thường | E12 |
| B8 | **Đa Thể Loại** | Khám phá | `Cả hội không có gu. Cả hội có tất cả các gu.` | Cuộn của 6 thể loại (E14) | Không thường | E14 |
| B9 | **Hội Điện Ảnh Tác Giả** | Khám phá | `Bạn nhận ra chữ ký của họ.` | Đánh thức 3 chữ ký đạo diễn khác nhau (T3) | Hiếm | T3 |
| B10 | **Photo Finish** | Bí mật | `Xuất phát lùi hơn, về đích cùng lúc.` | E7 | Hiếm | E7 |
| B11 | **Ba Ô Một Tim** | Hiếm | `Amaze amaze amaze.` | E9 | Hiếm | E9, đối xứng "Hội đồng tan vỡ" |
| B12 | **Người Giữ Két** | Cộng đồng | `Hội đã tự viết lịch sử của mình.` | 5 bí mật tự viết (E16) được mở | Không thường | E16 |
| B13 | **Thám Tử** | Kiên trì | `Bạn trả lời trước khi ai kịp hỏi.` | Trả lời đúng 3 lời thách đố (E16) | Hiếm | E16 |
| B14 | **Verse-Jumper** | Meta | `Ở một vũ trụ khác, phim đã chọn xong rồi.` | E8 | Không thường | E8 |
| B15 | **Phòng Máy** | Meta · Ẩn | `Bạn không nên ở đây. Rất vui vì bạn ở đây.` | E11 | Hiếm | E11, E5 |
| B16 | **Cuộn Phim Trọn Vẹn** | Huyền thoại · Theo mùa | `Every reel of the season is awake.` | Mọi cuộn của các phim **đã chiếu trong mùa** đều đã thức | Huyền thoại | Mở đường cho THE HOUSE IS THE WITNESS (Mùa 1) |

B16 tính **theo mùa** và theo phim đã chiếu, nên luôn đạt được, dù kho có bao nhiêu phim.

---

## Bản đồ liên kết

```
  PHIM MỚI THÊM VÀO KHO (OMDb: đạo diễn · thể loại · năm · thời lượng)
        │
        ├── T2 Hoa văn ── E12 Thập niên ── B7 · E13 Thời lượng · E14 Thể loại ── B8 · E15 Điểm số
        ├── T3 Chữ ký đạo diễn ─────────── B9   (Coen: đồng xu ⟷ Chuỗi B House Edge)
        ├── T4 Đặc tuyển (tùy chọn) ─────── Memento ⌁ ⟷ Chuỗi A · Rush ⟷ Chuỗi C
        └── T5 Bí mật hội tự viết ───────── B12 · B13
                     │
            "Cuộn phim này đang ngủ"  →  hội chiếu phim  →  1 cuộn thức  →  cuống vé
                     │
                 Sổ Cuống Vé ── B1 ── B16 Cuộn Phim Trọn Vẹn ── THE HOUSE IS THE WITNESS

  T1 CƠ CHẾ: Veto cạn E1 ── B2 · Cả hội vote E2 ── B3 · Hypersleep E3 ── B4 · Kỷ niệm E4 ── B5
             Sổ tay E5 ── B6 ⟷ Console E11 ── B15 · Mồi E6 · Photo Finish E7 ── B10
             Bảng màu E8 ── B14 · Đồng thuận E9 ── B11 ⟷ Hội đồng tan vỡ · Năm E10
```

Vòng khám phá: **tò mò** ("Cuộn phim này đang ngủ", phong bì niêm phong) → **thử** (chiếu phim, bấm, chờ) → **phát hiện** → **phản hồi** → **cuống vé** → **ô trống mới xuất hiện khi kho có phim mới** → **kể cho hội** (và tự viết bí mật cho phim tiếp theo).

---

## Nên làm trước

1. **Khung cuộn phim** (`src/data/reels.ts` + bộ máy chọn một cuộn mỗi lần) và **Sổ Cuống Vé.** Mọi thứ sau đều cắm vào đây.
2. **E16 Hồ Sơ Hậu Trường.** Nguồn bí mật vô hạn và là lore thật của hội.
3. **T3 với 3 đạo diễn đầu: Nolan, Coen, Hitchcock.** Áp ngay cho phim đã có và mọi phim tương lai của họ.
4. **E12 Thập niên.** Rẻ, phim nào cũng có, đa dạng ngay.
5. **E2 Everyone Had a Motive.** Có sẵn một ca thật hôm nay.
6. **E1 At Least I Tried.** Nhỏ, đúng chất hội, ai cũng sẽ kể.

## Lộ trình

| Đợt | Nội dung | Độ phức tạp | Ghi chú |
|---|---|---|---|
| **1 · Khung** | `reels.ts`, bộ chọn cuộn, dòng "đang ngủ", Sổ Cuống Vé | TB | Không đổi server |
| **2 · Tự viết** | E16 (trường mới, ẩn khi chưa xem, nhãn sự thật) | TB | Thay đổi server và form thêm phim |
| **3 · Hoa văn** | E12, E13, E14 (trừ moonwalk), E15 | Thấp | Chủ yếu là cấu hình |
| **4 · Đạo diễn** | T3 bắt đầu với 3 người, rồi mở rộng | Thấp mỗi mục | Mỗi mục là một hiệu ứng nhỏ |
| **5 · Cơ chế** | E1–E11 | Thấp–TB | Ledger thêm `UNANIMOUS`, `PHOTO_FINISH` |
| **6 · Huyền thoại** | B16 theo mùa; nối THE HOUSE IS THE WITNESS | TB | Cần đủ dữ liệu cả mùa |

## Đo lường (không theo dõi cá nhân)

- **Tỉ lệ khám phá mỗi cuộn:** số lần kích hoạt / số phiên, qua endpoint đếm ẩn danh `POST /api/eggs/found {reelId}`.
- **Độ phủ:** % phim trong kho có ít nhất một cuộn. Mục tiêu 100% nhờ T2.
- **Bí mật tự viết:** % phim mới có `sealedNote`. Đây là thước đo hội có đang "sở hữu" hệ thống không.
- **Tác động lên hành vi cốt lõi:** số phim chiếu mỗi tháng trước và sau Mùa 2.
- **Mức độ chịu đựng:** tỉ lệ đóng thông báo dưới 1 giây.
- **Định tính:** số lần một câu thoại được nhắc lại trong nhóm chat.

## Bước 6 · Kiểm tra chất lượng

| Tiêu chí | Đánh giá |
|---|---|
| Linh hoạt | Phim mới tự có cuộn qua T2/T3; T5 cho nguồn vô hạn; T4 chỉ là phần thêm |
| Độc đáo | Cuộn phim phản ứng với dữ liệu thật của hội (điểm, ghi chú, mồi, phiếu), không phải trivia chung chung |
| Hài hước | Callback xuyên mùa (đồng xu ⟷ House Edge, đồng thuận ⟷ tan vỡ, Sổ tay ⟷ THE HOUSE IS THE WITNESS) |
| Khả thi | Chạy trên kiến trúc hiện có; cấu hình tập trung một file |
| Nhất quán | Một giọng (người chiếu phim), một vật phẩm (cuống vé), một luật (kết quả thiêng liêng), một nhịp (mỗi lần một cuộn) |
| Truy cập | Có phương án bàn phím/chạm; tôn trọng giảm chuyển động và tắt âm; `aria-live` cho phát hiện |
| Rủi ro | Cooldown, không chặn thao tác, không đùa vào người; danh sách loại trừ áp tự động cho phim nhạy cảm; bí mật tự viết có nhãn sự thật và được ẩn ở server |

## Cần bạn xác nhận

1. **Inside joke có thật** của hội, làm trang mẫu cho Sổ tay E5 và ví dụ cho E16.
2. Có đồng ý lore **"người chiếu phim là căn phòng ở nhà Lộc"** không?
3. **Giọng rạp:** giữ tiếng Anh deadpan, chuyển sang tiếng Việt, hay pha cả hai?
4. **Chủ đề cấm đùa** nào khác? **Ai làm curator** (người duyệt T3/T4 và có quyền gỡ bí mật tự viết không phù hợp)?
