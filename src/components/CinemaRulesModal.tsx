import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Modal } from './ui';
import { sounds } from '../utils/soundEffects';

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
    badge: 'Đề Xuất Tự Do',
    target: 'Toàn bộ thành viên Gay Gang',
  },
  {
    id: 'rule-1-2',
    code: '1.2',
    chapter: 1,
    chapterTitle: 'Chương I: Đề Xuất & Tỷ Lệ Xuất Hiện',
    title: 'Thẻ Đỏ Premiere',
    summary: 'Phim mới nhập mặc định có trạng thái Thẻ Đỏ Premiere và được xếp ngay vào danh sách quay ngẫu nhiên.',
    mechanism: 'Tự động kích hoạt khi thêm phim mới vào kho rạp',
    badge: 'Thẻ Đỏ Premiere',
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
    badge: 'Restrict (Tạm Khóa)',
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
    badge: 'BUFF LUCK x2',
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
    badge: 'BUFF THỂ LOẠI x1.5',
    target: 'Phim thuộc thể loại vắng 3 phim gần nhất',
  },

  // CHƯƠNG 2
  {
    id: 'rule-2-1',
    code: '2.1',
    chapter: 2,
    chapterTitle: 'Chương II: Vòng Quay & Lá Bài Quyền Lực',
    title: 'Kết Quả Tuyệt Đối',
    summary: 'Khi vòng quay chốt ra phim và bấm CHỐT PHIM, cả nhóm phải cam kết xem bộ phim đó, không lươn lẹo, không bàn lùi.',
    mechanism: 'Cam kết bắt buộc sau khi chốt vòng quay',
    badge: 'Tuyệt Đối Tuân Thủ',
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
    badge: 'Troll Event (10%)',
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
    badge: '3 Thẻ / Giám Khảo',
    target: 'Ban Giám Khảo (Teng, Lộc, Thành)',
  },
  {
    id: 'rule-2-4',
    code: '2.4',
    chapter: 2,
    chapterTitle: 'Chương II: Vòng Quay & Lá Bài Quyền Lực',
    title: 'Lá Bài Veto - Kích Hoạt Phủ Quyết',
    summary: 'Khi quay ra một bộ phim cực kỳ ghét, giám khảo có quyền bấm VETO để hủy kết quả vừa quay và bắt buộc quay lại phim khác.',
    mechanism: 'Hủy kết quả & tự động quay lại phim khác ngay lập tức',
    badge: 'Kích Hoạt VETO',
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
    badge: 'Thang Điểm 0 - 10',
    target: 'Ban Giám Khảo thẩm định',
  },
  {
    id: 'rule-3-2',
    code: '3.2',
    chapter: 3,
    chapterTitle: 'Chương III: Thẩm Định & Phòng Truyền Thống',
    title: 'Lưu Điểm & Thẻ Vé Vàng VIP',
    summary: 'Điểm của 3 giám khảo được tự động tính trung bình Realtime. Bấm LƯU ĐIỂM VÀO SHEET GAY GANG sẽ chuyển trạng thái phim thành Vé Vàng VIP.',
    mechanism: 'Tính điểm realtime & chuyển thẻ VIP danh dự',
    badge: 'Vé Vàng VIP',
    target: 'Phim đã hoàn tất chấm điểm',
  },
  {
    id: 'rule-3-3',
    code: '3.3',
    chapter: 3,
    chapterTitle: 'Chương III: Thẩm Định & Phòng Truyền Thống',
    title: 'Tự Động Chuyển Tab Đã Xem',
    summary: 'Phim lập tức được di chuyển tự động từ tab LIST PHIM CHƯA XEM sang tab LIST PHIM ĐÃ XEM ngay khi bấm CHỐT PHIM ở vòng quay, và bảng chấm điểm hiện ra luôn. Đủ điểm 3 giám khảo thì phim mới được xếp hạng.',
    mechanism: 'Tự động đồng bộ và lưu trữ lịch sử chiếu',
    badge: 'Di Chuyển Tự Động',
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
    badge: 'Hall of Fame',
    target: 'Bảng xếp hạng điện ảnh rạp Gay Gang',
  },
];

interface CinemaRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------- The rulebook: cover, contents, a title page per chapter, one rule per page ----------
type Page =
  | { kind: 'cover' }
  | { kind: 'toc' }
  | { kind: 'chapter'; chapter: number; title: string; count: number }
  | { kind: 'rule'; rule: CinemaRuleItem }
  | { kind: 'blank' }
  | { kind: 'back' };

const ROMAN = ['', 'I', 'II', 'III'];
const chapterName = (title: string) => title.split(': ')[1] ?? title;

const PAGES: Page[] = (() => {
  const pages: Page[] = [{ kind: 'cover' }, { kind: 'toc' }];
  [1, 2, 3].forEach((chapter) => {
    const rules = CINEMA_RULES.filter((r) => r.chapter === chapter);
    pages.push({ kind: 'chapter', chapter, title: chapterName(rules[0].chapterTitle), count: rules.length });
    rules.forEach((rule) => pages.push({ kind: 'rule', rule }));
  });
  if (pages.length % 2 === 0) pages.push({ kind: 'blank' }); // keeps the back page on the right of a spread
  pages.push({ kind: 'back' });
  return pages;
})();

const pageOf = (pred: (p: Page) => boolean) => PAGES.findIndex(pred);
const FLIP_MS = 700;

type Side = 'left' | 'right' | 'single';

export const CinemaRulesModal: React.FC<CinemaRulesModalProps> = ({ isOpen, onClose }) => {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<{ dir: 1 | -1; to: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const follow = () => setWide(media.matches);
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, []);

  // Every opening starts at the cover
  useEffect(() => {
    if (!isOpen) return;
    setPage(0);
    setFlip(null);
    return () => clearTimeout(timer.current);
  }, [isOpen]);

  const per = wide ? 2 : 1;
  const view = page - (page % per);
  const last = PAGES.length - 1 - ((PAGES.length - 1) % per);

  const goTo = (target: number) => {
    const to = Math.max(0, Math.min(last, target - (target % per)));
    if (flip || to === view) return;
    sounds.playVintageSwitch();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPage(to);
      return;
    }
    setFlip({ dir: to > view ? 1 : -1, to });
    timer.current = setTimeout(() => {
      setPage(to);
      setFlip(null);
    }, FLIP_MS);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(view + per);
      if (e.key === 'ArrowLeft') goTo(view - per);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!isOpen) return null;

  const content = (i: number) => {
    const p = PAGES[i];
    if (!p) return null;
    switch (p.kind) {
      case 'cover':
        return (
          <div className="h-full bg-night text-night-ink flex flex-col justify-between p-7 sm:p-9">
            <div className="flex items-center justify-between">
              <span className="jp text-[14px] text-accent">ルールブック</span>
              <span className="label !text-night-ink/50">Ấn bản 2026</span>
            </div>
            <div>
              <div className="label !text-accent">Gay Gang Cinema</div>
              <h2 className="display mt-3 text-[clamp(48px,7vw,68px)] leading-[0.9]">Điều lệ<br />rạp chiếu</h2>
              <p className="mt-4 text-[14px] text-night-ink/70">3 chương · {CINEMA_RULES.length} điều · có hiệu lực với toàn bộ thành viên.</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="stamp text-accent">Chính quy</span>
              <span className="label !text-night-ink/50">Lật trang →</span>
            </div>
          </div>
        );
      case 'toc':
        return (
          <div className="h-full p-7 sm:p-9 flex flex-col">
            <div className="label">Mục lục</div>
            <ol className="mt-4 space-y-4 overflow-hidden">
              {[1, 2, 3].map((ch) => (
                <li key={ch}>
                  <button
                    onClick={(e) => { e.stopPropagation(); goTo(pageOf((x) => x.kind === 'chapter' && x.chapter === ch)); }}
                    className="font-bold text-[15px] hover:text-accent transition-colors text-left"
                  >
                    {ROMAN[ch]}. {chapterName(CINEMA_RULES.find((r) => r.chapter === ch)!.chapterTitle)}
                  </button>
                  <ul className="mt-1.5 space-y-1">
                    {CINEMA_RULES.filter((r) => r.chapter === ch).map((r) => {
                      const at = pageOf((x) => x.kind === 'rule' && x.rule.id === r.id);
                      return (
                        <li key={r.id}>
                          <button
                            onClick={(e) => { e.stopPropagation(); goTo(at); }}
                            className="w-full flex items-baseline gap-2 text-[13px] text-ink-2 hover:text-ink text-left"
                          >
                            <span className="num text-ink-3 w-7 shrink-0">{r.code}</span>
                            <span className="truncate">{r.title}</span>
                            <span className="flex-1 border-b border-dotted border-line translate-y-[-3px] min-w-4" />
                            <span className="num text-ink-3">{at}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        );
      case 'chapter':
        return (
          <div className="h-full p-7 sm:p-9 flex flex-col justify-center screentone">
            <div className="bg-card border-[1.5px] border-ink rounded-md p-6 shadow-[4px_4px_0_var(--color-shadow)]">
              <div className="label">Chương</div>
              <div className="display text-[clamp(80px,12vw,120px)] leading-[0.85] text-accent mt-2">{ROMAN[p.chapter]}</div>
              <h3 className="display text-[clamp(26px,3.5vw,34px)] leading-tight mt-4">{p.title}</h3>
              <p className="mt-2 text-[13px] text-ink-3">{p.count} điều</p>
            </div>
          </div>
        );
      case 'rule':
        return (
          <div className="h-full p-7 sm:p-9 flex flex-col">
            <div className="label !text-[10px]">Chương {ROMAN[p.rule.chapter]} · {chapterName(p.rule.chapterTitle)}</div>
            <div className="display text-[clamp(56px,8vw,76px)] leading-[0.85] text-accent mt-5">{p.rule.code}</div>
            <h4 className="mt-3 text-[clamp(19px,2.4vw,23px)] font-bold leading-snug">{p.rule.title}</h4>
            <div className="mt-2"><span className="chip">{p.rule.badge}</span></div>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">{p.rule.summary}</p>
            <dl className="mt-auto pt-5 grid gap-3 text-[13px] border-t border-line">
              <div>
                <dt className="label !text-[10px]">Cơ chế</dt>
                <dd className="mt-0.5">{p.rule.mechanism}</dd>
              </div>
              <div>
                <dt className="label !text-[10px]">Áp dụng</dt>
                <dd className="mt-0.5">{p.rule.target}</dd>
              </div>
            </dl>
          </div>
        );
      case 'blank':
        return <div className="h-full grid place-items-center p-9 text-[13px] italic text-ink-3">Trang này được cố ý để trống.</div>;
      case 'back':
        return (
          <div className="h-full p-7 sm:p-9 flex flex-col justify-center items-start">
            <div className="label">Cam kết</div>
            <p className="display text-[clamp(30px,4vw,40px)] leading-tight mt-3">Đã đọc.<br />Đã hiểu.<br />Không cãi.</p>
            <p className="mt-3 text-[14px] text-ink-2">Mọi tranh chấp sẽ được giải quyết bằng vòng quay.</p>
            <span className="stamp stamp-land text-accent mt-6">Đã thông qua</span>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="btn btn-primary btn-sm mt-8">Đã rõ, đóng sách</button>
          </div>
        );
    }
  };

  // A page sheet: paper, spine shading on the inner edge, page number in the outer corner
  const sheet = (i: number, side: Side) => (
    <div
      className={`book-page ${side === 'left' ? 'is-left' : side === 'right' ? 'is-right' : ''} relative h-full overflow-hidden bg-card`}
    >
      {content(i)}
      {i > 0 && PAGES[i] && (
        <span className={`absolute bottom-3 num text-[11px] text-ink-3 ${side === 'left' ? 'left-5' : 'right-5'}`}>{i}</span>
      )}
    </div>
  );

  const leftIdx = flip?.dir === -1 ? flip.to : view;
  const rightIdx = flip?.dir === 1 ? flip.to + 1 : view + 1;
  const label = per === 2 ? `Trang ${view}–${Math.min(view + 1, PAGES.length - 1)}` : `Trang ${view}`;

  return (
    <Modal onClose={onClose} size="xl" label="Điều lệ rạp">
      <div className="flex items-center justify-between gap-4 px-5 sm:px-6 h-14 border-b-[1.5px] border-ink">
        <div className="flex items-center gap-3 min-w-0">
          <span className="jp text-[13px]">ルール</span>
          <span className="label truncate">Điều lệ rạp · {CINEMA_RULES.length} điều</span>
        </div>
        <button onClick={onClose} className="btn-icon" aria-label="Đóng điều lệ">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-sunk p-3 sm:p-6">
        <div className={`book relative mx-auto border-[1.5px] border-ink rounded-md shadow-[6px_6px_0_var(--color-shadow)] ${per === 2 ? 'grid grid-cols-2 h-[560px]' : 'h-[min(560px,68vh)]'}`}>
          {per === 2 ? (
            <>
              <div className="h-full border-r border-line cursor-pointer" onClick={() => goTo(view - 2)}>{sheet(leftIdx, 'left')}</div>
              <div className="h-full cursor-pointer" onClick={() => goTo(view + 2)}>{sheet(rightIdx, 'right')}</div>
              {flip && (
                <div className={`book-leaf ${flip.dir === 1 ? 'leaf-next left-1/2' : 'leaf-prev left-0'} w-1/2`}>
                  <div className="leaf-face">{sheet(flip.dir === 1 ? view + 1 : view, flip.dir === 1 ? 'right' : 'left')}</div>
                  <div className="leaf-face leaf-back">{sheet(flip.dir === 1 ? flip.to : flip.to + 1, flip.dir === 1 ? 'left' : 'right')}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="h-full cursor-pointer" onClick={() => goTo(view + 1)}>{sheet(flip?.dir === 1 ? flip.to : view, 'single')}</div>
              {flip && (
                <div className={`book-leaf ${flip.dir === 1 ? 'leaf-next' : 'leaf-in'} left-0 w-full`}>
                  <div className="leaf-face">{sheet(flip.dir === 1 ? view : flip.to, 'single')}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 border-t-[1.5px] border-ink">
        <button onClick={() => goTo(view - per)} disabled={view === 0} className="btn btn-sm disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trang trước</span>
        </button>
        <span className="num text-[12px] text-ink-3">{view === 0 ? 'Bìa' : label} / {PAGES.length - 1}</span>
        <button onClick={() => goTo(view + per)} disabled={view >= last} className="btn btn-sm disabled:opacity-40">
          <span className="hidden sm:inline">Trang sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Modal>
  );
};
