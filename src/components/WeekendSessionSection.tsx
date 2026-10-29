import React, { useState, useEffect } from 'react';
import { WeekendSession, Movie } from '../types/cinema';
import { Clock, MapPin, Plus, Tv, Check, X } from 'lucide-react';
import { BROTHERS_LIST } from './Header';
import { Modal, ModalHeader, SectionHeader, formatSessionDate } from './ui';

interface WeekendSessionSectionProps {
  sessions: WeekendSession[];
  movies: Movie[];
  currentUser: string;
  onCheckin: (sessionId: string, name: string, status: 'going' | 'late' | 'maybe' | 'busy', note?: string) => void;
  onAddSnack: (sessionId: string, person: string, item: string) => void;
  onOpenCinemaRoom: (movie: Movie) => void;
  onCreateSession: (newSession: Partial<WeekendSession>) => void;
}

const STATUS = {
  going: { label: 'Có mặt', color: 'bg-go', text: 'text-go' },
  late: { label: 'Đến muộn', color: 'bg-late', text: 'text-late' },
  maybe: { label: 'Chưa chắc', color: 'bg-ink-3', text: 'text-ink-3' },
  busy: { label: 'Vắng', color: 'bg-stop', text: 'text-stop' },
} as const;

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
  const [sessionTime, setSessionTime] = useState('09:00');
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

  const createModal = showCreateModal && (
    <Modal onClose={() => setShowCreateModal(false)} label="Tạo kèo chiếu mới">
      <ModalHeader jp="スケジュール" kicker="Kèo mới" title="Lên lịch chiếu" onClose={() => setShowCreateModal(false)} />
      <form onSubmit={handleCreateSubmit} className="px-5 sm:px-7 pb-6 space-y-4">
        <div>
          <label className="field-label" htmlFor="s-title">Tên kèo</label>
          <input id="s-title" type="text" required value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="s-date">Ngày chiếu</label>
            <input id="s-date" type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="field-label" htmlFor="s-time">Giờ bắt đầu</label>
            <input id="s-time" type="time" required value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="s-loc">Địa điểm</label>
          <input id="s-loc" type="text" required placeholder="Phòng khách nhà ai, hoặc Discord" value={sessionLocation} onChange={(e) => setSessionLocation(e.target.value)} className="input" />
        </div>
        <div>
          <label className="field-label" htmlFor="s-movie">Phim chiếu</label>
          <select id="s-movie" value={selectedMovieId} onChange={(e) => setSelectedMovieId(e.target.value)} className="input">
            <option value="">Để trống, chờ vòng quay</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.year} · {m.durationMinutes}p)
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-quiet">Hủy</button>
          <button type="submit" className="btn btn-primary">Tạo kèo</button>
        </div>
      </form>
    </Modal>
  );

  if (!currentSession) {
    return (
      <section>
        <SectionHeader jp="スケジュール" kicker="Lịch chiếu" title="Chưa có kèo" description="Lên lịch buổi chiếu cuối tuần, chọn phim và phân công mồi nhậu cùng anh em." />
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-lg">
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.75} />
          Lên lịch chiếu
        </button>
        {createModal}
      </section>
    );
  }

  const when = formatSessionDate(currentSession.date);
  const goingCount = currentSession.attendees.filter(a => a.status === 'going').length;

  return (
    <section>
      <SectionHeader jp="スケジュール" kicker="Kèo cuối tuần sắp tới" title={`${when.weekday} · ${when.dayMonth}`}>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-quiet btn-sm">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Tạo kèo khác
        </button>
      </SectionHeader>

      {/* Countdown + meta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
        <div className="lg:col-span-7">
          <h3 className="text-[clamp(24px,3vw,32px)] font-bold leading-tight">{currentSession.title}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-ink-2">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{currentSession.time}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{currentSession.location}</span>
          </div>

          <div className="mt-8 grid grid-cols-3 max-w-lg border-[1.5px] border-ink rounded-lg overflow-hidden bg-card">
            {[
              { v: countdown.days, l: 'Ngày' },
              { v: countdown.hours, l: 'Giờ' },
              { v: countdown.minutes, l: 'Phút' },
            ].map((u, i) => (
              <div key={u.l} className={`px-4 py-4 ${i > 0 ? 'border-l-[1.5px] border-ink' : ''}`}>
                <div className="display text-[clamp(48px,8vw,80px)] leading-[0.85] tabular-nums">{String(u.v).padStart(2, '0')}</div>
                <div className="label mt-2">{u.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected movie */}
        <div className="lg:col-span-5">
          {selectedMovie ? (
            <div className="panel overflow-hidden flex shadow-[6px_6px_0_var(--color-shadow)]">
              <img
                src={selectedMovie.posterUrl}
                alt={selectedMovie.title}
                referrerPolicy="no-referrer"
                className="w-32 sm:w-40 shrink-0 object-cover border-r-[1.5px] border-ink"
              />
              <div className="p-5 min-w-0 flex flex-col">
                <div className="label">Phim sáng nay</div>
                <div className="mt-1.5 text-[19px] font-bold leading-snug line-clamp-2">{selectedMovie.title}</div>
                <div className="mt-1 text-[13px] text-ink-3">
                  {selectedMovie.year} · {selectedMovie.durationMinutes} phút · {selectedMovie.platform}
                </div>
                <p className="mt-3 text-[13px] leading-snug text-ink-2 line-clamp-3">
                  <span className="font-semibold text-ink">{selectedMovie.suggestedBy}:</span> “{selectedMovie.whyWatch}”
                </p>
                <button onClick={() => onOpenCinemaRoom(selectedMovie)} className="btn btn-primary btn-sm mt-auto self-start translate-y-1">
                  <Tv className="w-4 h-4" />
                  Vào phòng chiếu
                </button>
              </div>
            </div>
          ) : (
            <div className="panel screentone h-full min-h-[200px] grid place-items-center p-6">
              <div className="bg-card border-[1.5px] border-ink rounded-md px-5 py-4 text-center">
                <div className="font-bold">Chưa chốt phim</div>
                <p className="mt-1 text-[13px] text-ink-2">Dùng vòng quay hoặc chọn từ kho phim.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance & snacks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <div className="flex items-center justify-between px-5 h-12 border-b-[1.5px] border-ink">
            <span className="label !text-ink">Điểm danh</span>
            <span className="label">{goingCount} có mặt</span>
          </div>
          <div className="p-5">
            <div className="field-label">Bạn ({currentUser}) đi không?</div>
            <div className="seg">
              <button aria-pressed={myAttendance?.status === 'going'} onClick={() => onCheckin(currentSession.id, currentUser, 'going', 'Có mặt 100%')}>
                Có mặt
              </button>
              <button aria-pressed={myAttendance?.status === 'late'} onClick={() => onCheckin(currentSession.id, currentUser, 'late', 'Đến muộn 15p')}>
                Đến muộn
              </button>
              <button aria-pressed={myAttendance?.status === 'busy'} onClick={() => onCheckin(currentSession.id, currentUser, 'busy', 'Kẹt việc')}>
                Bận
              </button>
            </div>

            <ul className="mt-5 divide-y divide-line max-h-60 overflow-y-auto">
              {currentSession.attendees.map((a, idx) => (
                <li key={idx} className="flex items-center gap-3 py-2.5">
                  <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-ink text-paper text-[12px] font-bold">
                    {a.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold truncate">{a.name}</span>
                    {a.note && <span className="block text-[12px] text-ink-3 truncate">{a.note}</span>}
                  </span>
                  <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${STATUS[a.status].text}`}>
                    <span className={`dot ${STATUS[a.status].color}`} />
                    {STATUS[a.status].label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="panel">
          <div className="flex items-center justify-between px-5 h-12 border-b-[1.5px] border-ink">
            <span className="label !text-ink">Mồi nhậu · {currentSession.snackDuty.length}</span>
            <button onClick={() => setShowAddSnackModal(true)} className="btn btn-quiet btn-sm -mr-2">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Góp mồi
            </button>
          </div>
          <div className="p-5">
            {currentSession.snackDuty.length > 0 ? (
              <ul className="divide-y divide-line max-h-72 overflow-y-auto">
                {currentSession.snackDuty.map((snack, idx) => (
                  <li key={idx} className="flex items-center gap-3 py-2.5">
                    <Check className="w-4 h-4 text-go shrink-0" strokeWidth={3} />
                    <span className="text-[14px] min-w-0">
                      <span className="font-semibold">{snack.person}</span>
                      <span className="text-ink-2"> · {snack.item}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-[14px] text-ink-3">Chưa ai nhận mang mồi. Bấm “Góp mồi” để nhận phần.</p>
            )}
          </div>
        </div>
      </div>

      {showAddSnackModal && (
        <Modal onClose={() => setShowAddSnackModal(false)} size="sm" label="Góp mồi">
          <ModalHeader kicker="Phân công" title="Góp mồi" onClose={() => setShowAddSnackModal(false)} />
          <form onSubmit={handleSnackSubmit} className="px-5 sm:px-7 pb-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="snack-person">Ai mang</label>
              <select id="snack-person" value={snackPerson} onChange={(e) => setSnackPerson(e.target.value)} className="input">
                {BROTHERS_LIST.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="snack-item">Mang gì</label>
              <input
                id="snack-item"
                type="text"
                required
                placeholder="1 thùng Tiger Bạc, 2 gói bỏng ngô…"
                value={snackItem}
                onChange={(e) => setSnackItem(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => setShowAddSnackModal(false)} className="btn btn-quiet">
                <X className="w-4 h-4" />
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">Lưu</button>
            </div>
          </form>
        </Modal>
      )}

      {createModal}
    </section>
  );
};
