import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  Flame,
  Star,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react';

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
    title: 'Cú Lừa Troll (Tỷ lệ 15%)',
    summary: 'Nếu dính sự kiện Troll (hiện phim giả + nổ pháo hoa → còi Buzzer hú → màn hình chớp đỏ), cả nhóm phải chờ vòng quay tự động nhảy sang phim thật!',
    mechanism: 'Xác suất kích hoạt ngẫu nhiên 15% trong vòng quay',
    badge: '🎭 Troll Event (15%)',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#120d0a] border-2 border-amber-600/50 shadow-[0_0_80px_color-mix(in_srgb,var(--color-amber-600)_25%,transparent)] overflow-hidden">
        {/* Header - Vintage Gold Seal */}
        <div className="px-5 sm:px-8 py-5 border-b border-amber-800/40 bg-gradient-to-r from-[#1c140f] via-[#241a13] to-[#1c140f] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-md border border-amber-300/40 shrink-0">
              <BookOpen className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
                <span>Rạp Chiếu Phim Gay Gang</span>
                <span aria-hidden="true">·</span>
                <span>Văn Bản Chính Quy</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-[#fdf8f0] font-cinema tracking-wide">
                Bộ Quy Chuẩn Điện Ảnh & Điều Lệ Hoạt Động
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#231a15] hover:bg-[#31251e] text-stone-400 hover:text-white transition-colors border border-amber-900/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Golden Pillars Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:px-8 sm:pt-6 bg-[#0e0a08] border-b border-amber-900/30">
          <div className="p-3 rounded-xl bg-[#1a130f] border border-amber-800/30 text-center">
            <div className="text-[11px] text-amber-400/80 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Tổng Điều Lệ</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">12</div>
            <div className="text-[10px] text-stone-400">3 Chương chính quy</div>
          </div>

          <div className="p-3 rounded-xl bg-[#1a130f] border border-amber-800/30 text-center">
            <div className="text-[11px] text-amber-400/80 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-red-400" />
              <span>Lá Bài Veto</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-400 font-mono mt-0.5">3 Thẻ / Tháng</div>
            <div className="text-[10px] text-stone-400">Teng, Lộc, Thành</div>
          </div>

          <div className="p-3 rounded-xl bg-[#1a130f] border border-amber-800/30 text-center">
            <div className="text-[11px] text-amber-400/80 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Buff Luck</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono mt-0.5">x2 Tỷ Lệ</div>
            <div className="text-[10px] text-stone-400">Sau 3 tuần chờ</div>
          </div>

          <div className="p-3 rounded-xl bg-[#1a130f] border border-amber-800/30 text-center">
            <div className="text-[11px] text-amber-400/80 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              <span>Thang Điểm</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">0.0 - 10.0</div>
            <div className="text-[10px] text-stone-400">Thẩm định 6 phương diện</div>
          </div>
        </div>

        {/* Filter bar: Search + Chapter switcher */}
        <div className="px-4 sm:px-8 py-3 bg-[#16100d] border-b border-amber-900/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 0, label: 'Toàn Bộ 12 Điều' },
              { id: 1, label: 'Chương I (1.1 - 1.4)' },
              { id: 2, label: 'Chương II (2.1 - 2.4)' },
              { id: 3, label: 'Chương III (3.1 - 3.4)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedChapter(tab.id as 0 | 1 | 2 | 3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedChapter === tab.id
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'bg-[#221914] text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm điều lệ, cơ chế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0e0a08] border border-amber-900/40 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Rule Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
          {filteredRules.length > 0 ? (
            filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-2xl bg-[#18110d] border border-amber-900/40 p-4 sm:p-5 hover:border-amber-600/60 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-amber-900/20">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                      Điều {rule.code}
                    </span>
                    <h3 className="text-base font-bold text-[#fdf8f0] font-cinema">
                      {rule.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#251a14] border border-amber-700/30 text-amber-200 text-[11px] font-semibold">
                      {rule.badge}
                    </span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {rule.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#0e0a08]/80 border border-stone-800/80">
                      <span className="text-stone-400 text-[11px] block">Cơ Chế Vận Hành:</span>
                      <span className="text-amber-200 font-medium">{rule.mechanism}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#0e0a08]/80 border border-stone-800/80">
                      <span className="text-stone-400 text-[11px] block">Đối Tượng Áp Dụng:</span>
                      <span className="text-stone-200 font-medium">{rule.target}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-stone-500 text-xs">
              Không tìm thấy quy chuẩn nào khớp với từ khóa tìm kiếm.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-amber-900/40 bg-[#16100d] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Đã ban hành & có hiệu lực thi hành đối với toàn bộ thành viên Gay Gang.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-colors"
          >
            Đã Rõ
          </button>
        </div>
      </div>
    </div>
  );
};
