import React, { useState } from 'react';
import { Movie } from '../types/cinema';
import { EggEvent } from '../easterEggs';
import { SECRET_BADGES, loadSecrets, memberBadges, personalAchievements } from '../badges';
import { BadgeMedal } from './EasterEggs';
import { BROTHERS_LIST } from './Header';
import { SectionHeader, Stat } from './ui';
import { sounds } from '../utils/soundEffects';

interface MemberAchievementsProps {
  movies: Movie[];
  eggEvents: EggEvent[];
  currentUser: string;
}

export const MemberAchievements: React.FC<MemberAchievementsProps> = ({ movies, eggEvents, currentUser }) => {
  const members = BROTHERS_LIST.includes(currentUser) ? BROTHERS_LIST : [currentUser, ...BROTHERS_LIST];
  const [selected, setSelected] = useState(currentUser);
  const titles = memberBadges(movies);
  const personal = personalAchievements(selected, movies, eggEvents);
  const held = titles.get(selected) ?? [];
  // Secret badges live in this browser, so they belong to whoever is using it
  const secrets = selected === currentUser ? loadSecrets() : [];
  const earned = personal.filter((a) => a.level > 0).length;

  return (
    <section>
      <SectionHeader jp="アチーブメント" kicker="Thành tích cá nhân" title={selected} description="Huy hiệu, danh hiệu và tiến độ của từng anh em. Tính thẳng từ dữ liệu của hội." />

      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Chọn thành viên">
        {members.map((name) => {
          const count = personalAchievements(name, movies, eggEvents).filter((a) => a.level > 0).length + (titles.get(name)?.length ?? 0);
          return (
            <button
              key={name}
              role="tab"
              aria-selected={selected === name}
              onClick={() => {
                sounds.playVintageSwitch();
                setSelected(name);
              }}
              className={`flex items-center gap-2 h-10 pl-1.5 pr-3.5 rounded-full border-[1.5px] border-ink transition-colors ${
                selected === name ? 'bg-accent text-on-accent' : 'bg-card hover:bg-sunk'
              }`}
            >
              <span className="grid place-items-center w-7 h-7 rounded-full bg-ink text-paper text-[12px] font-bold">{name.charAt(0).toUpperCase()}</span>
              <span className="text-[14px] font-semibold">{name}</span>
              <span className="num text-[12px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-xl mb-12">
        <Stat value={`${earned}/${personal.length}`} label="Thành tích" accent />
        <Stat value={held.length} label="Danh hiệu giữ" />
        <Stat value={personal.reduce((acc, a) => acc + a.level, 0)} label="Tổng cấp" />
      </div>

      <div className="label mb-4">Thành tích</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personal.map((a) => {
          const unlocked = a.level > 0;
          const goal = a.next ?? a.value;
          const pct = goal > 0 ? Math.min(100, (a.value / goal) * 100) : 100;
          return (
            <article key={a.id} className={`flex gap-4 p-4 rounded-lg border-[1.5px] ${unlocked ? 'panel' : 'border-dashed border-line'}`}>
              <BadgeMedal badge={a} unlocked={unlocked} size={56} />
              <div className="min-w-0 flex-1">
                <div className={`label !text-[10px] ${unlocked ? '!text-accent' : ''}`}>
                  {unlocked ? `Cấp ${a.level}/${a.maxLevel}` : 'Chưa mở'}
                </div>
                <div className={`mt-1 font-bold leading-snug ${unlocked ? '' : 'text-ink-3'}`}>{a.name}</div>
                <p className="mt-1 text-[13px] text-ink-2 leading-snug">{a.description}</p>
                <div className="mt-3 h-1.5 rounded-full border border-ink bg-card overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 text-[12px] text-ink-3">
                  {a.next === null ? `${a.value} ${a.unit} · Cấp tối đa` : `${a.value}/${a.next} ${a.unit}`}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="label mt-12 mb-4">Danh hiệu đang giữ</div>
      {held.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {held.map((b) => (
            <article key={b.id} className="panel flex items-center gap-4 p-4" title={b.rule}>
              <BadgeMedal badge={b} unlocked size={48} />
              <div className="min-w-0">
                <div className="font-bold leading-snug">{b.name}</div>
                <p className="text-[13px] text-ink-2 leading-snug">{b.description}</p>
                <div className="label !text-[10px] mt-1">{b.detail}</div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-ink-3">Chưa giữ danh hiệu nào. Danh hiệu đổi chủ theo dữ liệu, cứ chờ.</p>
      )}

      {selected === currentUser && (
        <>
          <div className="label mt-12 mb-1">Huy hiệu bí mật</div>
          <p className="text-[13px] text-ink-3 mb-4">Tìm thấy trên trình duyệt này.</p>
          <div className="flex flex-wrap gap-5">
            {SECRET_BADGES.map((b) => {
              const found = secrets.includes(b.id);
              return (
                <div key={b.id} className="flex flex-col items-center w-24 text-center" title={found ? b.description : b.hint}>
                  <BadgeMedal badge={b} unlocked={found} size={52} />
                  <span className={`mt-1.5 text-[12px] font-semibold leading-tight ${found ? '' : 'text-ink-3'}`}>{found ? b.name : '???'}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
