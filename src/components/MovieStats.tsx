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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Film,
  Clock,
  Star,
  Award,
  Flame,
  Tv,
  Filter,
} from 'lucide-react';

interface MovieStatsProps {
  movies: Movie[];
}

const PALETTE = [
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

export const MovieStats: React.FC<MovieStatsProps> = ({ movies }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [genreDataSource, setGenreDataSource] = useState<'watched' | 'all'>('watched');

  // Watched movies
  const watchedMovies = useMemo(() => {
    return movies.filter((m) => m.watched);
  }, [movies]);

  // Overall Quick Stats
  const totalWatchedCount = watchedMovies.length;
  const totalMinutes = watchedMovies.reduce((acc, m) => acc + m.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);

  // Average Rating
  const allRatings: number[] = [];
  watchedMovies.forEach((m) => {
    if (m.reviews) {
      m.reviews.forEach((r) => allRatings.push(r.rating));
    }
  });
  const avgGroupRating = allRatings.length > 0
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : '9.2';

  // 1. Data: Genre Distribution (Watched or All)
  const genreData = useMemo(() => {
    const targetMovies = genreDataSource === 'watched' ? watchedMovies : movies;
    const counts: Record<string, number> = {};

    targetMovies.forEach((m) => {
      m.genres.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });

    const list = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));

    // Sort descending
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [genreDataSource, watchedMovies, movies]);

  // Top Genre
  const topGenre = genreData[0]?.name || 'Khoa học viễn tưởng';

  // 2. Data: Movies Watched Per Month in selectedYear
  const monthlyData = useMemo(() => {
    const monthNames = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];

    const months = monthNames.map((name, index) => {
      const monthNum = index + 1;
      const formattedMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      const prefix = `${selectedYear}-${formattedMonth}`;

      const matchedMovies = watchedMovies.filter((m) => {
        if (!m.watchedDate) return false;
        return m.watchedDate.startsWith(prefix);
      });

      return {
        month: name,
        shortMonth: `T${monthNum}`,
        soPhim: matchedMovies.length,
        phimTitles: matchedMovies.map((m) => m.title),
      };
    });

    return months;
  }, [watchedMovies, selectedYear]);

  // 3. Data: Top Suggestor / Submitter Stats
  const topSuggestors = useMemo(() => {
    const counts: Record<string, { total: number; watched: number }> = {};
    movies.forEach((m) => {
      const person = m.suggestedBy || 'Khác';
      if (!counts[person]) {
        counts[person] = { total: 0, watched: 0 };
      }
      counts[person].total += 1;
      if (m.watched) {
        counts[person].watched += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        total: data.total,
        watched: data.watched,
      }))
      .sort((a, b) => b.watched - a.watched);
  }, [movies]);

  // 4. Data: Platform Share
  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    watchedMovies.forEach((m) => {
      counts[m.platform] = (counts[m.platform] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [watchedMovies]);

  // Custom Tooltip for Monthly Area Chart
  const CustomMonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 shadow-2xl text-xs space-y-1.5 z-50 max-w-xs">
          <div className="font-bold text-amber-400 font-cinema text-sm">
            {label} ({selectedYear})
          </div>
          <div className="text-neutral-300 font-semibold">
            Đã xem: <span className="text-white font-mono">{data.soPhim} bộ phim</span>
          </div>
          {data.phimTitles && data.phimTitles.length > 0 ? (
            <div className="pt-1 border-t border-neutral-800/80 space-y-1 text-neutral-400">
              {data.phimTitles.map((title: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-neutral-500 italic text-[11px]">Chưa có buổi chiếu phim nào</div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Genre Bar Chart
  const CustomGenreTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 shadow-2xl text-xs space-y-1 z-50">
          <div className="font-bold text-amber-400 font-cinema text-sm">{label}</div>
          <div className="text-neutral-300">
            Số lượng: <span className="text-white font-mono font-bold">{data.count} phim</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Highlights */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>Phân Tích Dữ Liệu Rạp Phim</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-cinema">
              Thống Kê Thói Quen Xem Phim Của Anh Em
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Khám phá thể loại yêu thích, tần suất cày phim theo từng tháng trong năm và người đề xuất mát tay nhất.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full sm:w-auto">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono tabular-nums">
                {totalWatchedCount}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Phim đã xem</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono tabular-nums">
                {totalHours}h
              </div>
              <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Thời lượng</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono tabular-nums">
                {avgGroupRating}★
              </div>
              <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Điểm TB hội</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <div className="text-sm font-bold text-amber-400 truncate max-w-[100px] mx-auto">
                {topGenre}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Thể loại #1</div>
            </div>
          </div>
        </div>

        {/* Chart 1: Số lượng phim đã xem mỗi tháng trong năm */}
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-cinema flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Số Lượng Phim Đã Xem Mỗi Tháng Trong Năm {selectedYear}</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Biểu đồ diễn biến tần suất chiếu phim cuối tuần qua 12 tháng
              </p>
            </div>

            {/* Year selector button group */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
              {[2025, 2026, 2027].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors font-mono ${
                    selectedYear === yr
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Năm {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="w-full h-72 sm:h-80 bg-neutral-950/60 rounded-2xl p-4 border border-neutral-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 20, right: 20, left: -15, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="movieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="shortMonth"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomMonthlyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="soPhim"
                  name="Số phim xem"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#movieGradient)"
                  activeDot={{ r: 6, fill: '#fef08a', stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Các thể loại phim anh em thường xem nhất */}
        <div className="mt-10 pt-8 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-cinema flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <span>Các Thể Loại Phim Anh Em Thường Xem Nhất</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Xếp hạng thể loại phim có tần suất xuất hiện cao nhất
              </p>
            </div>

            {/* DataSource Toggle Button */}
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setGenreDataSource('watched')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  genreDataSource === 'watched'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Chỉ phim đã xem ({watchedMovies.length})
              </button>
              <button
                onClick={() => setGenreDataSource('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  genreDataSource === 'all'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tất cả phim trong kho ({movies.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Bar Chart */}
            <div className="lg:col-span-8 w-full h-80 bg-neutral-950/60 rounded-2xl p-4 border border-neutral-800/80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genreData}
                  margin={{ top: 20, right: 20, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    tick={{ fill: '#d4d4d8', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={45}
                    axisLine={{ stroke: '#3f3f46' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#71717a"
                    tick={{ fill: '#a1a1aa', fontSize: 12 }}
                    axisLine={{ stroke: '#3f3f46' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomGenreTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Số lượng phim"
                    radius={[6, 6, 0, 0]}
                  >
                    {genreData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Genre breakdown ranking list */}
            <div className="lg:col-span-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 p-5 space-y-3">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Bảng xếp hạng thể loại
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {genreData.slice(0, 7).map((item, idx) => {
                  const maxCount = genreData[0]?.count || 1;
                  const percentage = Math.round((item.count / maxCount) * 100);

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                          />
                          <span className="font-medium text-neutral-200 truncate">
                            {idx + 1}. {item.name}
                          </span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold tabular-nums">
                          {item.count} phim
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: PALETTE[idx % PALETTE.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats: Đóng góp của anh em & Nền tảng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-8 border-t border-neutral-800">
          {/* Member contribution leaderboard */}
          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800/80 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Thành viên đề xuất mát tay nhất</span>
            </div>

            <div className="space-y-3">
              {topSuggestors.map((person, idx) => (
                <div
                  key={person.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/70 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-500 text-neutral-950'
                        : idx === 1
                        ? 'bg-neutral-300 text-neutral-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-neutral-200">{person.name}</div>
                      <div className="text-[11px] text-neutral-500">
                        {person.total} phim trong kho
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-emerald-400 font-bold">
                      {person.watched} đã chiếu
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Tỷ lệ chọn: {person.total > 0 ? Math.round((person.watched / person.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform breakdown */}
          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
                <Tv className="w-4 h-4 text-amber-400" />
                <span>Nguồn xem phim phổ biến</span>
              </div>

              <div className="space-y-2.5">
                {platformData.map((plat, idx) => {
                  const pct = totalWatchedCount > 0 ? Math.round((plat.value / totalWatchedCount) * 100) : 0;
                  return (
                    <div key={plat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300 font-medium">{plat.name}</span>
                        <span className="text-neutral-400 font-mono">
                          {plat.value} phim ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Phim hành động và viễn tưởng trên Netflix & HBO Max là lựa chọn được anh em yêu thích nhất!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
