'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  ACTOR_META, PRIORITY_META, STATUS_META,
  FRIENDLY_ACTORS, HOSTILE_ACTORS, ALL_PRIORITIES, ALL_STATUSES,
} from '@/data/mapTokens';
import { STRIKE_ARCS, MISSILE_TRACKS, TARGETS, ALLIED_ASSETS, THREAT_ZONES } from '@/data/mapData';
import { ALL_LAYERS, LAYER_LABEL } from '@/hooks/use-map-filters';

import type { Actor, Priority, MarkerStatus } from '@/data/mapTokens';
import type { FilterState, LayerName } from '@/hooks/use-map-filters';

// ─── Item counts (static, from raw data) ─────────────────────────────────────

function useCounts() {
  return useMemo(() => {
    const all = [...STRIKE_ARCS, ...MISSILE_TRACKS, ...TARGETS, ...ALLIED_ASSETS, ...THREAT_ZONES];
    const actor:    Partial<Record<Actor, number>>    = {};
    const priority: Partial<Record<Priority, number>> = {};
    for (const d of all) {
      actor[d.actor]       = (actor[d.actor] ?? 0) + 1;
      priority[d.priority] = (priority[d.priority] ?? 0) + 1;
    }
    const layers = {
      strikes: STRIKE_ARCS.length, missiles: MISSILE_TRACKS.length,
      targets: TARGETS.length, assets: ALLIED_ASSETS.length,
      zones: THREAT_ZONES.length, heat: 1,
    };
    return { actor, priority, layers };
  }, []);
}

// ─── Chip atom ────────────────────────────────────────────────────────────────

function Chip({ label, count, color, isOn, onClick }: {
  label: string; count?: number; color?: string; isOn: boolean; onClick: () => void;
}) {
  const c = color ?? 'var(--t2)';
  return (
    <button onClick={onClick} className="mono" style={{
      display:    'inline-flex', alignItems: 'center', gap: 4,
      padding:    '3px 8px', borderRadius: 2, cursor: 'pointer', border: 'none',
      background: isOn ? `color-mix(in srgb, ${c} 16%, transparent)` : 'var(--bg-app)',
      outline:    `1px solid ${isOn ? `color-mix(in srgb, ${c} 40%, transparent)` : 'var(--bd-s)'}`,
      color:      isOn ? c : 'var(--t4)',
      fontSize:   9, fontWeight: 700, letterSpacing: '0.06em',
      transition: 'all 0.1s',
    }}>
      {label}
      {count !== undefined && (
        <span style={{ fontSize: 8, opacity: 0.7, fontWeight: 400 }}>{count}</span>
      )}
    </button>
  );
}

// ─── Active filter summary bar ────────────────────────────────────────────────

function ActiveBar({ state, onReset }: { state: FilterState; onReset: () => void }) {
  const pills: { label: string; color: string }[] = [];
  ALL_PRIORITIES.forEach(p => { if (!state.priorities.has(p)) return; if (state.priorities.size < 3) pills.push({ label: PRIORITY_META[p].label, color: PRIORITY_META[p].cssVar }); });
  Object.keys(ACTOR_META).forEach(a => { if (state.actors.has(a as Actor) && state.actors.size < 6) pills.push({ label: a, color: ACTOR_META[a as Actor].cssVar }); });
  if (!pills.length && state.layers.size === ALL_LAYERS.length) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap" style={{ padding: '4px 8px', borderBottom: '1px solid var(--bd-s)', background: 'var(--blue-dim)' }}>
      <span className="mono" style={{ fontSize: 8, color: 'var(--blue-l)', fontWeight: 700, marginRight: 2 }}>ACTIVE</span>
      {pills.map(p => (
        <span key={p.label} className="mono" style={{ fontSize: 8, fontWeight: 700, color: p.color, padding: '1px 5px', background: `color-mix(in srgb, ${p.color} 12%, transparent)`, borderRadius: 2 }}>{p.label}</span>
      ))}
      <button onClick={onReset} className="mono" style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--t4)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>
        <RotateCcw size={8} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Level 2: Actor ───────────────────────────────────────────────────────────

function ActorLevel({ actors, actorCounts, onToggle }: { actors: Set<Actor>; actorCounts: Partial<Record<Actor, number>>; onToggle: (a: Actor) => void }) {
  return (
    <div style={{ padding: '6px 8px', borderTop: '1px solid var(--bd-s)' }}>
      <p className="label" style={{ color: 'var(--t4)', marginBottom: 4 }}>ACTOR</p>
      <div className="flex flex-wrap gap-1 mb-1">
        {FRIENDLY_ACTORS.map(a => <Chip key={a} label={ACTOR_META[a].label.split(' ')[0].toUpperCase()} count={actorCounts[a]} color={ACTOR_META[a].cssVar} isOn={actors.has(a)} onClick={() => onToggle(a)} />)}
      </div>
      <div className="flex flex-wrap gap-1">
        {HOSTILE_ACTORS.map(a => <Chip key={a} label={a} count={actorCounts[a]} color={ACTOR_META[a].cssVar} isOn={actors.has(a)} onClick={() => onToggle(a)} />)}
      </div>
    </div>
  );
}

// ─── Level 3: Priority + Status ──────────────────────────────────────────────

function PriorityLevel({ priorities, statuses, priorityCounts, onTogglePriority, onToggleStatus }: {
  priorities: Set<Priority>; statuses: Set<MarkerStatus>;
  priorityCounts: Partial<Record<Priority, number>>;
  onTogglePriority: (p: Priority) => void; onToggleStatus: (s: MarkerStatus) => void;
}) {
  return (
    <div style={{ padding: '6px 8px', borderTop: '1px solid var(--bd-s)' }}>
      <p className="label" style={{ color: 'var(--t4)', marginBottom: 4 }}>PRIORITY</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {ALL_PRIORITIES.map(p => (
          <Chip key={p} label={`${p} · ${PRIORITY_META[p].description.split(' — ')[0].toUpperCase()}`}
            count={priorityCounts[p]} color={PRIORITY_META[p].cssVar}
            isOn={priorities.has(p)} onClick={() => onTogglePriority(p)} />
        ))}
      </div>
      <p className="label" style={{ color: 'var(--t4)', marginBottom: 4 }}>STATUS</p>
      <div className="flex flex-wrap gap-1">
        {ALL_STATUSES.map(s => (
          <Chip key={s} label={STATUS_META[s].label.toUpperCase()} color={STATUS_META[s].cssVar} isOn={statuses.has(s)} onClick={() => onToggleStatus(s)} />
        ))}
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

type Props = FilterState & {
  onToggleLayer:    (l: LayerName) => void;
  onToggleActor:    (a: Actor) => void;
  onTogglePriority: (p: Priority) => void;
  onToggleStatus:   (s: MarkerStatus) => void;
  onReset:          () => void;
  isFiltered:       boolean;
};

export default function MapFilterPanel(props: Props) {
  const { layers, actors, priorities, statuses, isFiltered, onToggleLayer, onToggleActor, onTogglePriority, onToggleStatus, onReset } = props;
  const [level, setLevel] = useState(1);   // 1, 2, or 3
  const counts = useCounts();

  const ExpandBtn = ({ target }: { target: number }) => (
    <Button variant="ghost" size="sm" onClick={() => setLevel(l => l === target ? target - 1 : target)}
      className="h-5 w-5 p-0 ml-auto" style={{ color: level >= target ? 'var(--blue-l)' : 'var(--t4)' }}>
      {level >= target ? <ChevronUp size={10} strokeWidth={2.5} /> : <ChevronDown size={10} strokeWidth={2.5} />}
    </Button>
  );

  return (
    <div style={{ background: 'rgba(28,33,39,0.97)', border: '1px solid var(--bd)', borderRadius: 2, minWidth: 240, maxWidth: 300 }}>

      {/* Active filter bar */}
      <ActiveBar state={props} onReset={onReset} />

      {/* Level 1 — Layer toggles */}
      <div style={{ padding: '6px 8px' }}>
        <div className="flex items-center" style={{ marginBottom: 4 }}>
          <p className="label" style={{ color: isFiltered ? 'var(--blue-l)' : 'var(--t4)' }}>LAYER {isFiltered && '·'}</p>
          <ExpandBtn target={2} />
        </div>
        <div className="flex flex-wrap gap-1">
          {ALL_LAYERS.map(l => (
            <Chip key={l} label={LAYER_LABEL[l]} count={l !== 'heat' ? counts.layers[l] : undefined}
              isOn={layers.has(l)} onClick={() => onToggleLayer(l)} />
          ))}
        </div>
      </div>

      {/* Level 2 — Actor */}
      {level >= 2 && (
        <>
          <ActorLevel actors={actors} actorCounts={counts.actor} onToggle={onToggleActor} />
          <div className="flex items-center" style={{ padding: '0 8px 4px', borderTop: '1px solid var(--bd-s)' }}>
            <p className="label" style={{ color: 'var(--t4)' }}>+ PRIORITY & STATUS</p>
            <ExpandBtn target={3} />
          </div>
        </>
      )}

      {/* Level 3 — Priority + Status */}
      {level >= 3 && (
        <PriorityLevel priorities={priorities} statuses={statuses}
          priorityCounts={counts.priority} onTogglePriority={onTogglePriority} onToggleStatus={onToggleStatus} />
      )}
    </div>
  );
}
