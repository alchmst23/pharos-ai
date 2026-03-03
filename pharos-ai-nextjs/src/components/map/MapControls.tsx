'use client';

import { Button } from '@/components/ui/button';

import type { MapViewState } from '@deck.gl/core';

type Props = {
  viewState:        MapViewState;
  mapStyle:         'dark' | 'satellite';
  hasPanel:         boolean;
  timelineVisible?: boolean;
  onStyleChange:    (s: 'dark' | 'satellite') => void;
};

export default function MapControls({ viewState, mapStyle, hasPanel, timelineVisible = true, onStyleChange }: Props) {
  const right = hasPanel ? 332 : 12;
  const bottomOffset = timelineVisible ? 0 : -44;

  return (
    <>
      {/* Map style switcher */}
      <div className="absolute flex overflow-hidden rounded-sm z-10"
        style={{ bottom: 86 + bottomOffset, right, border: '1px solid var(--bd)', transition: 'right 0.22s cubic-bezier(0.4,0,0.2,1), bottom 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
        {(['dark', 'satellite'] as const).map((mode, i) => (
          <Button key={mode} variant="ghost" size="xs" onClick={() => onStyleChange(mode)}
            className="mono rounded-none px-2.5 py-1 h-auto text-[8px] font-bold"
            style={{
              background:  mapStyle === mode ? 'var(--blue)' : 'rgba(28,33,39,0.92)',
              borderRight: i === 0 ? '1px solid var(--bd)' : 'none',
              color:       mapStyle === mode ? 'var(--t1)' : 'var(--t3)',
            }}
          >{mode === 'dark' ? 'DARK' : 'SAT'}</Button>
        ))}
      </div>

      {/* Coordinates */}
      <div className="mono absolute pointer-events-none"
        style={{
          bottom: 56 + bottomOffset, right,
          background: 'rgba(28,33,39,0.85)', border: '1px solid var(--bd)',
          padding: '4px 8px', fontSize: 9, color: 'var(--t4)',
          transition: 'right 0.22s cubic-bezier(0.4,0,0.2,1), bottom 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {viewState.latitude.toFixed(2)}°N {viewState.longitude.toFixed(2)}°E
      </div>
    </>
  );
}
