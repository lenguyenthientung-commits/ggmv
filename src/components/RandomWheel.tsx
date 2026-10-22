import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Movie } from '../types/cinema';
import { sounds } from '../utils/soundEffects';
import {
  RotateCcw,
  Play,
  CheckCircle2,
  SlidersHorizontal,
  Trophy,
  Ticket,
  Film,
  Sparkles,
  Zap,
  Shield,
  BookOpen,
  AlertOctagon,
  Volume2,
} from 'lucide-react';

interface RandomWheelProps {
  movies: Movie[];
  currentUser: string;
  onOpenRules?: () => void;
  onSelectForWeekend: (movie: Movie) => void;
  onOpenTrailer: (movie: Movie) => void;
}

// Vintage 1920s Art Deco Cinema Palette (Burgundy, Aged Amber, Forest Green, Deep Prussian Blue, Plum, Ochre)
const VINTAGE_GENRE_COLORS = [
  '#7f1d1d', // Deep Burgundy
  '#92400e', // Aged Amber / Rust
  '#064e3b', // Velvet Forest Green
  '#1e3a5f', // Prussian Midnight Blue
  '#581c87', // Royal Dark Violet
  '#831843', // Bordeaux Wine
  '#78350f', // Antique Bronze
  '#14532d', // Deep Jade
];

export const RandomWheel: React.FC<RandomWheelProps> = ({
  movies,
  currentUser,
  onOpenRules,
  onSelectForWeekend,
  onOpenTrailer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filters
  const [onlyUnwatched, setOnlyUnwatched] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [maxDuration, setMaxDuration] = useState<number>(0);
  const [weightedByVotes, setWeightedByVotes] = useState<boolean>(true);

  // Spin State
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerMovie, setWinnerMovie] = useState<Movie | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Rule 2.3 & 2.4: VETO cards state (3 cards / month per judge), shared on the server
  const [vetoCounts, setVetoCounts] = useState<{ [judge: string]: number }>({});
  const [isVetoing, setIsVetoing] = useState(false);

  useEffect(() => {
    fetch('/api/veto')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.cards) setVetoCounts(data.cards);
      })
      .catch(() => {});
  }, []);

  // Rule 2.2: Troll Event (15%) state
  const [trollEnabled, setTrollEnabled] = useState(true);
  const [isTrolling, setIsTrolling] = useState(false);
  const [vetoNotice, setVetoNotice] = useState<string | null>(null);

  // Optical Pawl / Pointer animation state (-0.2 rad to +0.2 rad bounce)
  const [pawlAngle, setPawlAngle] = useState(0);

  // Rotation angles in radians
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastPegIndexRef = useRef<number>(-1);

  // Unique genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set);
  }, [movies]);

  // Proposer rules (from GGMV): watched proposers, most recent first.
  // - Same proposer for the last 2 watched movies -> their movies sit out this spin.
  // - Proposer absent from the last 3 watched movies -> their movies get double odds.
  const { restrictedProposer, recentThreeProposers } = useMemo(() => {
    const history = movies
      .filter((m) => m.watched && m.watchedDate && m.suggestedBy)
      .sort((a, b) => (b.watchedDate as string).localeCompare(a.watchedDate as string))
      .map((m) => m.suggestedBy.trim());
    return {
      restrictedProposer: history.length >= 2 && history[0] === history[1] ? history[0] : null,
      recentThreeProposers: history.slice(0, 3),
    };
  }, [movies]);

  const isBuffed = (m: Movie) => !recentThreeProposers.includes(m.suggestedBy.trim());

  // Filtered candidate movies
  const eligibleMovies = useMemo(() => {
    const filtered = movies.filter((m) => {
      if (onlyUnwatched && m.watched) return false;
      if (selectedGenre !== 'all' && !m.genres.includes(selectedGenre)) return false;
      if (maxDuration > 0 && m.durationMinutes > maxDuration) return false;
      return true;
    });
    if (!restrictedProposer) return filtered;
    const withoutRestricted = filtered.filter((m) => m.suggestedBy.trim() !== restrictedProposer);
    return withoutRestricted.length > 0 ? withoutRestricted : filtered;
  }, [movies, onlyUnwatched, selectedGenre, maxDuration, restrictedProposer]);

  // Compute slices
  const slices = useMemo(() => {
    if (eligibleMovies.length === 0) return [];

    let totalWeight = 0;
    const weights = eligibleMovies.map((m) => {
      const base = weightedByVotes ? Math.max(1, (m.votes?.length || 0) + 1) : 1;
      return isBuffed(m) ? base * 2 : base;
    });

    totalWeight = weights.reduce((acc, w) => acc + w, 0);

    let accumulatedAngle = 0;
    return eligibleMovies.map((movie, index) => {
      const sliceAngle = (weights[index] / totalWeight) * (2 * Math.PI);
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle += sliceAngle;
      return {
        movie,
        startAngle,
        endAngle,
        color: VINTAGE_GENRE_COLORS[index % VINTAGE_GENRE_COLORS.length],
        weight: weights[index],
      };
    });
  }, [eligibleMovies, weightedByVotes, recentThreeProposers]);

  // Draw the Mechanical 35mm Film Reel
  const drawWheel = (rotationAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 24;

    ctx.clearRect(0, 0, width, height);

    if (slices.length === 0) {
      // Empty vintage state
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#14100e';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#382e27';
      ctx.stroke();

      ctx.fillStyle = '#8f7e72';
      ctx.font = '14px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Không có phim nào phù hợp bộ lọc rạp', centerX, centerY);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);

    // 1. Draw Slices with Rich Textured Fill
    slices.forEach((slice) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 10, slice.startAngle, slice.endAngle);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();

      // Hairline brass separation line between slices
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
      ctx.stroke();

      // Film Title Typography along slice radius
      ctx.save();
      const midAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
      ctx.rotate(midAngle);
      ctx.translate(radius * 0.60, 0);

      // Gold-leaf text styling
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 12.5px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 5;

      let title = slice.movie.title;
      if (title.length > 17) {
        title = title.substring(0, 15) + '...';
      }
      ctx.fillText(title, 0, -5);

      // Subtitle (duration & votes)
      ctx.fillStyle = '#d97706';
      ctx.font = '10px "Space Grotesk", monospace';
      ctx.fillText(`${slice.movie.durationMinutes}m · ${slice.movie.votes.length}v`, 0, 9);

      ctx.restore();
    });

    // 2. Outer 35mm Sprocket Film Ring (Vành cuộn phim nhựa đục lỗ sprocket)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#1a1411';
    ctx.stroke();

    // 3. Antique Brass Outer Rim (Gờ đồng thau bọc ngoài)
    ctx.beginPath();
    ctx.arc(0, 0, radius + 7, 0, 2 * Math.PI);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // 4. Brass Mechanical Studs (Tán đinh cơ khí)
    const totalPegs = Math.max(16, slices.length * 2);
    for (let i = 0; i < totalPegs; i++) {
      const pegAngle = (i / totalPegs) * 2 * Math.PI;
      const px = Math.cos(pegAngle) * (radius - 2);
      const py = Math.sin(pegAngle) * (radius - 2);

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#92400e';
      ctx.stroke();
    }

    // 5. Vintage 35mm Reel Hub & Spoke Openings (Nan hoa kim loại khoét lỗ trục tời)
    const spokeCount = 6;
    for (let s = 0; s < spokeCount; s++) {
      const spokeAngle = (s / spokeCount) * 2 * Math.PI;
      const sx = Math.cos(spokeAngle) * 58;
      const sy = Math.sin(spokeAngle) * 58;

      ctx.beginPath();
      ctx.arc(sx, sy, 11, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(10, 8, 7, 0.75)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
      ctx.stroke();
    }

    // 6. Central Brass Bearing Hub (Trục bi đồng cổ)
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#17120e';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#b45309';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();

    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [slices]);

  // Master Mechanical Spin with Real Friction & Escapement Rebound
  const handleSpin = () => {
    if (isSpinning || slices.length === 0) return;

    sounds.playVintageSwitch();
    sounds.startProjectorWhir();
    setIsSpinning(true);
    setWinnerMovie(null);
    setShowWinnerModal(false);

    // Rotations: 6 to 9 full turns + random landing angle
    const extraRotations = (6 + Math.random() * 3.5) * (2 * Math.PI);
    const targetOffset = Math.random() * (2 * Math.PI);
    const totalDelta = extraRotations + targetOffset;

    const startAngle = currentAngleRef.current;
    const duration = 4800; // ms
    const startTime = performance.now();

    // Cinematic Heavy Settle with micro-rebound at end
    const easeOutWithRebound = (t: number) => {
      // Standard cubic deceleration:
      const p = 1 - Math.pow(1 - t, 3.4);
      // In the final 5% (t > 0.95), introduce micro elastic rebound:
      if (t > 0.95) {
        const subT = (t - 0.95) / 0.05;
        const rebound = Math.sin(subT * Math.PI) * 0.003;
        return p - rebound;
      }
      return p;
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutWithRebound(progress);

      const newAngle = startAngle + totalDelta * easedProgress;
      currentAngleRef.current = newAngle;

      drawWheel(newAngle);

      // Sound & Pawl trigger: Pointer is at Top (angle 3*PI/2)
      const normalizedAngle = (newAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const pointerAngle = (3 * Math.PI / 2 - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);

      const currentSliceIndex = slices.findIndex(
        (s) => pointerAngle >= s.startAngle && pointerAngle < s.endAngle
      );

      if (currentSliceIndex !== -1 && currentSliceIndex !== lastPegIndexRef.current) {
        lastPegIndexRef.current = currentSliceIndex;
        sounds.playMechanicalTick(1 - progress * 0.7);

        // Visual spring pawl deflection
        setPawlAngle(-0.25);
        setTimeout(() => setPawlAngle(0.08), 35);
        setTimeout(() => setPawlAngle(0), 75);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished
        setIsSpinning(false);
        sounds.stopProjectorWhir();

        const winningSlice = slices.find(
          (s) => pointerAngle >= s.startAngle && pointerAngle < s.endAngle
        ) || slices[0];

        if (winningSlice) {
          setWinnerMovie(winningSlice.movie);
          sounds.playVintageWinnerFanfare();

          confetti({
            particleCount: 110,
            spread: 75,
            origin: { y: 0.58 },
            colors: ['#d97706', '#f59e0b', '#b91c1c', '#fef3c7', '#78350f'],
          });

          setTimeout(() => {
            setShowWinnerModal(true);
          }, 350);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Rule 2.4: a judge burns a veto card -> cancel this result and spin again
  const handleVeto = async (judge: string) => {
    if (isVetoing) return;
    setIsVetoing(true);
    try {
      const res = await fetch('/api/veto/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judge }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.cards) setVetoCounts(data.cards);
      if (!res.ok) {
        alert('❌ ' + (data.error || 'Không dùng được Lá Bài Veto, hãy thử lại.'));
        return;
      }
      setShowWinnerModal(false);
      handleSpin();
      setVetoNotice(`🛡️ ${judge} đã dùng Lá Bài Veto! Kết quả vừa rồi đã bị hủy!`);
    } catch {
      alert('Không kết nối được server, chưa dùng Lá Bài Veto.');
    } finally {
      setIsVetoing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sounds.stopProjectorWhir();
    };
  }, []);

  return (
    <div className={`relative rounded-3xl border brass-border bg-[#130f0d]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md art-deco-frame transition-all duration-700 ${isSpinning ? 'cinema-glow' : ''}`}>
      {/* Film Grain Texture Overlay */}
      <div className="absolute inset-0 rounded-3xl film-grain pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-900/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5ebd9] font-cinema">
              Bàn Tời Cơ Khí Chọn Phim 35mm
            </h2>
          </div>
          <p className="text-xs text-[#a8998a] mt-1 font-sans">
            Mô phỏng trục quay máy chiếu phim vintage với quán tính ma sát cơ học và lẫy kim loại lò xo.
          </p>
        </div>

        {/* Filter Controls (Unboxed, clean tabs) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              sounds.playVintageSwitch();
              setWeightedByVotes(!weightedByVotes);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              weightedByVotes
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                : 'bg-[#1e1713] border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {weightedByVotes ? '⚖️ Theo tỷ lệ Phiếu bầu' : '🎲 Công bằng 100%'}
          </button>

          <button
            onClick={() => {
              sounds.playVintageSwitch();
              setOnlyUnwatched(!onlyUnwatched);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              onlyUnwatched
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                : 'bg-[#1e1713] border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {onlyUnwatched ? '✓ Chưa chiếu rạp' : 'Tất cả phim'}
          </button>
        </div>
      </div>

      {/* Main Reel Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
        {/* Left: Mechanical Film Reel Canvas & Escapement Pawl */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          {/* Spring-loaded Mechanical Escapement Pawl at Top */}
          <div
            className="relative z-20 -mb-6 flex flex-col items-center pointer-events-none transition-transform duration-75"
            style={{
              transform: `rotate(${pawlAngle}rad)`,
              transformOrigin: 'top center',
            }}
          >
            {/* Pawl Needle */}
            <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]" />
            <div className="w-3.5 h-3.5 rounded-full bg-amber-200 -mt-7 border-2 border-stone-900 shadow-md" />
          </div>

          {/* Canvas Housing (Bệ máy chiếu bằng gỗ óc chó & viền đồng) */}
          <div className="relative p-3 rounded-full bg-gradient-to-b from-[#241a14] via-[#120d0a] to-[#0a0705] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border-2 border-amber-600/30">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="max-w-full h-auto rounded-full touch-none select-none"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => {
                setVetoNotice(null);
                handleSpin();
              }}
              disabled={isSpinning || eligibleMovies.length === 0}
              className="group relative px-9 py-3.5 rounded-xl font-extrabold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_35px_-5px_rgba(217,119,6,0.6)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-3 text-sm tracking-wider font-cinema uppercase"
            >
              <Sparkles className={`w-4 h-4 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
              <span>{isSpinning ? 'Đang tời phim 35mm...' : 'Lên Cót & Quay Phim!'}</span>
            </button>
          </div>
          {vetoNotice && (
            <p className="mt-3 text-xs font-semibold text-red-300 text-center">{vetoNotice}</p>
          )}
        </div>

        {/* Right: Reel Filter Parameters & Candidate Pool */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl bg-[#0e0b09] border border-amber-900/30 p-4 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400/90 uppercase tracking-wider mb-3">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Điều chỉnh ống kính & bộ lọc</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Thể loại ưu tiên chiếu:</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-[#18120e] border border-amber-900/40 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Tất cả thể loại ({movies.length} phim)</option>
                  {availableGenres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Thời lượng tối đa:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Tất cả', val: 0 },
                    { label: '< 2 tiếng', val: 120 },
                    { label: '< 2.5 tiếng', val: 150 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setMaxDuration(opt.val)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-colors font-mono ${
                        maxDuration === opt.val
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                          : 'bg-[#18120e] border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Reel Spool List */}
          <div className="rounded-2xl bg-[#0e0b09] border border-amber-900/30 p-4 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-stone-400 font-semibold uppercase tracking-wider">
                Cuộn phim sẵn sàng ({eligibleMovies.length})
              </span>
              <span className="text-amber-400 font-mono text-[11px]">
                {weightedByVotes ? 'Tỷ lệ theo số vote' : 'Tỷ lệ đều'}
              </span>
            </div>

            {restrictedProposer && (
              <p className="mb-2 p-2 rounded-lg bg-red-950/40 border border-red-900/50 text-[11px] text-red-200">
                ⛔ {restrictedProposer} đề xuất 2 phim xem gần nhất, phim của {restrictedProposer} tạm nghỉ lượt quay này.
              </p>
            )}

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {eligibleMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#18120e]/80 border border-stone-800/80 text-xs hover:border-amber-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-stone-200 font-medium truncate">{movie.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-400 shrink-0 font-mono text-[11px]">
                    {isBuffed(movie) && (
                      <span
                        className="text-orange-300 font-bold"
                        title={`${movie.suggestedBy} không có phim nào trong 3 phim xem gần nhất: cơ hội x2`}
                      >
                        🔥x2
                      </span>
                    )}
                    <span>{movie.durationMinutes}m</span>
                    <span className="text-amber-400 font-bold">{movie.votes.length}v</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WINNER MODAL: Authentic Vintage Letterpress Cinema Ticket */}
      {showWinnerModal && winnerMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#16110e] border-2 border-amber-500/60 shadow-[0_0_80px_rgba(217,119,6,0.35)] overflow-hidden">
            {/* Vintage Ticket Perforated Header */}
            <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between text-neutral-950">
              <div className="flex items-center gap-2.5">
                <Ticket className="w-5 h-5 text-neutral-950 fill-neutral-950" />
                <span className="font-extrabold tracking-widest uppercase text-xs sm:text-sm font-cinema">
                  VÉ CHIẾU PHIM ĐỘC QUYỀN CUỐI TUẦN
                </span>
              </div>
              <button
                onClick={() => setShowWinnerModal(false)}
                className="text-neutral-950/80 hover:text-neutral-950 text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Ticket Body with Vintage Letterpress Aesthetic */}
            <div className="p-6 relative">
              {/* Perforated Stub Line Indicator */}
              <div className="absolute top-0 inset-x-6 border-t-2 border-dashed border-amber-700/40" />

              <div className="flex flex-col sm:flex-row gap-5 items-start pt-3">
                <img
                  src={winnerMovie.posterUrl}
                  alt={winnerMovie.title}
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-36 h-52 object-cover rounded-xl shadow-2xl border border-amber-600/40 shrink-0"
                />

                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                    <span>{winnerMovie.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{winnerMovie.durationMinutes} phút</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400 font-semibold">{winnerMovie.platform}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#fdf8f0] font-cinema">
                    {winnerMovie.title}
                  </h3>

                  {winnerMovie.originalTitle && (
                    <p className="text-xs text-stone-400 italic">
                      {winnerMovie.originalTitle}
                    </p>
                  )}

                  <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">
                    {winnerMovie.synopsis}
                  </p>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                    <span className="font-bold text-amber-400">Đề xuất bởi:</span> {winnerMovie.suggestedBy}
                    <div className="mt-1 text-stone-300 italic">
                      &quot;{winnerMovie.whyWatch}&quot;
                    </div>
                  </div>
                </div>
              </div>

              {/* Veto Cards (Rule 2.3 & 2.4) */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-stone-400 uppercase tracking-wider">Lá Bài Veto:</span>
                {Object.entries(vetoCounts).map(([judge, count]) => (
                  <button
                    key={judge}
                    onClick={() => handleVeto(judge)}
                    disabled={isVetoing || isSpinning || count <= 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-200 text-xs font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{judge} ({count})</span>
                  </button>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-amber-900/40 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleSpin();
                    setShowWinnerModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#201813] hover:bg-[#2b211a] text-stone-300 text-xs font-semibold transition-colors border border-stone-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quay lượt khác</span>
                </button>

                <div className="flex items-center gap-2">
                  {winnerMovie.trailerUrl && (
                    <button
                      onClick={() => {
                        onOpenTrailer(winnerMovie);
                        setShowWinnerModal(false);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#201813] hover:bg-[#2b211a] text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-amber-400/40" />
                      <span>Xem Trailer</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSelectForWeekend(winnerMovie);
                      setShowWinnerModal(false);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs shadow-lg transition-colors uppercase tracking-wider font-cinema"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chốt Chiếu Tuần Này</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
