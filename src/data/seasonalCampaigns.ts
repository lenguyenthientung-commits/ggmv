// Seasonal cinema campaigns, ported from GGMV (AllMovies.html / Popup.html).
// The active campaign is chosen by month; `?season=<id>` previews one, `?season=off` disables it.

export type SeasonId = 'tet' | 'valentine' | 'mid-autumn' | 'halloween' | 'christmas';

export interface SeasonalCampaign {
  id: SeasonId;
  month: number; // 1-12
  code: string;
  title: string;
  deck: string;
  note: string;
}

export const SEASONAL_CAMPAIGNS: SeasonalCampaign[] = [
  {
    id: 'tet',
    month: 1,
    code: '01',
    title: 'TÂN NIÊN / MỞ MÀN NĂM MỚI',
    deck: 'Đèn lồng gọi suất chiếu đầu năm. Lời chúc có thể màu mè; lượt chọn phim vẫn công bằng.',
    note: 'Lời chúc đầu năm: tối nay đừng veto cả rạp.',
  },
  {
    id: 'valentine',
    month: 2,
    code: '02',
    title: 'LOVE LETTER / DOUBLE FEATURE',
    deck: 'Một vé đôi cho hội đồng ba người: những bộ phim khiến cả hội rung động — hoặc bất đồng.',
    note: 'Tình yêu thì mù quáng. Bộ lọc phim thì không.',
  },
  {
    id: 'mid-autumn',
    month: 9,
    code: '09',
    title: 'TRĂNG LÊN / MOONLIT SCREENING',
    deck: 'Trăng sáng, đèn lồng, phim chiếu ngoài hiên. Gu ai người nấy giữ đến hết credit.',
    note: 'Trăng tròn rồi. Đồng thuận của hội vẫn còn khuyết.',
  },
  {
    id: 'halloween',
    month: 10,
    code: '10',
    title: 'THE LOST REEL / CUỘN PHIM THẤT LẠC',
    deck: 'Rạp hồ sơ mở ca đêm. Trăng tím, sương sân khấu, đèn an toàn cam. Cuộn phim nào cũng có cơ hội như nhau.',
    note: 'Nếu nghe tiếng máy chiếu khi đã tắt rạp, đừng trả lời.',
  },
  {
    id: 'christmas',
    month: 12,
    code: '12',
    title: 'WINTER PREMIERE / ĐÊM CÔNG CHIẾU',
    deck: 'Dải phim quấn quanh cây thông. Đêm lạnh, ghế ấm, spoiler xin để ngoài cửa.',
    note: 'Quà lớn nhất là không ai spoiler phim.',
  },
];

export function getActiveCampaign(date: Date = new Date()): SeasonalCampaign | null {
  const preview = new URLSearchParams(window.location.search).get('season');
  if (preview === 'off') return null;
  const previewed = SEASONAL_CAMPAIGNS.find((c) => c.id === preview);
  if (previewed) return previewed;
  return SEASONAL_CAMPAIGNS.find((c) => c.month === date.getMonth() + 1) ?? null;
}

// "EVENT WINDOW · 01—31 THÁNG MƯỜI 2026"
export function getCampaignPeriod(campaign: SeasonalCampaign, date: Date = new Date()): string {
  const year = date.getFullYear();
  const daysInMonth = new Date(year, campaign.month, 0).getDate();
  const monthLabel = new Date(year, campaign.month - 1, 1).toLocaleDateString('vi-VN', { month: 'long' }).toUpperCase();
  return `EVENT WINDOW · 01—${daysInMonth} ${monthLabel} ${year}`;
}
