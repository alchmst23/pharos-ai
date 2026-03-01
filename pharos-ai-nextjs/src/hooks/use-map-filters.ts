import { useState, useMemo, useCallback } from 'react';

import { STRIKE_ARCS, MISSILE_TRACKS, TARGETS, ALLIED_ASSETS, THREAT_ZONES, HEAT_POINTS } from '@/data/mapData';
import { ALL_ACTORS, ALL_STATUSES, ALL_PRIORITIES } from '@/data/mapTokens';

import type { StrikeArc, MissileTrack, Target, Asset, ThreatZone, HeatPoint } from '@/data/mapData';
import type { Actor, MarkerStatus, Priority } from '@/data/mapTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LayerName = 'strikes' | 'missiles' | 'targets' | 'assets' | 'zones' | 'heat';

export const ALL_LAYERS: LayerName[] = ['strikes', 'missiles', 'targets', 'assets', 'zones', 'heat'];

export const LAYER_LABEL: Record<LayerName, string> = {
  strikes:  'STRIKES',
  missiles: 'MISSILES',
  targets:  'TARGETS',
  assets:   'ASSETS',
  zones:    'ZONES',
  heat:     'HEAT',
};

export type FilterState = {
  layers:     Set<LayerName>;   // Level 1 — which data types
  actors:     Set<Actor>;       // Level 2 — who
  priorities: Set<Priority>;    // Level 3 — strategic importance
  statuses:   Set<MarkerStatus>; // Level 3 — current state
};

export type FilteredData = {
  strikes:  StrikeArc[];
  missiles: MissileTrack[];
  targets:  Target[];
  assets:   Asset[];
  zones:    ThreatZone[];
  heat:     HeatPoint[];
};

export type UseMapFiltersReturn = FilterState & FilteredData & {
  toggleLayer:    (l: LayerName) => void;
  toggleActor:    (a: Actor) => void;
  togglePriority: (p: Priority) => void;
  toggleStatus:   (s: MarkerStatus) => void;
  resetFilters:   () => void;
  isFiltered:     boolean;
};

// ─── Default state ────────────────────────────────────────────────────────────

const DEFAULT_STATE: FilterState = {
  layers:     new Set(ALL_LAYERS),
  actors:     new Set(ALL_ACTORS),
  priorities: new Set(ALL_PRIORITIES),
  statuses:   new Set(ALL_STATUSES),
};

// ─── Toggle factory — prevents empty sets ────────────────────────────────────

function toggle<T>(prev: Set<T>, item: T): Set<T> {
  const next = new Set(prev);
  next.has(item) ? next.delete(item) : next.add(item);
  return next.size === 0 ? prev : next;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMapFilters(): UseMapFiltersReturn {
  const [state, setState] = useState<FilterState>(DEFAULT_STATE);

  const toggleLayer    = useCallback((l: LayerName)   => setState(p => ({ ...p, layers:     toggle(p.layers,     l) })), []);
  const toggleActor    = useCallback((a: Actor)        => setState(p => ({ ...p, actors:     toggle(p.actors,     a) })), []);
  const togglePriority = useCallback((p: Priority)     => setState(prev => ({ ...prev, priorities: toggle(prev.priorities, p) })), []);
  const toggleStatus   = useCallback((s: MarkerStatus) => setState(p => ({ ...p, statuses:   toggle(p.statuses,   s) })), []);
  const resetFilters   = useCallback(() => setState(DEFAULT_STATE), []);

  const filtered = useMemo<FilteredData>(() => {
    const { layers, actors, priorities, statuses } = state;

    const keep = (d: { actor: Actor; priority: Priority; status: MarkerStatus }) =>
      actors.has(d.actor) && priorities.has(d.priority) && statuses.has(d.status);

    const keepZone = (d: { actor: Actor; priority: Priority }) =>
      actors.has(d.actor) && priorities.has(d.priority);

    return {
      strikes:  layers.has('strikes')  ? STRIKE_ARCS.filter(keep)   : [],
      missiles: layers.has('missiles') ? MISSILE_TRACKS.filter(keep) : [],
      targets:  layers.has('targets')  ? TARGETS.filter(keep)        : [],
      assets:   layers.has('assets')   ? ALLIED_ASSETS.filter(keep)  : [],
      zones:    layers.has('zones')    ? THREAT_ZONES.filter(keepZone) : [],
      heat:     layers.has('heat')     ? HEAT_POINTS                 : [],
    };
  }, [state]);

  const isFiltered =
    state.layers.size < ALL_LAYERS.length ||
    state.actors.size < ALL_ACTORS.length ||
    state.priorities.size < ALL_PRIORITIES.length ||
    state.statuses.size < ALL_STATUSES.length;

  return { ...state, ...filtered, toggleLayer, toggleActor, togglePriority, toggleStatus, resetFilters, isFiltered };
}
