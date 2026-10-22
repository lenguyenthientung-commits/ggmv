import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// Shared building blocks of the Storyboard design system.

interface SectionHeaderProps {
  jp: string;
  kicker: string;
  title: string;
  description?: string;
  children?: React.ReactNode; // right-side actions
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ jp, kicker, title, description, children }) => (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 mb-8 border-b-[1.5px] border-ink">
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <span className="jp text-[13px] whitespace-nowrap shrink-0">{jp}</span>
        <span className="label">{kicker}</span>
      </div>
      <h2 className="display mt-4 text-[clamp(44px,7vw,84px)] leading-[0.98]">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">{description}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{children}</div>}
  </header>
);

interface StatProps {
  value: React.ReactNode;
  label: string;
  accent?: boolean;
}

export const Stat: React.FC<StatProps> = ({ value, label, accent }) => (
  <div className="min-w-0">
    <div className={`display text-[clamp(34px,4.5vw,48px)] leading-none ${accent ? 'text-accent' : ''}`}>{value}</div>
    <div className="label mt-2 truncate">{label}</div>
  </div>
);

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /* night = screening surfaces (trailer, wheel result) */
  tone?: 'paper' | 'night';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label: string;
}

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

export const Modal: React.FC<ModalProps> = ({ onClose, children, tone = 'paper', size = 'md', label }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overlay-enter bg-[rgb(8_7_6/0.6)]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`enter relative w-full ${SIZES[size]} rounded-xl border-[1.5px] overflow-hidden ${
            tone === 'night'
              ? 'on-night bg-night text-night-ink border-night-line'
              : 'bg-card text-ink border-ink shadow-[6px_6px_0_var(--color-shadow)]'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  jp?: string;
  kicker?: string;
  title: React.ReactNode;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ jp, kicker, title, onClose }) => (
  <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4">
    <div className="min-w-0">
      {(jp || kicker) && (
        <div className="flex items-center gap-2.5 mb-2.5">
          {jp && <span className="jp text-[11px] whitespace-nowrap shrink-0">{jp}</span>}
          {kicker && <span className="label">{kicker}</span>}
        </div>
      )}
      <h3 className="display text-[clamp(28px,4vw,38px)]">{title}</h3>
    </div>
    <button onClick={onClose} className="btn-icon shrink-0 -mr-2" aria-label="Đóng">
      <X className="w-5 h-5" />
    </button>
  </div>
);

// "T7 · 24.10" style date for session labels
export function formatSessionDate(date: string): { weekday: string; dayMonth: string } {
  const d = new Date(`${date}T00:00:00`);
  if (isNaN(d.getTime())) return { weekday: '', dayMonth: date };
  const weekday = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
  const dayMonth = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { weekday, dayMonth };
}
