import React from 'react';

// The club's mascot, in the flat print look of the medals. Colours are fixed: the art does not flip with dark mode.
const LINE = '#16140f';
const FUR = '#E8A14B';
const CREAM = '#FFF6DE';
const USHER_RED = '#D0281C';
const LOBBY_PURPLE = '#6B4BA8';
const GOLD = '#F3D36B';

interface ShibaProps {
  size?: number;
  outfit?: 'plain' | 'usher' | 'lobby';
  look?: { x: number; y: number }; // -1..1, where the pupils point
  className?: string;
}

export const Shiba: React.FC<ShibaProps> = ({ size = 88, outfit = 'plain', look = { x: 0, y: 0 }, className }) => {
  const hat = outfit === 'usher' ? USHER_RED : LOBBY_PURPLE;
  const pupil = { dx: look.x * 2.4, dy: look.y * 2.4 };
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className} aria-hidden="true">
      <g stroke={LINE} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* Tail, body */}
        <path d="M74 100c14-2 19-15 11-24-6 4-8 11-15 13z" fill={FUR} />
        <path d="M27 117c-4-24 5-46 23-46s27 22 23 46z" fill={outfit === 'lobby' ? LOBBY_PURPLE : FUR} />
        {outfit !== 'lobby' && <path d="M38 117c-2-14 3-30 12-30s14 16 12 30z" fill={CREAM} strokeWidth="0" />}
        {outfit === 'lobby' && (
          <>
            <path d="M40 76l10 12 10-12" fill={CREAM} />
            <circle cx="50" cy="97" r="2.4" fill={GOLD} strokeWidth="1.5" />
            <circle cx="50" cy="108" r="2.4" fill={GOLD} strokeWidth="1.5" />
          </>
        )}
        {/* Ears, head */}
        <path d="M21 44 23 12l22 15z" fill={FUR} />
        <path d="M79 44 77 12 55 27z" fill={FUR} />
        <path d="M50 21C29 21 17 35 17 52c0 17 14 27 33 27s33-10 33-27c0-17-12-31-33-31z" fill={FUR} />
        <path d="M50 79c-15 0-25-7-25-17 0-8 8-10 13-7 4 2 8 3 12 3s8-1 12-3c5-3 13-1 13 7 0 10-10 17-25 17z" fill={CREAM} strokeWidth="0" />
        {/* Face */}
        <ellipse cx="36" cy="37" rx="4" ry="2.6" fill={CREAM} strokeWidth="0" />
        <ellipse cx="64" cy="37" rx="4" ry="2.6" fill={CREAM} strokeWidth="0" />
        <circle cx="36" cy="47" r="6" fill="#fff" strokeWidth="2.2" />
        <circle cx="64" cy="47" r="6" fill="#fff" strokeWidth="2.2" />
        <circle cx={36 + pupil.dx} cy={47 + pupil.dy} r="3.2" fill={LINE} strokeWidth="0" />
        <circle cx={64 + pupil.dx} cy={47 + pupil.dy} r="3.2" fill={LINE} strokeWidth="0" />
        <path d="M45 59h10l-5 5z" fill={LINE} strokeWidth="2" />
        <path d="M50 65c-1 5-7 7-11 3M50 65c1 5 7 7 11 3" fill="none" strokeWidth="2.2" />
        {/* Uniform */}
        {outfit === 'usher' && <path d="M50 80l-10-6v12zM50 80l10-6v12z" fill={USHER_RED} strokeWidth="2.2" />}
        {outfit !== 'plain' && (
          <>
            <rect x="33" y="9" width="34" height="15" rx="3" fill={hat} />
            <path d="M33 19h34" stroke={GOLD} strokeWidth="2.5" />
          </>
        )}
      </g>
    </svg>
  );
};
