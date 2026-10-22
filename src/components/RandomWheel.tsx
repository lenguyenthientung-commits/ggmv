import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Movie } from '../types/cinema';
import { sounds } from '../utils/soundEffects';
import { RotateCcw, Play, Check, Shuffle, Shield, X } from 'lucide-react';
import { Modal, SectionHeader } from './ui';
import { soundtrack } from '../utils/soundtrack';

interface RandomWheelProps {
  movies: Movie[];
  currentUser: string;
  onOpenRules?: () => void;
  onSelectForWeekend: (movie: Movie) => void;
  onOpenTrailer: (movie: Movie) => void;
  onEggsChanged?: () => void;
}

// Logical canvas size; drawn at 2x for sharp edges on high-DPI screens
const WHEEL_SIZE = 440;
const DPR = 2;

// Read a design token so the wheel follows the theme's accent
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// The pointer sits at the top (3π/2); returns the wheel-space angle under it
const TAU = Math.PI * 2;
const pointerAt = (rotation: number) => (1.5 * Math.PI - (((rotation % TAU) + TAU) % TAU) + TAU) % TAU;

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeOutRebound = (t: number) => {
  const p = 1 - Math.pow(1 - t, 4);
  return t > 0.95 ? p - Math.sin(((t - 0.95) / 0.05) * Math.PI) * 0.003 : p;
};

type SpinEnding = 'creep' | 'tip' | 'settle';
type SpinPhase = 'coast' | 'stall' | 'tip' | 'creep' | 'landed';
const PHASE_LABEL: Record<SpinPhase, string> = {
  coast: 'Đang lướt qua',
  stall: 'Dừng ở đây…?',
  tip: 'Lố mất rồi…?',
  creep: 'Khoan đã…',
  landed: 'Chốt!',
};

// Radiating speed lines behind the result reveal (static, decorative)
const SpeedLines: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.13]" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {Array.from({ length: 56 }, (_, i) => {
      const a = (i / 56) * Math.PI * 2 + (i % 3) * 0.02;
      const r1 = 150 + (i % 5) * 26;
      return (
        <line
          key={i}
          x1={Math.cos(a) * r1}
          y1={Math.sin(a) * r1}
          x2={Math.cos(a) * 760}
          y2={Math.sin(a) * 760}
          stroke="#f2eee6"
          strokeWidth={i % 4 === 0 ? 5 : 1.6}
        />
      );
    })}
  </svg>
);

export const RandomWheel: React.FC<RandomWheelProps> = ({
  movies,
  currentUser,
  onSelectForWeekend,
  onOpenTrailer,
  onEggsChanged,
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
  const [vetoNotice, setVetoNotice] = useState<string | null>(null);

  // Easter eggs (presentation only, the drawn movie never changes):
  // R1 near-miss: 10% of spins play a fake jackpot, a buzzer, then land on the same movie.
  // R2 double feature: the movie just vetoed comes straight back.
  const [fakeStage, setFakeStage] = useState<'jackpot' | 'denied' | null>(null);
  const [nearMiss, setNearMiss] = useState(false);
  const vetoedMovieRef = useRef<string | null>(null);
  // R3 The Prophecy: an optional guess filed with the server before the reel moves
  const [guessId, setGuessId] = useState('');
  const [prophecyBy, setProphecyBy] = useState<string | null>(null);
  const operationRef = useRef('');
  const guessRef = useRef<{ movieId: string; member: string } | null>(null);

  useEffect(() => {
    fetch('/api/veto')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.cards) setVetoCounts(data.cards);
      })
      .catch(() => {});
  }, []);

  // Pointer flick on every slice boundary
  const [pawlAngle, setPawlAngle] = useState(0);
  // Live readout under the pointer
  const [phase, setPhase] = useState<SpinPhase>('coast');
  const [passing, setPassing] = useState('');

  // The soundtrack steps back while the reel turns
  useEffect(() => {
    soundtrack.duck(isSpinning);
  }, [isSpinning]);

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

    const weights = eligibleMovies.map((m) => {
      const base = weightedByVotes ? Math.max(1, (m.votes?.length || 0) + 1) : 1;
      return isBuffed(m) ? base * 2 : base;
    });

    const totalWeight = weights.reduce((acc, w) => acc + w, 0);

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
        tone: index % 4,
        odds: weights[index] / totalWeight,
      };
    });
  }, [eligibleMovies, weightedByVotes, recentThreeProposers]);

  // Draw the wheel: four flat tones (ink, accent, card, sunk) split by ink rules.
  // spot (0..1) dims every slice except the one under the pointer.
  const drawWheel = (rotationAngle: number, spot = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ink = token('--color-ink') || '#16140f';
    const paper = token('--color-paper') || '#f2eee6';
    const card = token('--color-card') || '#fbf9f4';
    const sunk = token('--color-sunk') || '#e7e1d4';
    const accent = token('--color-accent') || '#ff4a1c';
    const onAccent = token('--color-on-accent') || '#ffffff';
    const tones = [
      { fill: ink, text: paper },
      { fill: accent, text: onAccent },
      { fill: card, text: ink },
      { fill: sunk, text: ink },
    ];

    const size = WHEEL_SIZE;
    const c = size / 2;
    const radius = c - 10;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Base disc
    ctx.beginPath();
    ctx.arc(c, c, radius, 0, 2 * Math.PI);
    ctx.fillStyle = card;
    ctx.fill();

    if (slices.length === 0) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = ink;
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = '600 15px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Không phim nào khớp bộ lọc', c, c);
      return;
    }

    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(rotationAngle);

    // Avoid two neighbours sharing a tone when the count wraps around
    const toneOf = (i: number) => (i === slices.length - 1 && i % 4 === 0 && slices.length > 1 ? 2 : slices[i].tone);

    slices.forEach((slice, i) => {
      const tone = tones[toneOf(i)];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, slice.startAngle, slice.endAngle);
      ctx.closePath();
      ctx.fillStyle = tone.fill;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ink;
      ctx.stroke();

      // Title along the slice, only when the slice is wide enough to read
      const sweep = slice.endAngle - slice.startAngle;
      if (sweep > 0.11) {
        ctx.save();
        ctx.rotate(slice.startAngle + sweep / 2);
        ctx.fillStyle = tone.text;
        ctx.font = '700 12.5px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        let title = slice.movie.title;
        if (title.length > 20) title = title.substring(0, 19) + '…';
        ctx.fillText(title, radius - 18, 0);
        ctx.restore();
      }
    });

    if (spot > 0) {
      const pointer = pointerAt(rotationAngle);
      const lit = slices.findIndex((s) => pointer >= s.startAngle && pointer < s.endAngle);
      slices.forEach((slice, i) => {
        if (i === lit) return;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, slice.startAngle, slice.endAngle);
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * spot})`;
        ctx.fill();
      });
      if (lit !== -1) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, slices[lit].startAngle, slices[lit].endAngle);
        ctx.closePath();
        ctx.lineJoin = 'round';
        ctx.lineWidth = 6 * spot;
        ctx.strokeStyle = accent;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = ink;
        ctx.stroke();
      }
    }

    ctx.restore();

    // Dial ticks on the rim
    ctx.save();
    ctx.translate(c, c);
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (radius + 1), Math.sin(a) * (radius + 1));
      ctx.lineTo(Math.cos(a) * (radius + (long ? 9 : 5)), Math.sin(a) * (radius + (long ? 9 : 5)));
      ctx.lineWidth = long ? 2 : 1;
      ctx.strokeStyle = ink;
      ctx.stroke();
    }
    ctx.restore();

    // Outer rim
    ctx.beginPath();
    ctx.arc(c, c, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = ink;
    ctx.stroke();

    // Hub
    ctx.beginPath();
    ctx.arc(c, c, 40, 0, 2 * Math.PI);
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = accent;
    ctx.stroke();
    ctx.fillStyle = paper;
    ctx.font = '900 22px "Archivo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GG', c, c + 1);
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
    // Redraw once web fonts are ready so canvas text uses them
    document.fonts?.ready.then(() => drawWheel(currentAngleRef.current));
    // Canvas does not follow CSS: redraw when theme / mode changes
    const observer = new MutationObserver(() => drawWheel(currentAngleRef.current));
    observer.observe(document.documentElement, { attributeFilter: ['data-theme', 'data-mode', 'data-world'] });
    return () => observer.disconnect();
  }, [slices]);

  // The draw is fixed the moment Quay! is pressed: a uniformly random landing angle.
  // Everything after only shapes the path to it, for suspense:
  //   wind-up -> long coast with a spotlight closing in -> one of three endings
  //   'creep'  stalls just short of the winning slice, then creeps over the line
  //   'tip'    rolls past into the next slice, hangs there, then rolls back
  //   'settle' a plain long stop with a small rebound
  const handleSpin = () => {
    if (isSpinning || slices.length === 0) return;

    sounds.playVintageSwitch();
    sounds.startProjectorWhir();
    setIsSpinning(true);
    setWinnerMovie(null);
    setShowWinnerModal(false);
    setProphecyBy(null);

    // One operation id per spin; a guess is filed now, before any result exists
    operationRef.current = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    guessRef.current = null;
    if (guessId && eligibleMovies.some((m) => m.id === guessId)) {
      guessRef.current = { movieId: guessId, member: currentUser };
      fetch('/api/eggs/prophecy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId: operationRef.current, guessMovieId: guessId, member: currentUser }),
      }).catch(() => {});
    }
    setGuessId('');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Rotations: 7 to 10 full turns + random landing angle
    const start = currentAngleRef.current;
    const target = start + (7 + Math.random() * 3) * (2 * Math.PI) + Math.random() * (2 * Math.PI);

    // Where the pointer lands inside its slice. Turning the wheel forward moves the pointer
    // backwards through the slices: it entered through endAngle and would leave through startAngle.
    const landing = pointerAt(target);
    const landed = slices.find((s) => landing >= s.startAngle && landing < s.endAngle) ?? slices[0];
    const sinceEntered = landed.endAngle - landing;
    const beforeLeaving = landing - landed.startAngle;

    const roll = Math.random();
    let ending: SpinEnding = 'settle';
    if (!reducedMotion && slices.length > 1) {
      if (roll < 0.45 && sinceEntered < 0.6) ending = 'creep';
      else if (roll < 0.8 && beforeLeaving < 0.35) ending = 'tip';
    }
    const stall = ending === 'creep' ? target - sinceEntered - 0.06 : ending === 'tip' ? target + beforeLeaving + 0.07 : target;

    const windUp = reducedMotion ? 0 : 380;
    const coast = reducedMotion ? 2600 : 5600;
    const segments: { from: number; to: number; ms: number; ease: (t: number) => number; phase: SpinPhase }[] = [
      { from: start, to: start - 0.22, ms: windUp, ease: easeInOutSine, phase: 'coast' },
      { from: start - 0.22, to: stall, ms: coast, ease: ending === 'settle' ? easeOutRebound : easeOutQuint, phase: 'coast' },
    ];
    if (ending === 'creep') {
      segments.push({ from: stall, to: stall, ms: 700, ease: (t) => t, phase: 'stall' });
      segments.push({ from: stall, to: target, ms: 1100, ease: easeInOutSine, phase: 'creep' });
    } else if (ending === 'tip') {
      segments.push({ from: stall, to: stall, ms: 750, ease: (t) => t, phase: 'tip' });
      segments.push({ from: stall, to: target, ms: 700, ease: easeInOutCubic, phase: 'creep' });
    }
    const total = segments.reduce((sum, s) => sum + s.ms, 0);
    const spotFrom = windUp + coast * 0.5;
    const spotTo = windUp + coast * 0.85;

    const startTime = performance.now();
    let lastFrame = startTime;
    let lastAngle = start;
    let lastBeat = 0;
    lastPegIndexRef.current = -1;

    const animate = (now: number) => {
      const elapsed = Math.min(now - startTime, total);

      // Current segment and angle
      let t0 = 0;
      let seg = segments[segments.length - 1];
      for (const s of segments) {
        if (elapsed < t0 + s.ms || s === segments[segments.length - 1]) { seg = s; break; }
        t0 += s.ms;
      }
      const local = seg.ms > 0 ? Math.min((elapsed - t0) / seg.ms, 1) : 1;
      let angle = seg.from + (seg.to - seg.from) * seg.ease(local);
      // A stalled wheel is never quite still
      if (seg.phase === 'stall' || seg.phase === 'tip') angle += Math.sin(local * Math.PI * 6) * 0.004;
      if (elapsed >= total) angle = target;

      const spot = Math.min(1, Math.max(0, (elapsed - spotFrom) / (spotTo - spotFrom)));
      currentAngleRef.current = angle;
      drawWheel(angle, spot);
      setPhase(seg.phase);

      // Ticks get heavier and slower with the wheel
      const speed = Math.abs(angle - lastAngle) / Math.max(1, now - lastFrame);
      lastAngle = angle;
      lastFrame = now;
      const pointer = pointerAt(angle);
      const index = slices.findIndex((s) => pointer >= s.startAngle && pointer < s.endAngle);
      if (index !== -1 && index !== lastPegIndexRef.current) {
        lastPegIndexRef.current = index;
        setPassing(slices[index].movie.title);
        sounds.playMechanicalTick(Math.max(0.3, Math.min(1, speed / 0.03)));
        setPawlAngle(-0.25);
        setTimeout(() => setPawlAngle(0.08), 35);
        setTimeout(() => setPawlAngle(0), 75);
      }

      // Heartbeat once the spotlight is closing in, faster while it hangs
      const beatEvery = seg.phase === 'coast' ? 760 : 520;
      if (spot > 0.3 && now - lastBeat > beatEvery) {
        lastBeat = now;
        sounds.playHeartbeat();
      }

      if (elapsed < total) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      sounds.stopProjectorWhir();
      // The result is fixed here; everything after is presentation
      const movie = landed.movie;
      const fakeVictory = !reducedMotion && Math.random() < 0.1;
      recordSpin(movie, fakeVictory);
      setWinnerMovie(movie);
      setNearMiss(fakeVictory);
      setProphecyBy(guessRef.current?.movieId === movie.id ? guessRef.current.member : null);
      setPhase('landed');

      // One beat of silence before the reveal
      setTimeout(() => {
        if (fakeVictory) {
          runFakeVictory(target, () => {
            setIsSpinning(false);
            setTimeout(() => setShowWinnerModal(true), 250);
          });
          return;
        }
        setIsSpinning(false);
        celebrate();
        setTimeout(() => setShowWinnerModal(true), 450);
      }, reducedMotion ? 0 : 420);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const celebrate = (particles = 90) => {
    sounds.playVintageWinnerFanfare();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({
        particleCount: particles,
        spread: 70,
        origin: { y: 0.55 },
        colors: [token('--color-accent') || '#ff4a1c', '#16140f', '#f2eee6'],
      });
    }
  };

  // R1 "Near-miss insurance": jackpot, buzzer, the reel rocks back and returns to the SAME angle
  const runFakeVictory = (finalAngle: number, done: () => void) => {
    setFakeStage('jackpot');
    celebrate(40);
    setTimeout(() => {
      sounds.playTrollBuzzer();
      setFakeStage('denied');
      const start = performance.now();
      const duration = 1600;
      const rock = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const angle = finalAngle - 0.9 * Math.sin(Math.PI * t); // sin(pi) = 0: ends exactly where it stopped
        currentAngleRef.current = t < 1 ? angle : finalAngle;
        drawWheel(currentAngleRef.current);
        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(rock);
        } else {
          setTimeout(() => {
            setFakeStage(null);
            done();
          }, 450);
        }
      };
      animationFrameRef.current = requestAnimationFrame(rock);
    }, 1100);
  };

  // Ledger write for the spin (never blocks or changes the result)
  const recordSpin = (movie: Movie, showedFakeVictory: boolean) => {
    const vetoedMovieId = vetoedMovieRef.current;
    vetoedMovieRef.current = null;
    if (!showedFakeVictory && vetoedMovieId !== movie.id && guessRef.current?.movieId !== movie.id) return;
    fetch('/api/eggs/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operationId: operationRef.current,
        movieId: movie.id,
        movieTitle: movie.title,
        showedFakeVictory,
        vetoedMovieId,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recorded?.length) onEggsChanged?.();
      })
      .catch(() => {});
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
        alert(data.error || 'Không dùng được Lá Bài Veto, hãy thử lại.');
        return;
      }
      setShowWinnerModal(false);
      vetoedMovieRef.current = winnerMovie?.id ?? null;
      handleSpin();
      setVetoNotice(`${judge} đã dùng Lá Bài Veto. Kết quả trước bị hủy, quay lại!`);
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

  const idlePointer = pointerAt(currentAngleRef.current);
  const idleTitle = slices.find((s) => idlePointer >= s.startAngle && idlePointer < s.endAngle)?.movie.title ?? '';

  const oddsById = new Map(slices.map((s) => [s.movie.id, s.odds]));

  return (
    <section>
      <SectionHeader
        jp="ルーレット"
        kicker={`${eligibleMovies.length} phim trong vòng quay`}
        title="Vòng quay"
        description="Kết quả là tuyệt đối. Không vừa ý thì giám khảo phải đốt một lá bài veto."
      >
        <div className="seg">
          <button aria-pressed={weightedByVotes} onClick={() => { sounds.playVintageSwitch(); setWeightedByVotes(true); }}>Theo vote</button>
          <button aria-pressed={!weightedByVotes} onClick={() => { sounds.playVintageSwitch(); setWeightedByVotes(false); }}>Chia đều</button>
        </div>
        <div className="seg">
          <button aria-pressed={onlyUnwatched} onClick={() => { sounds.playVintageSwitch(); setOnlyUnwatched(true); }}>Chưa xem</button>
          <button aria-pressed={!onlyUnwatched} onClick={() => { sounds.playVintageSwitch(); setOnlyUnwatched(false); }}>Tất cả</button>
        </div>
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Wheel stage */}
        <div className="relative lg:col-span-7 panel screentone overflow-hidden px-4 py-8 sm:p-10 flex flex-col items-center">
          {fakeStage && winnerMovie && (
            <div className="absolute inset-x-4 top-6 z-20 flex justify-center pointer-events-none" role="status" aria-live="polite">
              {fakeStage === 'jackpot' ? (
                <div className="enter bg-accent text-on-accent border-[1.5px] border-ink rounded-lg px-5 py-3 shadow-[4px_4px_0_var(--color-shadow)] text-center">
                  <div className="display text-[40px] leading-none">Jackpot?!</div>
                  <div className="text-[13px] font-semibold mt-1 max-w-[260px] truncate">{winnerMovie.title}</div>
                </div>
              ) : (
                <div className="enter bg-card border-[1.5px] border-ink rounded-lg px-5 py-3 shadow-[4px_4px_0_var(--color-shadow)] text-center">
                  <span className="stamp stamp-land text-stop !text-[20px]">Claim denied ♧</span>
                  <div className="label mt-2">Not legally binding · đảo reel…</div>
                </div>
              )}
            </div>
          )}
          <div
            className="relative z-10 -mb-5 pointer-events-none"
            style={{ transform: `rotate(${pawlAngle}rad)`, transformOrigin: 'top center', transition: 'transform 75ms' }}
            aria-hidden="true"
          >
            <svg width="34" height="40" viewBox="0 0 34 40">
              <path d="M3 2h28L17 37z" fill="var(--color-accent)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </div>

          <canvas
            ref={canvasRef}
            width={WHEEL_SIZE * DPR}
            height={WHEEL_SIZE * DPR}
            style={{ width: WHEEL_SIZE }}
            className="max-w-full h-auto rounded-full touch-none select-none"
            role="img"
            aria-label={`Vòng quay với ${eligibleMovies.length} phim`}
          />

          {/* Live readout: what the pointer is on right now */}
          <div className="mt-6 h-[64px] w-full max-w-[440px] text-center" aria-live="off">
            {isSpinning && phase !== 'coast' ? (
              <span key={phase} className="chip chip-accent enter">{PHASE_LABEL[phase]}</span>
            ) : (
              <div className="label">{isSpinning ? PHASE_LABEL[phase] : 'Kim đang chỉ'}</div>
            )}
            <div className={`display truncate leading-tight mt-1 transition-[font-size] ${isSpinning && phase !== 'coast' ? 'text-[28px] text-accent' : 'text-[22px]'}`}>
              {(isSpinning ? passing : idleTitle) || '—'}
            </div>
          </div>

          <button
            onClick={() => {
              setVetoNotice(null);
              handleSpin();
            }}
            disabled={isSpinning || eligibleMovies.length === 0}
            className="btn btn-primary btn-lg mt-4 min-w-[220px]"
          >
            <Shuffle className={`w-[18px] h-[18px] ${isSpinning ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            {isSpinning ? 'Đang quay…' : 'Quay!'}
          </button>
          {/* R3 The Prophecy: optional, filed with the server when Quay! is pressed */}
          <div className="mt-5 flex items-center gap-2.5 bg-card border-[1.5px] border-line rounded-lg pl-3 pr-1.5 py-1.5 max-w-full">
            <label htmlFor="prophecy" className="label shrink-0" title="Ghi lời đoán trước khi quay. Đoán trúng sẽ được rạp ghi nhận.">
              Tiên tri
            </label>
            <select
              id="prophecy"
              value={guessId}
              onChange={(e) => setGuessId(e.target.value)}
              disabled={isSpinning}
              className="input !h-8 !border-0 !bg-transparent !px-1 text-[13px] min-w-0 max-w-[240px]"
            >
              <option value="">Không đoán</option>
              {eligibleMovies.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          {vetoNotice && (
            <p className="mt-4 bg-card border-[1.5px] border-ink rounded-md px-3 py-1.5 text-[13px] font-semibold text-center">
              {vetoNotice}
            </p>
          )}
        </div>

        {/* Controls & pool */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="panel p-5 space-y-5">
            <div className="label !text-ink">Bộ lọc</div>
            <div>
              <label className="field-label" htmlFor="wheel-genre">Thể loại</label>
              <select
                id="wheel-genre"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="input"
              >
                <option value="all">Mọi thể loại</option>
                {availableGenres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="field-label">Thời lượng tối đa</div>
              <div className="seg">
                {[
                  { label: 'Không giới hạn', val: 0 },
                  { label: '< 2 tiếng', val: 120 },
                  { label: '< 2.5 tiếng', val: 150 },
                ].map((opt) => (
                  <button key={opt.val} aria-pressed={maxDuration === opt.val} onClick={() => setMaxDuration(opt.val)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="flex items-center justify-between px-5 h-12 border-b-[1.5px] border-ink">
              <span className="label !text-ink">Tỷ lệ trúng</span>
              <span className="label">{weightedByVotes ? 'Theo vote' : 'Chia đều'}</span>
            </div>

            {restrictedProposer && (
              <p className="mx-5 mt-4 px-3 py-2 rounded-md bg-sunk text-[13px] leading-snug">
                <strong>{restrictedProposer}</strong> đề xuất 2 phim xem gần nhất, nên phim của {restrictedProposer} nghỉ lượt này.
              </p>
            )}

            <ul className="max-h-[360px] overflow-y-auto px-2 py-2">
              {eligibleMovies.map((movie) => {
                const odds = oddsById.get(movie.id) ?? 0;
                return (
                  <li key={movie.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sunk transition-colors">
                    <span className="flex-1 min-w-0 text-[14px] font-medium truncate">{movie.title}</span>
                    {isBuffed(movie) && (
                      <span
                        className="chip chip-accent !h-5"
                        title={`${movie.suggestedBy} không có phim nào trong 3 phim xem gần nhất: cơ hội x2`}
                      >
                        x2
                      </span>
                    )}
                    <span className="num text-[12px] text-ink-3 w-9 text-right">{movie.durationMinutes}′</span>
                    <span className="num text-[13px] font-bold w-11 text-right">{Math.round(odds * 100)}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>

      {/* Result reveal: the lights go down */}
      {showWinnerModal && winnerMovie && (
        <Modal onClose={() => setShowWinnerModal(false)} tone="night" size="lg" label={`Kết quả: ${winnerMovie.title}`}>
          <div className="relative">
            <SpeedLines />
            <button
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-3 right-3 z-10 grid place-items-center w-9 h-9 rounded-md text-night-ink/70 hover:text-night-ink hover:bg-night-2 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative grid sm:grid-cols-[200px_1fr] gap-6 sm:gap-8 p-6 sm:p-9">
              <img
                src={winnerMovie.posterUrl}
                alt={winnerMovie.title}
                referrerPolicy="no-referrer"
                className="w-40 sm:w-full rounded-md border-[1.5px] border-night-ink shadow-[6px_6px_0_var(--color-accent)]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="jp text-[12px]">ケッテイ</span>
                  <span className="label !text-night-ink/60">Phim tuần này là</span>
                </div>
                <h3 className="display mt-3 text-[clamp(40px,6.5vw,68px)]">{winnerMovie.title}</h3>
                {prophecyBy && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="stamp stamp-land text-accent">Prophecy confirmed</span>
                    <span className="text-[13px] text-night-ink/70">{prophecyBy} made this claim before the reel moved.</span>
                  </div>
                )}
                {nearMiss && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="stamp stamp-land text-accent">Near-miss insurance · Claim denied</span>
                    <span className="text-[13px] text-night-ink/70">Your prize is the film you were going to watch anyway.</span>
                  </div>
                )}
                <div className="label !text-night-ink/60 mt-3">
                  {winnerMovie.year} · {winnerMovie.durationMinutes} phút · {winnerMovie.platform}
                </div>
                <p className="mt-4 text-[14px] leading-relaxed text-night-ink/75 line-clamp-3">{winnerMovie.synopsis}</p>
                <p className="mt-4 text-[14px]">
                  <span className="font-semibold">{winnerMovie.suggestedBy}:</span>{' '}
                  <span className="text-night-ink/75">“{winnerMovie.whyWatch}”</span>
                </p>
              </div>
            </div>

            {Object.keys(vetoCounts).length > 0 && (
              <div className="relative flex flex-wrap items-center gap-2 px-6 sm:px-9 py-4 border-t-[1.5px] border-night-line">
                <span className="label !text-night-ink/60 mr-1">Lá bài veto</span>
                {Object.entries(vetoCounts).map(([judge, count]) => (
                  <button
                    key={judge}
                    onClick={() => handleVeto(judge)}
                    disabled={isVetoing || isSpinning || count <= 0}
                    className="btn btn-sm"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {judge}
                    <span className="num text-night-ink/60">{count}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex flex-wrap items-center gap-2.5 px-6 sm:px-9 py-5 border-t-[1.5px] border-night-line">
              <button
                onClick={() => {
                  handleSpin();
                  setShowWinnerModal(false);
                }}
                className="btn btn-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Quay lại
              </button>
              {winnerMovie.trailerUrl && (
                <button
                  onClick={() => {
                    onOpenTrailer(winnerMovie);
                    setShowWinnerModal(false);
                  }}
                  className="btn btn-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Trailer
                </button>
              )}
              <button
                onClick={() => {
                  onSelectForWeekend(winnerMovie);
                  setShowWinnerModal(false);
                }}
                className="btn btn-primary sm:ml-auto"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                Chốt chiếu tuần này
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
