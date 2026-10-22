import React from 'react';
import { SeasonalCampaign, SeasonId, getCampaignPeriod } from '../data/seasonalCampaigns';

// Campaign illustrations, ported from GGMV Popup.html
const SEASON_ART: Record<SeasonId, React.ReactNode> = {
  tet: (
    <svg className="season-art" viewBox="0 0 200 130" focusable="false">
      <defs>
        <linearGradient id="lanternFill" x2="0" y2="1"><stop stopColor="#f6c96f" /><stop offset=".38" stopColor="#d84339" /><stop offset="1" stopColor="#7e2027" /></linearGradient>
        <radialGradient id="tetGlow"><stop stopColor="#f8ce77" stopOpacity=".5" /><stop offset="1" stopColor="#f8ce77" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="112" cy="71" rx="68" ry="58" fill="url(#tetGlow)" />
      <path d="M42 21 Q83 45 122 12 M43 21 Q30 39 23 53 M122 12 Q139 31 158 31" fill="none" stroke="#a8583c" strokeWidth="2" />
      <path d="M80 12h31l-4 8H84zM82 22q-4 7 0 15l4 31q11 8 23 0l4-31q4-8-1-15z" fill="url(#lanternFill)" stroke="#f6cf87" strokeWidth="1.5" />
      <path d="M88 23q-5 22 0 42m11-42v46m10-46q5 22 0 42" fill="none" stroke="#ffd98e" strokeOpacity=".65" strokeWidth="1.3" />
      <path d="M83 20h29M86 70l-2 7 8-3 5 5 5-5 8 3-2-7M98 78v13" fill="none" stroke="#f6cf87" strokeWidth="2" />
      <path d="M40 21l-8 5m-5 10-6 6m100-29 6 8m11 9 8 1" stroke="#f6c96f" strokeLinecap="round" strokeWidth="2" />
      <g fill="#ffd28a"><circle cx="22" cy="56" r="4" /><circle cx="31" cy="48" r="3" /><circle cx="152" cy="32" r="4" /><circle cx="164" cy="32" r="3" /><circle cx="143" cy="24" r="3" /></g>
      <g fill="#d84339"><circle cx="22" cy="56" r="1.5" /><circle cx="152" cy="32" r="1.5" /><circle cx="143" cy="24" r="1.3" /></g>
      <path d="M28 104q23-21 45 0t48 0 48 0" fill="none" stroke="#d84339" strokeOpacity=".58" strokeWidth="1.5" />
      <circle cx="169" cy="84" r="2" fill="#ffe09c" /><circle cx="47" cy="88" r="1.5" fill="#ffe09c" />
    </svg>
  ),
  valentine: (
    <svg className="season-art" viewBox="0 0 200 130" focusable="false">
      <defs><radialGradient id="heartGlow"><stop stopColor="#ec7898" stopOpacity=".4" /><stop offset="1" stopColor="#ec7898" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="102" cy="70" rx="73" ry="58" fill="url(#heartGlow)" />
      <path d="M31 39l18-14h48l18 14v55l-18 14H49L31 94z" fill="#25111c" stroke="#d77c98" strokeWidth="2" />
      <path d="M85 29l17-12h48l18 14v55l-18 14h-31" fill="#351525" stroke="#f0a1b5" strokeWidth="2" />
      <path d="M38 45h72m-72 44h72m-34-59v63m66-54h17m-17 40h17" fill="none" stroke="#f0a1b5" strokeOpacity=".58" strokeDasharray="3 4" />
      <path d="M103 76C69 57 82 34 99 46l5 6 5-6c17-12 30 11-6 30z" fill="#ed7897" stroke="#ffd0d9" strokeWidth="1.5" />
      <path d="M99 53q-15 13 5 24 20-11 5-24" fill="none" stroke="#a83f63" strokeWidth="1.2" />
      <path d="M43 112q37-14 69 0t54-4" fill="none" stroke="#d77c98" strokeOpacity=".6" strokeWidth="1.5" />
      <g fill="#f6b8c7"><path d="M24 65q7-8 9 0-3 7-9 0zm143-45q7-8 9 0-3 7-9 0z" /><circle cx="57" cy="19" r="2" /><circle cx="160" cy="109" r="2" /></g>
      <path d="M121 34c8-9 20-2 15 7-3 5-11 9-15 11-5-3-12-7-14-12-4-8 6-14 14-6z" fill="#ed7897" opacity=".75" />
    </svg>
  ),
  'mid-autumn': (
    <svg className="season-art" viewBox="0 0 200 130" focusable="false">
      <defs><radialGradient id="moonGlow"><stop stopColor="#ffe8ae" /><stop offset=".7" stopColor="#edb65a" /><stop offset="1" stopColor="#edb65a" stopOpacity="0" /></radialGradient></defs>
      <circle cx="128" cy="49" r="55" fill="url(#moonGlow)" opacity=".35" />
      <circle cx="128" cy="46" r="29" fill="#f5d38a" />
      <circle cx="118" cy="37" r="5" fill="#d99c4f" opacity=".35" /><circle cx="139" cy="54" r="8" fill="#d99c4f" opacity=".28" /><circle cx="123" cy="59" r="3" fill="#d99c4f" opacity=".4" />
      <path d="M16 68q16-17 33 0-17 15-33 0m4 0q12-3 24 0" fill="none" stroke="#d79355" strokeWidth="2" />
      <path d="M25 26q19 6 26 19m-8-15-6 8m-5-12-3 7" fill="none" stroke="#e59b59" strokeWidth="2" strokeLinecap="round" />
      <path d="M45 18h18l-3 6 3 28q-9 8-18 0l3-28z" fill="#dc743f" stroke="#ffd38a" strokeWidth="1.4" /><path d="M48 25h12m-6-11v4m-4 35 4 9 4-9" fill="none" stroke="#ffd38a" strokeWidth="1.5" />
      <path d="M0 101q30-22 60 0t60 0 80 0v29H0z" fill="#38202b" /><path d="M0 111q35-17 70 0t70 0 60 0" fill="none" stroke="#d77c4a" strokeOpacity=".65" strokeWidth="2" />
      <path d="M104 89q6-15 18-7l5 7 10-2 4 7-8 5h-18l-7-5 1-5m9-8 1-10m0 0-5-5m8 5 5-4m-20 8-7-7m7 7 6 1" fill="#efe0c4" stroke="#efe0c4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <g fill="#fff1c9"><circle cx="78" cy="25" r="1.8" /><circle cx="173" cy="77" r="1.5" /><circle cx="87" cy="60" r="1.2" /></g>
    </svg>
  ),
  halloween: (
    <svg className="season-art" viewBox="0 0 200 130" focusable="false">
      <defs>
        <radialGradient id="halloweenMoon"><stop stopColor="#fff0bf" /><stop offset=".68" stopColor="#d8c1ef" /><stop offset="1" stopColor="#9a73be" stopOpacity="0" /></radialGradient>
        <linearGradient id="hauntFog" x2="0" y2="1"><stop stopColor="#9a64bd" stopOpacity=".05" /><stop offset="1" stopColor="#9a64bd" stopOpacity=".38" /></linearGradient>
      </defs>
      <circle cx="146" cy="37" r="35" fill="url(#halloweenMoon)" opacity=".82" /><circle cx="146" cy="37" r="19" fill="#f5dfb7" />
      <circle cx="140" cy="31" r="3" fill="#c8b3d5" opacity=".55" /><circle cx="153" cy="43" r="4" fill="#c8b3d5" opacity=".48" />
      <path d="M19 103V64q0-34 37-34t37 34v39z" fill="#15101c" stroke="#a578c3" strokeOpacity=".7" strokeWidth="2" />
      <path d="M29 102V67q0-24 27-24t27 24v35z" fill="#25152e" stroke="#ed994f" strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M41 102V71q0-15 15-15t15 15v31z" fill="#100c14" stroke="#8b62a7" strokeWidth="1.4" />
      <path d="M48 72h5v9h-5zm11 0h5v9h-5zm-11 16h5v9h-5zm11 0h5v9h-5z" fill="#f6a252" opacity=".82" />
      <path d="M0 105q27-16 53-4t48 1 48 1 51-5v32H0z" fill="url(#hauntFog)" />
      <path d="M0 116q38-17 78-2t70-1 52 1" fill="none" stroke="#b17ac9" strokeOpacity=".58" strokeWidth="2" />
      <g fill="#d8c5e9">
        <path d="M70 25q-8-10-15-4l-7-6-1 12-7 6q11-4 18 1 7-5 18-1l-7-6-1-12z" />
        <path d="M106 17q-5-7-10-3l-5-5-1 9-5 4q8-3 13 1 5-4 13-1l-5-4-1-9z" />
      </g>
      <g>
        <path d="M142 84q-5-11 3-15 7 1 4 10" fill="#71814b" stroke="#b2a967" strokeWidth="1.4" />
        <path d="M128 88q13-13 27 0 10 2 7 16-4 13-21 12-17 1-21-12-3-12 8-16z" fill="#ed7b32" stroke="#ffc36b" strokeWidth="1.8" />
        <path d="M138 87q-7 9-5 24m12-26q-4 14 0 29m6-25q6 8 4 22" fill="none" stroke="#b94e2b" strokeWidth="2" />
        <path d="M132 98l8 2-5 7zm19 0-8 2 5 7zm-18 10q9 7 18 0" fill="#241226" />
      </g>
      <path d="M10 126h179" stroke="#ed9149" strokeOpacity=".6" strokeWidth="1" />
    </svg>
  ),
  christmas: (
    <svg className="season-art" viewBox="0 0 200 130" focusable="false">
      <defs><radialGradient id="winterGlow"><stop stopColor="#d7e9d9" stopOpacity=".36" /><stop offset="1" stopColor="#d7e9d9" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="105" cy="69" rx="70" ry="59" fill="url(#winterGlow)" />
      <path d="M96 107 119 75h-14l20-28h-13l20-25 20 25h-13l20 28h-14l24 32z" transform="translate(-35 1)" fill="#315b48" stroke="#a6c9ae" strokeWidth="1.5" />
      <path d="M99 108v12m-8 0h16" stroke="#b97856" strokeWidth="5" strokeLinecap="round" />
      <path d="M91 88q14-13 28 0t29 0" fill="none" stroke="#c95550" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 5" />
      <path d="m122 19 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#f4d48d" stroke="#fff0bd" strokeWidth="1" />
      <g fill="#eef5ef"><circle cx="37" cy="41" r="2" /><circle cx="69" cy="27" r="1.5" /><circle cx="163" cy="69" r="2" /><circle cx="145" cy="104" r="1.4" /><circle cx="54" cy="88" r="1.2" /></g>
      <path d="M151 95q7-12 14 0v14h-14z" fill="#a83d43" stroke="#efc889" strokeWidth="1.5" /><path d="M155 94q3-8 7 0" fill="none" stroke="#efc889" strokeWidth="1.5" />
      <path d="M0 119q48-10 94 0t106 0" fill="none" stroke="#b7d8c4" strokeOpacity=".55" strokeWidth="2" />
    </svg>
  ),
};

interface SeasonalBannerProps {
  campaign: SeasonalCampaign;
}

export const SeasonalBanner: React.FC<SeasonalBannerProps> = ({ campaign }) => {
  return (
    <section
      className="season-banner relative overflow-hidden mb-6 rounded-2xl brass-border shadow-2xl pl-5 pr-28 py-4 sm:pl-6 sm:pr-44 sm:py-5"
      aria-label="Chương trình điện ảnh theo mùa"
    >
      <div className="absolute inset-0 rounded-2xl film-grain pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400 tracking-widest uppercase">
          <span>Campaign {campaign.code}</span>
          <span aria-hidden="true" className="text-amber-800">·</span>
          <span>{getCampaignPeriod(campaign)}</span>
        </div>
        <h3 className="mt-1.5 font-cinema text-xl sm:text-2xl font-bold text-[#fdf8f0] leading-tight">
          {campaign.title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-stone-400 leading-relaxed">
          {campaign.deck}
        </p>
        <details className="group mt-2 text-xs">
          <summary className="w-max max-w-full cursor-pointer list-none font-medium text-amber-400 hover:text-amber-300 transition-colors">
            <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">›</span> Ghi chú mật
          </summary>
          <p className="mt-1 text-amber-200/80 italic">{campaign.note}</p>
        </details>
      </div>

      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 w-24 h-[70px] sm:right-5 sm:w-36 sm:h-[104px] pointer-events-none"
        aria-hidden="true"
      >
        {SEASON_ART[campaign.id]}
      </div>
    </section>
  );
};
