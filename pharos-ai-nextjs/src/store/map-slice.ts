import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { extractInitialState, extractTimeExtent } from '@/lib/map-filter-engine';
import type { DataArrays } from '@/lib/map-filter-engine';
import type { MapViewState } from '@deck.gl/core';
import type { MapStory } from '@/data/mapStories';
import type { SelectedItem } from '@/components/map/MapDetailPanel';

// ─── Async thunk ─────────────────────────────────────────────────────────────

export const loadMapData = createAsyncThunk(
  'map/loadMapData',
  async (conflictId: string) => {
    const res = await fetch(`/api/v1/conflicts/${conflictId}/map/data`);
    if (!res.ok) throw new Error('Failed to load map data');
    const { data } = await res.json();
    return {
      strikes:  data.strikes ?? [],
      missiles: data.missiles ?? [],
      targets:  data.targets ?? [],
      assets:   data.assets ?? [],
      zones:    data.threatZones ?? [],
      heat:     data.heatPoints ?? [],
    } as DataArrays;
  },
  {
    condition: (_, { getState }) => {
      const { map } = getState() as { map: MapState };
      // Don't re-fetch if already loaded or currently loading
      if (map.rawData || map.mapLoading) return false;
    },
  },
);

// ─── Types ───────────────────────────────────────────────────────────────────

export type SerializableFilterState = {
  datasets:   string[];
  types:      string[];
  actors:     string[];
  statuses:   string[];
  priorities: string[];
  heat:       boolean;
  timeRange:  [number, number] | null;
};

export type MapState = {
  // Data loading
  rawData: DataArrays | null;
  mapLoading: boolean;
  mapError: string | null;

  // Camera
  viewState: MapViewState;

  // Filter
  filters: SerializableFilterState;
  initialFilters: SerializableFilterState;
  dataExtent: [number, number];
  viewExtent: [number, number];

  // Interaction
  activeStory: MapStory | null;
  selectedItem: SelectedItem | null;

  // UI chrome
  sidebarOpen: boolean;
  mapStyle: 'dark' | 'satellite';
};

// ─── localStorage persistence ────────────────────────────────────────────────

const MAP_STORAGE_KEY = 'pharos:map:v1';

type PersistedMapPrefs = {
  filters: SerializableFilterState;
  sidebarOpen: boolean;
  mapStyle: 'dark' | 'satellite';
};

function loadPersistedMapPrefs(): Partial<PersistedMapPrefs> | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(MAP_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedMapPrefs;
  } catch { /* corrupt data */ }
  return undefined;
}

export function persistMapPrefs(state: MapState): void {
  if (typeof window === 'undefined') return;
  try {
    const persisted: PersistedMapPrefs = {
      filters:     state.filters,
      sidebarOpen: state.sidebarOpen,
      mapStyle:    state.mapStyle,
    };
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(persisted));
  } catch { /* quota exceeded */ }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Convert Set-based initial state to serializable arrays
function toSerializable(fs: ReturnType<typeof extractInitialState>): SerializableFilterState {
  return {
    datasets:   [...fs.datasets],
    types:      [...fs.types],
    actors:     [...fs.actors],
    statuses:   [...fs.statuses],
    priorities: [...fs.priorities],
    heat:       fs.heat,
    timeRange:  fs.timeRange,
  };
}

// Toggle helper — prevents empty arrays
function toggleArr(arr: string[], item: string): string[] {
  const has = arr.includes(item);
  const next = has ? arr.filter(x => x !== item) : [...arr, item];
  return next.length === 0 ? arr : next;
}

// ─── Empty defaults ──────────────────────────────────────────────────────────

const EMPTY_FILTERS: SerializableFilterState = {
  datasets: [], types: [], actors: [], statuses: [], priorities: [],
  heat: true, timeRange: null,
};

// ─── Initial state ───────────────────────────────────────────────────────────

const INITIAL_VIEW: MapViewState = { longitude: 51.0, latitude: 30.0, zoom: 4.5, pitch: 0, bearing: 0 };

function buildInitialState(): MapState {
  const persisted = loadPersistedMapPrefs();
  return {
    rawData:    null,
    mapLoading: false,
    mapError:   null,
    viewState:      INITIAL_VIEW,
    filters:        persisted?.filters ?? EMPTY_FILTERS,
    initialFilters: EMPTY_FILTERS,
    dataExtent:     [0, 0],
    viewExtent:     [0, 0],
    activeStory:  null,
    selectedItem: null,
    sidebarOpen: persisted?.sidebarOpen ?? true,
    mapStyle:    persisted?.mapStyle    ?? 'dark',
  };
}

const initialState: MapState = buildInitialState();

// ─── Slice ───────────────────────────────────────────────────────────────────

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // Camera
    setViewState(state, action: PayloadAction<MapViewState>) {
      state.viewState = action.payload;
    },

    // Filters
    toggleDataset(state, action: PayloadAction<string>) {
      const d = action.payload;
      const next = toggleArr(state.filters.datasets, d);
      // When toggling a dataset ON, auto-enable all its types
      if (next.includes(d) && !state.filters.datasets.includes(d) && state.rawData) {
        const items = ({
          strikes:  state.rawData.strikes,
          missiles: state.rawData.missiles,
          targets:  state.rawData.targets,
          assets:   state.rawData.assets,
          zones:    state.rawData.zones,
        } as Record<string, Array<{ type: string }>>)[d];
        if (items) {
          const types = new Set(state.filters.types);
          for (const item of items) types.add(item.type);
          state.filters.types = [...types];
        }
      }
      state.filters.datasets = next;
    },
    toggleType(state, action: PayloadAction<string>) {
      state.filters.types = toggleArr(state.filters.types, action.payload);
    },
    toggleActor(state, action: PayloadAction<string>) {
      state.filters.actors = toggleArr(state.filters.actors, action.payload);
    },
    togglePriority(state, action: PayloadAction<string>) {
      state.filters.priorities = toggleArr(state.filters.priorities, action.payload);
    },
    toggleStatus(state, action: PayloadAction<string>) {
      state.filters.statuses = toggleArr(state.filters.statuses, action.payload);
    },
    toggleHeat(state) {
      state.filters.heat = !state.filters.heat;
    },
    setTimeRange(state, action: PayloadAction<[number, number] | null>) {
      state.filters.timeRange = action.payload;
    },
    setViewExtent(state, action: PayloadAction<[number, number]>) {
      state.viewExtent = action.payload;
    },
    resetFilters(state) {
      state.filters = state.initialFilters;
    },

    // Interaction
    setActiveStory(state, action: PayloadAction<MapStory | null>) {
      state.activeStory = action.payload;
    },
    activateStory(state, action: PayloadAction<MapStory>) {
      state.activeStory = action.payload;
      state.viewState = {
        ...state.viewState,
        ...action.payload.viewState,
        transitionDuration: 1200,
      };
    },
    setSelectedItem(state, action: PayloadAction<SelectedItem | null>) {
      state.selectedItem = action.payload;
    },

    // UI chrome
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setMapStyle(state, action: PayloadAction<'dark' | 'satellite'>) {
      state.mapStyle = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMapData.pending, (state) => {
        state.mapLoading = true;
        state.mapError = null;
      })
      .addCase(loadMapData.fulfilled, (state, action) => {
        state.rawData    = action.payload;
        state.mapLoading = false;
        state.mapError   = null;

        // Compute initial filters from loaded data
        const initial     = extractInitialState(action.payload);
        const serializable = toSerializable(initial);
        state.initialFilters = serializable;

        // Compute data extent
        const extent = extractTimeExtent(action.payload);
        state.dataExtent = extent;

        // Compute view extent (last 3 days or full span)
        const span      = extent[1] - extent[0];
        const threeDays = 3 * 86400_000;
        state.viewExtent = span <= threeDays
          ? extent
          : [Math.max(extent[0], extent[1] - threeDays), extent[1]];

        // If no persisted filters (datasets is empty), use computed initial
        if (state.filters.datasets.length === 0) {
          state.filters = serializable;
        }
      })
      .addCase(loadMapData.rejected, (state, action) => {
        state.mapLoading = false;
        state.mapError   = action.error.message ?? 'Failed to load map data';
      });
  },
});

export const {
  setViewState,
  toggleDataset,
  toggleType,
  toggleActor,
  togglePriority,
  toggleStatus,
  toggleHeat,
  setTimeRange,
  setViewExtent,
  resetFilters,
  setActiveStory,
  activateStory,
  setSelectedItem,
  toggleSidebar,
  setMapStyle,
} = mapSlice.actions;

export default mapSlice.reducer;
