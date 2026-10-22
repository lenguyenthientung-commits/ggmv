import React, { useState, useMemo } from 'react';
import { Movie } from '../types/cinema';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import { SectionHeader, Stat } from './ui';

interface MovieStatsProps {
  movies: Movie[];
}

// Chart colors read the design tokens, so charts follow theme and dark mode
const INK = 'var(--color-ink)';
const INK_3 = 'var(--color-ink-3)';
const LINE = 'var(--color-line)';
const ACCENT = 'var(--color-accent)';

const ChartTooltip: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="panel px-3.5 py-2.5 text-[13px] shadow-[3px_3px_0_var(--color-shadow)] max-w-xs">
    <div className="font-bold">{title}</div>
    <div className="mt-1 text-ink-2">{children}</div>
  </div>
);

export const MovieStats: React.FC<MovieStatsProps> = ({ movies }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [genreDataSource, setGenreDataSource] = useState<'watched' | 'all'>('watched');

  const watchedMovies = useMemo(() => movies.filter((m) => m.watched), [movies]);

  const totalWatchedCount = watchedMovies.length;
  const totalMinutes = watchedMovies.reduce((acc, m) => acc + m.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const allRatings: number[] = [];
  watchedMovies.forEach((m) => {
    m.reviews?.forEach((r) => allRatings.push(r.rating));
  });
  const avgGroupRating = allRatings.length > 0
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : '—';

  // Genre distribution
  const genreData = useMemo(() => {
    const targetMovies = genreDataSource === 'watched' ? watchedMovies : movies;
    const counts: Record<string, number> = {};
    targetMovies.forEach((m) => {
      m.genres.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [genreDataSource, watchedMovies, movies]);

  const topGenre = genreData[0]?.name || '—';

  // Movies watched per month in selectedYear
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthNum = index + 1;
      const prefix = `${selectedYear}-${String(monthNum).padStart(2, '0')}`;
      const matched = watchedMovies.filter((m) => m.watchedDate?.startsWith(prefix));
      return {
        month: `Tháng ${monthNum}`,
        shortMonth: `T${monthNum}`,
        soPhim: matched.length,
        phimTitles: matched.map((m) => m.title),
      };
    });
  }, [watchedMovies, selectedYear]);

  // Proposer leaderboard
  const topSuggestors = useMemo(() => {
    const counts: Record<string, { total: number; watched: number }> = {};
    movies.forEach((m) => {
      const person = m.suggestedBy || 'Khác';
      counts[person] ??= { total: 0, watched: 0 };
      counts[person].total += 1;
      if (m.watched) counts[person].watched += 1;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.watched - a.watched);
  }, [movies]);

  // Platform share
  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    watchedMovies.forEach((m) => {
      counts[m.platform] = (counts[m.platform] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [watchedMovies]);

  const axisProps = {
    stroke: LINE,
    tick: { fill: INK_3, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
    tickLine: false,
  };

  return (
    <section>
      <SectionHeader
        jp="データ"
        kicker="Thói quen xem phim"
        title="Thống kê"
        description="Thể loại cả hội mê nhất, tần suất chiếu theo tháng và người đề xuất mát tay nhất."
      />

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
        <Stat value={totalWatchedCount} label="Phim đã xem" />
        <Stat value={`${totalHours}h`} label="Thời lượng" />
        <Stat value={avgGroupRating} label="Điểm TB hội" accent />
        <Stat value={<span className="text-[0.62em] leading-[1.05] block">{topGenre}</span>} label="Thể loại #1" />
      </dl>

      {/* Monthly */}
      <div className="panel p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="label">Số phim mỗi tháng</div>
            <h3 className="mt-1 text-[20px] font-bold">Năm {selectedYear}</h3>
          </div>
          <div className="seg">
            {[2025, 2026, 2027].map((yr) => (
              <button key={yr} aria-pressed={selectedYear === yr} onClick={() => setSelectedYear(yr)}>
                {yr}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 sm:h-72 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis dataKey="shortMonth" {...axisProps} axisLine={{ stroke: INK }} />
              <YAxis allowDecimals={false} {...axisProps} axisLine={false} width={36} />
              <Tooltip
                cursor={{ stroke: INK, strokeWidth: 1 }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <ChartTooltip title={`${payload[0].payload.month} · ${payload[0].payload.soPhim} phim`}>
                      {payload[0].payload.phimTitles.length > 0
                        ? payload[0].payload.phimTitles.join(', ')
                        : 'Chưa có buổi chiếu'}
                    </ChartTooltip>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="soPhim"
                stroke={INK}
                strokeWidth={2.5}
                fill={ACCENT}
                fillOpacity={0.18}
                activeDot={{ r: 6, fill: ACCENT, stroke: INK, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Genres */}
      <div className="panel p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="label">Thể loại</div>
            <h3 className="mt-1 text-[20px] font-bold">Cả hội xem gì nhiều nhất</h3>
          </div>
          <div className="seg">
            <button aria-pressed={genreDataSource === 'watched'} onClick={() => setGenreDataSource('watched')}>
              Đã xem {watchedMovies.length}
            </button>
            <button aria-pressed={genreDataSource === 'all'} onClick={() => setGenreDataSource('all')}>
              Cả kho {movies.length}
            </button>
          </div>
        </div>
        <div className="h-72 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genreData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis
                dataKey="name"
                {...axisProps}
                tick={{ fill: INK, fontSize: 12 }}
                axisLine={{ stroke: INK }}
                angle={-25}
                textAnchor="end"
                interval={0}
                height={50}
              />
              <YAxis allowDecimals={false} {...axisProps} axisLine={false} width={36} />
              <Tooltip
                cursor={{ fill: 'var(--color-sunk)' }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <ChartTooltip title={payload[0].payload.name}>{payload[0].payload.count} phim</ChartTooltip>
                  ) : null
                }
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} stroke={INK} strokeWidth={1.5}>
                {genreData.map((_, index) => (
                  <Cell key={index} fill={index === 0 ? ACCENT : index < 3 ? INK : 'var(--color-card)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proposers */}
        <div className="panel">
          <div className="flex items-center justify-between px-5 h-12 border-b-[1.5px] border-ink">
            <span className="label !text-ink">Đề xuất mát tay nhất</span>
            <span className="label">Đã chiếu / kho</span>
          </div>
          <ol className="divide-y divide-line">
            {topSuggestors.map((person, idx) => (
              <li key={person.name} className="flex items-center gap-4 px-5 py-3">
                <span className={`display text-[28px] w-8 leading-none ${idx === 0 ? 'text-accent' : ''}`}>{idx + 1}</span>
                <span className="flex-1 min-w-0 font-semibold truncate">{person.name}</span>
                <span className="num text-[14px]">
                  <strong>{person.watched}</strong>
                  <span className="text-ink-3"> / {person.total}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Platforms */}
        <div className="panel">
          <div className="flex items-center justify-between px-5 h-12 border-b-[1.5px] border-ink">
            <span className="label !text-ink">Nguồn xem</span>
            <span className="label">Phim đã xem</span>
          </div>
          <ul className="p-5 space-y-4">
            {platformData.map((plat, idx) => {
              const pct = totalWatchedCount > 0 ? Math.round((plat.value / totalWatchedCount) * 100) : 0;
              return (
                <li key={plat.name}>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="font-semibold">{plat.name}</span>
                    <span className="num text-ink-2">{plat.value} · {pct}%</span>
                  </div>
                  <div className="mt-1.5 h-3 rounded-sm border-[1.5px] border-ink bg-card overflow-hidden">
                    <div className={`h-full ${idx === 0 ? 'bg-accent' : 'bg-ink'}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
            {platformData.length === 0 && <li className="text-[14px] text-ink-3">Chưa có dữ liệu.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
};
