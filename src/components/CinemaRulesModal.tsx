import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Modal, ModalHeader } from './ui';

export interface CinemaRuleItem {
  id: string;
  code: string;
  chapter: 1 | 2 | 3;
  chapterTitle: string;
  title: string;
  summary: string;
  mechanism: string;
  badge: string;
  target: string;
}

export const CINEMA_RULES: CinemaRuleItem[] = [
  // CHƯƠNG 1
  {
    id: 'rule-1-1',
    code: '1.1',
    chapter: 1,
    chapterTitle: 'Chương I: Đề Xuất & Tỷ Lệ Xuất Hiện',
    title: 'Quyền Đề Xuất Tự Do',
    summary: 'Mọi thành viên đều có quyền thêm phim muốn xem vào danh sách chờ ở tab LIST PHIM CHƯA XEM.',
    mechanism: 'Hệ thống tiếp nhận tự do vào danh sách chờ rạp',
    badge: '📝 Đề Xuất Tự Do',
    target: 'Toàn bộ thành viên Gay Gang',
  },
  {
    id: 'rule-1-2',
    code: '1.2',
    chapter: 1,
    chapterTitle: 'Chương I: Đề Xuất & Tỷ Lệ Xuất Hiện',
    title: 'Thẻ Đỏ Premiere',
    summary: 'Phim mới nhập mặc định có trạng thái 🎬 Thẻ Đỏ Premiere và được xếp ngay vào danh sách quay ngẫu nhiên.',
    mechanism: 'Tự động kích hoạt khi thêm phim mới vào kho rạp',
    badge: '🎬 Thẻ Đỏ Premiere',
    target: 'Phim mới được đề xuất',
  },
  {
    id: 'rule-1-3',
    code: '1.3',
    chapter: 1,
    chapterTitle: 'Chương I: Đề Xuất & Tỷ Lệ Xuất Hiện',
    title: 'Giới Hạn Cú Đúp (Anti-Streak)',
    summary: 'Nếu 1 thành viên đã trúng phim 2 tuần liên tiếp, hệ thống sẽ tự động tạm khóa (Restrict) người đó ở tuần thứ 3 để đảm bảo công bằng cho cả hội.',
    mechanism: 'Tự động tạm khóa ở tuần thứ 3',
    badge: '⏸️ Restrict (Tạm Khóa)',
    target: 'Thành viên thắng 2 tuần liên tiếp',
  },
  {
    id: 'rule-1-4',
    code: '1.4',
    chapter: 1,
    chapterTitle: 'Chương I: Đề Xuất & Tỷ Lệ Xuất Hiện',
    title: 'Cơ Chế Buff Luck x2',
    summary: 'Thành viên nào có phim trong danh sách nhưng 3 tuần liên tiếp chưa được chọn, hệ thống sẽ tự động nhân đôi tỷ lệ xuất hiện.',
    mechanism: 'Tự động x2 tỷ lệ xuất hiện sau 3 tuần chờ đợi',
    badge: '🔥 BUFF LUCK x2',
    target: 'Phim chờ quá 3 tuần chưa xem',
  },
  {
    id: 'rule-1-5',
    code: '1.5',
    chapter: 1,
    chapterTitle: 'Chương I: Đề Xuất & Tỷ Lệ Xuất Hiện',
    title: 'Buff Thể Loại x1.5',
    summary: 'Phim mà không thể loại nào của nó xuất hiện trong 3 phim xem gần nhất sẽ được nhân 1.5 tỷ lệ xuất hiện. Cộng dồn với Buff Luck x2 (tối đa x3).',
    mechanism: 'Tự động x1.5 tỷ lệ cho thể loại ít được xem',
    badge: '🎲 BUFF THỂ LOẠI x1.5',
    target: 'Phim thuộc thể loại vắng 3 phim gần nhất',
  },

  // CHƯƠNG 2
  {
    id: 'rule-2-1',
    code: '2.1',
    chapter: 2,
    chapterTitle: 'Chương II: Vòng Quay & Lá Bài Quyền Lực',
    title: 'Kết Quả Tuyệt Đối',
    summary: 'Khi vòng quay chốt ra phim và bấm 🍿 XÁC NHẬN CHỌN PHIM NÀY, cả nhóm phải cam kết xem bộ phim đó, không lươn lẹo, không bàn lùi.',
    mechanism: 'Cam kết bắt buộc sau khi chốt vòng quay',
    badge: '🍿 Tuyệt Đối Tuân Thủ',
    target: 'Toàn bộ thành viên nhóm',
  },
  {
    id: 'rule-2-2',
    code: '2.2',
    chapter: 2,
    chapterTitle: 'Chương II: Vòng Quay & Lá Bài Quyền Lực',
    title: 'Cú Lừa Troll (Tỷ lệ 10%)',
    summary: 'Nếu dính sự kiện Troll (JACKPOT + pháo hoa → còi Buzzer hú → dấu CLAIM DENIED), vòng quay lắc ngược rồi dừng lại đúng phim vừa trúng. Chỉ là màn diễn: kết quả không bao giờ bị đổi.',
    mechanism: 'Xác suất kích hoạt ngẫu nhiên 10% mỗi lượt quay',
    badge: '🎭 Troll Event (10%)',
    target: 'Hệ thống Cinema Roulette',
  },
  {
    id: 'rule-2-3',
    code: '2.3',
    chapter: 2,
    chapterTitle: 'Chương II: Vòng Quay & Lá Bài Quyền Lực',
    title: 'Lá Bài Veto - Hạn Mức',
    summary: 'Mỗi giám khảo (Teng, Lộc, Thành) sở hữu đúng 3 Lá Bài Veto mỗi tháng để thực hiện quyền phủ quyết phim.',
    mechanism: 'Cấp hạn mức 3 thẻ định kỳ hàng tháng cho mỗi giám khảo',
    badge: '🛡️ 3 Thẻ / Giám Khảo',
    target: 'Ban Giám Khảo (Teng, Lộc, Thành)',
  },
  {
    id: 'rule-2-4',
    code: '2.4',
    chapter: 2,
    chapterTitle: 'Chương II: Vòng Quay & Lá Bài Quyền Lực',
    title: 'Lá Bài Veto - Kích Hoạt Phủ Quyết',
    summary: 'Khi quay ra một bộ phim cực kỳ ghét, giám khảo có quyền bấm 🛡️ VETO để hủy kết quả vừa quay và bắt buộc quay lại phim khác.',
    mechanism: 'Hủy kết quả & tự động quay lại phim khác ngay lập tức',
    badge: '🛡️ Kích Hoạt VETO',
    target: 'Giám khảo sử dụng quyền Veto',
  },

  // CHƯƠNG 3
  {
    id: 'rule-3-1',
    code: '3.1',
    chapter: 3,
    chapterTitle: 'Chương III: Thẩm Định & Phòng Truyền Thống',
    title: 'Tiêu Chí Chấm Điểm Điện Ảnh',
    summary: 'Thang điểm từ 0.0 đến 10.0 dựa trên 6 phương diện: Kịch bản, Diễn xuất, Visual/Đạo diễn, Âm thanh, Cảm xúc giải trí và Giá trị xem lại.',
    mechanism: 'Đánh giá toàn diện 6 phương diện cốt lõi điện ảnh',
    badge: '⭐ Thang Điểm 0 - 10',
    target: 'Ban Giám Khảo thẩm định',
  },
  {
    id: 'rule-3-2',
    code: '3.2',
    chapter: 3,
    chapterTitle: 'Chương III: Thẩm Định & Phòng Truyền Thống',
    title: 'Lưu Điểm & Thẻ Vé Vàng VIP',
    summary: 'Điểm của 3 giám khảo được tự động tính trung bình Realtime. Bấm 💾 LƯU ĐIỂM VÀO SHEET GAY GANG sẽ chuyển trạng thái phim thành 🎟️ Vé Vàng VIP.',
    mechanism: 'Tính điểm realtime & chuyển thẻ VIP danh dự',
    badge: '🎟️ Vé Vàng VIP',
    target: 'Phim đã hoàn tất chấm điểm',
  },
  {
    id: 'rule-3-3',
    code: '3.3',
    chapter: 3,
    chapterTitle: 'Chương III: Thẩm Định & Phòng Truyền Thống',
    title: 'Tự Động Chuyển Tab Đã Xem',
    summary: 'Phim lập tức được di chuyển tự động từ tab LIST PHIM CHƯA XEM sang tab LIST PHIM ĐÃ XEM sau khi hoàn tất chấm điểm.',
    mechanism: 'Tự động đồng bộ và lưu trữ lịch sử chiếu',
    badge: '🔄 Di Chuyển Tự Động',
    target: 'Hệ thống dữ liệu Google Sheets & App',
  },
  {
    id: 'rule-3-4',
    code: '3.4',
    chapter: 3,
    chapterTitle: 'Chương III: Thẩm Định & Phòng Truyền Thống',
    title: 'Tự Động Xếp Hạng Hall of Fame',
    summary: 'BXH tự động sắp xếp lại theo Điểm TB nhóm giảm dần và đánh lại thứ hạng Hạng #1, #2, #3... tôn vinh các tác phẩm đỉnh cao.',
    mechanism: 'Sắp xếp giảm dần theo Điểm TB nhóm realtime',
    badge: '🏆 Hall of Fame',
    target: 'Bảng xếp hạng điện ảnh rạp Gay Gang',
  },
];

interface CinemaRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Badges in the data start with an emoji; the chip shows the words only
const badgeText = (badge: string) => badge.replace(/^[^\p{L}\p{N}]+/u, '');

const CHAPTERS = [
  { id: 0, label: 'Tất cả' },
  { id: 1, label: 'I · Đề xuất' },
  { id: 2, label: 'II · Vòng quay' },
  { id: 3, label: 'III · Chấm điểm' },
] as const;

export const CinemaRulesModal: React.FC<CinemaRulesModalProps> = ({ isOpen, onClose }) => {
  const [selectedChapter, setSelectedChapter] = useState<0 | 1 | 2 | 3>(0);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredRules = CINEMA_RULES.filter((rule) => {
    if (selectedChapter !== 0 && rule.chapter !== selectedChapter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        rule.title.toLowerCase().includes(q) ||
        rule.code.toLowerCase().includes(q) ||
        rule.summary.toLowerCase().includes(q) ||
        rule.mechanism.toLowerCase().includes(q) ||
        rule.badge.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <Modal onClose={onClose} size="lg" label="Điều lệ rạp">
      <ModalHeader jp="ルール" kicker="Văn bản chính quy · 3 chương" title="12 điều lệ" onClose={onClose} />

      <div className="px-5 sm:px-7 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-ink">
        <div className="seg">
          {CHAPTERS.map((c) => (
            <button key={c.id} aria-pressed={selectedChapter === c.id} onClick={() => setSelectedChapter(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm điều lệ…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input !h-9 !pl-9 text-[13px]"
            aria-label="Tìm điều lệ"
          />
        </div>
      </div>

      <ol className="max-h-[62vh] overflow-y-auto divide-y divide-line">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <li key={rule.id} className="grid grid-cols-[64px_1fr] sm:grid-cols-[88px_1fr] gap-4 px-5 sm:px-7 py-5">
              <div className="display text-[40px] sm:text-[52px] leading-[0.85] text-accent">{rule.code}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[17px] font-bold leading-snug">{rule.title}</h4>
                  <span className="chip">{badgeText(rule.badge)}</span>
                </div>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{rule.summary}</p>
                <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                  <div>
                    <dt className="label !text-[10px]">Cơ chế</dt>
                    <dd className="mt-0.5">{rule.mechanism}</dd>
                  </div>
                  <div>
                    <dt className="label !text-[10px]">Áp dụng</dt>
                    <dd className="mt-0.5">{rule.target}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))
        ) : (
          <li className="px-7 py-12 text-center text-[14px] text-ink-3">Không có điều lệ nào khớp từ khóa.</li>
        )}
      </ol>

      <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t-[1.5px] border-ink">
        <span className="text-[13px] text-ink-2">Có hiệu lực với toàn bộ thành viên.</span>
        <button onClick={onClose} className="btn btn-primary btn-sm">Đã rõ</button>
      </div>
    </Modal>
  );
};
