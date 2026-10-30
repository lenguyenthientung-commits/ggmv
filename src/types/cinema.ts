export interface MovieReview {
  id: string;
  author: string;
  rating: number; // 1 to 10
  badge?: string; // "Siêu phẩm", "Căng não", "Hài vãi", "Gây lú", "Xem xong trầm cảm"
  comment: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  durationMinutes: number;
  genres: string[];
  director?: string;
  country?: string; // OMDb's list, e.g. "Canada, United States"
  suggestedBy: string; // Tên anh em đề xuất
  vibe: string; // "Hài bựa", "Căng não", "Hành động đỉnh cao", "Kinh dị thót tim", "Ấm áp gia đình"
  platform: 'Netflix' | 'HBO Max' | 'VieON' | 'FPT Play' | 'Torrent/Stremio' | 'Rạp' | 'Khác';
  posterUrl: string;
  trailerUrl?: string; // YouTube embed or watch link
  watchUrl?: string;
  synopsis: string;
  whyWatch: string; // Lý do anh em nên xem
  votes: string[]; // List of names of brothers who voted
  watched: boolean;
  watchedDate?: string;
  rank?: number;
  statusBadge?: string;
  legacySeason?: string;
  scoreTeng?: number;
  scoreLoc?: number;
  scoreThanh?: number;
  scoreAvg?: number;
  adminNote?: string;
  actors?: string;
  reviews?: MovieReview[];
  createdAt: string;
}

export interface WeekendSession {
  id: string;
  title: string; // e.g. "Chiếu phim Cuối tuần tuần này - Kèo thứ 7"
  date: string; // ISO date or "2026-10-03"
  time: string; // "20:30"
  selectedMovieId?: string;
  location: string; // "Phòng khách nhà Long" or "Kênh Discord Anh Em"
  snackDuty: {
    person: string;
    item: string; // "Bỏng ngô phô mai & 1 thùng bia Saigon"
  }[];
  attendees: {
    name: string;
    status: 'going' | 'late' | 'maybe' | 'busy';
    note?: string;
  }[];
  status: 'upcoming' | 'live' | 'finished';
}
