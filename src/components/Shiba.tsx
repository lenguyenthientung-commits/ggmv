import React from 'react';

// The club's mascot. The usher sprite has blank eyes: its pupils are drawn here so they can follow the pointer.
const SPRITES = {
  plain: '/assets/shiba/shiba-plain.png',
  usher: '/assets/shiba/shiba-usher.png',
  lobby: '/assets/shiba/shiba-lobby.png',
};

interface ShibaProps {
  size?: number;
  outfit?: keyof typeof SPRITES;
  look?: { x: number; y: number }; // -1..1, where the pupils point
  className?: string;
}

export const Shiba: React.FC<ShibaProps> = ({ size = 88, outfit = 'plain', look = { x: 0, y: 0 }, className = '' }) => (
  <span className={`relative block ${className}`} style={{ width: size }} aria-hidden="true">
    <img src={SPRITES[outfit]} alt="" width={size} height={size * 1.2} draggable={false} className="block w-full h-auto" />
    {outfit === 'usher' && (
      <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full" fill="#16140f">
        <circle cx={30.2 + look.x * 0.8} cy={33.6 + look.y * 0.8} r="1.5" />
        <circle cx={50.7 + look.x * 0.8} cy={33.6 + look.y * 0.8} r="1.5" />
      </svg>
    )}
  </span>
);
