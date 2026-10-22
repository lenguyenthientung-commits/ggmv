import React, { useState, useEffect } from 'react';
import { WeekendSession, Movie } from '../types/cinema';
import { Calendar, Clock, MapPin, Beer, Users, Film, CheckCircle2, AlertCircle, Plus, Tv } from 'lucide-react';
import { BROTHERS_LIST } from './Header';

interface WeekendSessionSectionProps {
  sessions: WeekendSession[];
  movies: Movie[];
  currentUser: string;
  onCheckin: (sessionId: string, name: string, status: 'going' | 'late' | 'maybe' | 'busy', note?: string) => void;
  onAddSnack: (sessionId: string, person: string, item: string) => void;
  onOpenCinemaRoom: (movie: Movie) => void;
  onCreateSession: (newSession: Partial<WeekendSession>) => void;
}

export const WeekendSessionSection: React.FC<WeekendSessionSectionProps> = ({
  sessions,
  movies,
  currentUser,
  onCheckin,
  onAddSnack,
  onOpenCinemaRoom,
  onCreateSession,
}) => {
  const currentSession = sessions[0];
  const [showAddSnackModal, setShowAddSnackModal] = useState(false);
  const [snackPerson, setSnackPerson] = useState(currentUser);
  const [snackItem, setSnackItem] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Kèo Chiếu Phim Thứ Bảy Tuần Này');
  const [sessionDate, setSessionDate] = useState('2026-10-03');
  const [sessionTime, setSessionTime] = useState('20:30');
  const [sessionLocation, setSessionLocation] = useState('Phòng khách nhà Tuấn Anh');
  const [selectedMovieId, setSelectedMovieId] = useState<string>(movies[0]?.id || '');

  // Calculate countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!currentSession) return;
    const calculateTimeLeft = () => {
      const target = new Date(`${currentSession.date}T${currentSession.time}:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [currentSession]);

  const selectedMovie = movies.find(m => m.id === currentSession?.selectedMovieId);

  // Current user's attendee status in this session
  const myAttendance = currentSession?.attendees.find(
    a => a.name.toLowerCase() === currentUser.toLowerCase()
  );

  const handleSnackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snackItem.trim() || !currentSession) return;
    onAddSnack(currentSession.id, snackPerson, snackItem.trim());
    setSnackItem('');
    setShowAddSnackModal(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSession({
      title: sessionTitle,
      date: sessionDate,
      time: sessionTime,
      location: sessionLocation,
      selectedMovieId: selectedMovieId || undefined,
      snackDuty: [],
      attendees: [
        { name: currentUser, status: 'going', note: 'Chủ xị buổi chiếu' },
      ],
      status: 'upcoming',
    });
    setShowCreateModal(false);
  };

  if (!currentSession) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center max-w-xl mx-auto">
        <Calendar className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white font-cinema">
          Chưa Có Lịch Chiếu Phim Tuần Này
        </h2>
        <p className="text-xs text-neutral-400 mt-1 mb-6">
          Hãy lên lịch buổi chiếu phim cuối tuần, chọn phim và phân công mồi nhậu cùng anh em!
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-colors"
        >
          Lên Lịch Chiếu Mới
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Session Banner Card */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
              <Calendar className="w-4 h-4" />
              <span>Kèo Cuối Tuần Sắp Tới</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-cinema">
              {currentSession.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                {currentSession.time} · {currentSession.date}
              </span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                {currentSession.location}
              </span>
            </div>
          </div>

          {/* Countdown & Room CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <div>
                <div className="text-lg font-black text-amber-400 font-mono tabular-nums leading-none">
                  {countdown.days}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Ngày</div>
              </div>
              <span className="text-neutral-600 font-bold">:</span>
              <div>
                <div className="text-lg font-black text-amber-400 font-mono tabular-nums leading-none">
                  {countdown.hours}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Giờ</div>
              </div>
              <span className="text-neutral-600 font-bold">:</span>
              <div>
                <div className="text-lg font-black text-amber-400 font-mono tabular-nums leading-none">
                  {countdown.minutes}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Phút</div>
              </div>
            </div>

            {selectedMovie && (
              <button
                onClick={() => onOpenCinemaRoom(selectedMovie)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-[0_0_25px_color-mix(in_srgb,var(--color-amber-500)_40%,transparent)] active:scale-95 transition-all"
              >
                <Tv className="w-4 h-4" />
                <span>Vào Phòng Chiếu Rạp</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
              title="Tạo buổi chiếu mới"
            >
              + Tạo kèo khác
            </button>
          </div>
        </div>

        {/* Selected Movie Spotlight */}
        <div className="pt-6">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span>Tác Phẩm Được Chọn Lên Sóng Tối Nay</span>
          </div>

          {selectedMovie ? (
            <div className="rounded-2xl bg-neutral-950/70 border border-neutral-800 p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-start">
              <img
                src={selectedMovie.posterUrl}
                alt={selectedMovie.title}
                referrerPolicy="no-referrer"
                className="w-full md:w-44 h-60 object-cover rounded-xl shadow-lg border border-neutral-700 shrink-0"
              />

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{selectedMovie.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedMovie.durationMinutes} phút</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-semibold">{selectedMovie.platform}</span>
                </div>

                <h3 className="text-2xl font-bold text-white font-cinema">
                  {selectedMovie.title}
                </h3>

                {selectedMovie.originalTitle && (
                  <p className="text-xs text-neutral-400 italic -mt-1">
                    {selectedMovie.originalTitle}
                  </p>
                )}

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedMovie.synopsis}
                </p>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <span className="font-semibold text-amber-400">Lời nhắn từ {selectedMovie.suggestedBy}:</span>{' '}
                  <span className="italic text-neutral-300">&quot;{selectedMovie.whyWatch}&quot;</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-neutral-400">
                    🔥 Đã nhận được <strong className="text-white">{selectedMovie.votes.length} phiếu</strong> từ anh em.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-neutral-950/70 border border-dashed border-neutral-800 p-8 text-center">
              <p className="text-sm text-neutral-400 mb-3">
                Chưa chốt phim nào cho buổi chiếu này!
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                Hãy dùng Vòng Quay May Mắn để chọn phim hoặc chọn trực tiếp từ Kho Phim.
              </p>
            </div>
          )}
        </div>

        {/* Attendance & Popcorn/Beer Duty Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 pt-8 border-t border-neutral-800">
          {/* Attendee Check-in */}
          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Điểm danh anh em ({currentSession.attendees.filter(a => a.status === 'going').length} có mặt)</span>
              </div>
            </div>

            {/* My quick check-in toggle */}
            <div className="mb-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-xs text-neutral-400 mb-2">
                Trạng thái của bạn (<strong className="text-amber-400">{currentUser}</strong>):
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onCheckin(currentSession.id, currentUser, 'going', 'Có mặt 100%')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                    myAttendance?.status === 'going'
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Có mặt</span>
                </button>

                <button
                  onClick={() => onCheckin(currentSession.id, currentUser, 'late', 'Đến muộn 15p')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                    myAttendance?.status === 'late'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Đến muộn</span>
                </button>

                <button
                  onClick={() => onCheckin(currentSession.id, currentUser, 'busy', 'Kẹt việc')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                    myAttendance?.status === 'busy'
                      ? 'bg-red-500/80 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Bận kèo</span>
                </button>
              </div>
            </div>

            {/* Attendees list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {currentSession.attendees.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-200">{a.name}</span>
                    {a.note && <span className="text-neutral-500 italic text-[11px]">({a.note})</span>}
                  </div>
                  <div>
                    {a.status === 'going' && (
                      <span className="text-emerald-400 font-medium">✓ Tham gia</span>
                    )}
                    {a.status === 'late' && (
                      <span className="text-amber-400 font-medium">⏳ Đến muộn</span>
                    )}
                    {a.status === 'busy' && (
                      <span className="text-red-400 font-medium">✕ Vắng mặt</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Snack & Popcorn Duty */}
          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                <Beer className="w-4 h-4 text-amber-400" />
                <span>Phân công Bỏng Ngô & Mồi Nhậu ({currentSession.snackDuty.length})</span>
              </div>
              <button
                onClick={() => setShowAddSnackModal(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Góp mồi</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {currentSession.snackDuty.map((snack, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-300">{snack.person}:</span>{' '}
                    <span className="text-neutral-200">{snack.item}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Đã nhận</span>
                </div>
              ))}
              {currentSession.snackDuty.length === 0 && (
                <p className="text-xs text-neutral-500 text-center py-6">
                  Chưa ai nhận mang mồi! Hãy bấm &quot;Góp mồi&quot; để chuẩn bị đồ ăn cho buổi chiếu.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Góp Mồi */}
      {showAddSnackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-cinema mb-4">
              Phân Công Chuẩn Bị Mồi & Bỏng Ngô
            </h3>
            <form onSubmit={handleSnackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Anh em phụ trách:
                </label>
                <select
                  value={snackPerson}
                  onChange={(e) => setSnackPerson(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {BROTHERS_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Món sẽ mang tới:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 1 thùng Tiger Bạc, 2 gói bỏng ngô phô mai..."
                  value={snackItem}
                  onChange={(e) => setSnackItem(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSnackModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Lưu Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tạo Kèo Chiếu Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-cinema mb-4">
              Lên Lịch Buổi Chiếu Phim Mới
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Tên kèo / Tiêu đề:
                </label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Ngày chiếu:
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Giờ bắt đầu:
                  </label>
                  <input
                    type="time"
                    required
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Địa điểm xem:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Phòng khách nhà ai hoặc Kênh Discord..."
                  value={sessionLocation}
                  onChange={(e) => setSessionLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Chọn phim chiếu:
                </label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">-- Để trống (Chờ quay số ngẫu nhiên) --</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.year} · {m.durationMinutes}p)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Tạo Kèo Chiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
