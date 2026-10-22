import React, { useEffect } from 'react';
import { World } from './worlds';
import { WorldMark } from './art';

// Entering a world: a one-second curtain in the world's own colours, then it sweeps up.
// Purely decorative (aria-hidden) and skipped entirely under reduced motion.
export const WorldCurtain: React.FC<{ world: World; onDone: () => void }> = ({ world, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 1050);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="world-curtain fixed inset-0 z-[70] bg-accent text-on-accent grid place-items-center pointer-events-none" aria-hidden="true">
      <div className="text-center">
        <div className="inline-block scale-[2.2] mb-8">
          <WorldMark id={world.id} />
        </div>
        <div className="display text-[clamp(48px,10vw,120px)]">{world.name}</div>
        <div className="label !text-current mt-3">{world.kicker}</div>
      </div>
    </div>
  );
};
