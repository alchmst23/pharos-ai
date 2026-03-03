'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import type { ConflictDay } from '@/types/domain';
import { CONFLICT_DAYS } from '@/types/domain';
import { getEventsForDay, getConflictForDay } from '@/lib/day-filter';

function dayLabel(day: ConflictDay): string {
  const idx = CONFLICT_DAYS.indexOf(day);
  return `DAY ${idx + 1}`;
}

function dayShort(day: ConflictDay): string {
  const d = new Date(day + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase();
}

interface Props {
  currentDay: ConflictDay;
  onDayChange: (day: ConflictDay) => void;
  showAll?: boolean;
  allSelected?: boolean;
  onAllClick?: () => void;
}

export function DaySelector({ currentDay, onDayChange, showAll, allSelected, onAllClick }: Props) {
  const [open, setOpen] = useState(false);
  const idx = CONFLICT_DAYS.indexOf(currentDay);
  const canPrev = idx > 0;
  const canNext = idx < CONFLICT_DAYS.length - 1;
  const evtCount = getEventsForDay(currentDay).length;

  function selectDay(day: ConflictDay) {
    onDayChange(day);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-[5px]">
      {showAll && (
        <button
          onClick={onAllClick}
          className="mono text-[9px] font-bold tracking-[0.06em] px-[8px] py-[4px] border transition-colors"
          style={{
            borderColor: allSelected ? 'var(--blue)' : 'var(--bd)',
            background: allSelected ? 'var(--blue-dim)' : 'transparent',
            color: allSelected ? 'var(--blue-l)' : 'var(--t3)',
          }}
        >
          ALL
        </button>
      )}

      {/* Prev */}
      <button
        onClick={() => canPrev && onDayChange(CONFLICT_DAYS[idx - 1])}
        disabled={!canPrev}
        className="flex items-center justify-center w-[22px] h-[22px] border transition-colors"
        style={{
          borderColor: 'var(--bd)',
          background: 'transparent',
          opacity: canPrev ? 1 : 0.3,
          cursor: canPrev ? 'pointer' : 'default',
        }}
      >
        <ChevronLeft size={12} strokeWidth={2} className="text-[var(--t3)]" />
      </button>

      {/* Current day display — clickable to open date picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-[6px] px-[10px] py-[3px] border transition-colors min-w-[130px] justify-center cursor-pointer hover:brightness-110"
            style={{
              borderColor: allSelected ? 'var(--bd)' : 'var(--danger)',
              background: allSelected ? 'transparent' : 'var(--danger-dim)',
            }}
          >
            <span className="mono text-[9px] font-bold tracking-[0.08em]"
              style={{ color: allSelected ? 'var(--t3)' : 'var(--danger)' }}>
              {dayLabel(currentDay)}
            </span>
            <span className="mono text-[8px]"
              style={{ color: allSelected ? 'var(--t4)' : 'var(--danger)' }}>
              {dayShort(currentDay)}
            </span>
            <span className="mono text-[7px]"
              style={{ color: allSelected ? 'var(--t4)' : 'var(--danger)' }}>
              {evtCount}E
            </span>
            <ChevronDown size={10} strokeWidth={2}
              style={{ color: allSelected ? 'var(--t4)' : 'var(--danger)' }} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[220px] p-0 border-[var(--bd)] bg-[var(--bg-1)] shadow-lg"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-[var(--bd)] bg-[var(--bg-2)]">
            <span className="mono text-[8px] font-bold text-[var(--t4)] tracking-[0.10em]">
              CONFLICT TIMELINE — {CONFLICT_DAYS.length} DAYS
            </span>
          </div>

          {/* Day list */}
          <div className="max-h-[280px] overflow-y-auto">
            {CONFLICT_DAYS.map(day => {
              const active = day === currentDay && !allSelected;
              const snap = getConflictForDay(day);
              const ec = getEventsForDay(day).length;
              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  className="w-full flex items-center gap-[8px] px-3 py-[7px] transition-colors hover:bg-[var(--bg-3)] text-left"
                  style={{
                    background: active ? 'var(--danger-dim)' : 'transparent',
                    borderLeft: active ? '3px solid var(--danger)' : '3px solid transparent',
                    borderBottom: '1px solid var(--bd-s)',
                  }}
                >
                  {/* Day number */}
                  <span className="mono text-[10px] font-bold w-[36px] shrink-0"
                    style={{ color: active ? 'var(--danger)' : 'var(--t2)' }}>
                    {dayLabel(day)}
                  </span>

                  {/* Date + event count */}
                  <div className="flex-1 min-w-0">
                    <span className="mono text-[9px] block"
                      style={{ color: active ? 'var(--danger)' : 'var(--t3)' }}>
                      {day}
                    </span>
                    <span className="mono text-[7px]"
                      style={{ color: active ? 'var(--danger)' : 'var(--t4)' }}>
                      {ec} events
                    </span>
                  </div>

                  {/* Escalation index */}
                  <div className="shrink-0 flex flex-col items-end gap-[1px]">
                    <span className="mono text-[9px] font-bold"
                      style={{ color: snap.escalation >= 90 ? 'var(--danger)' : snap.escalation >= 80 ? 'var(--warning)' : 'var(--t3)' }}>
                      {snap.escalation}
                    </span>
                    <div className="w-[28px] h-[3px] bg-[var(--bg-3)] overflow-hidden">
                      <div className="h-full" style={{
                        width: `${snap.escalation}%`,
                        background: snap.escalation >= 90 ? 'var(--danger)' : snap.escalation >= 80 ? 'var(--warning)' : 'var(--info)',
                      }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Next */}
      <button
        onClick={() => canNext && onDayChange(CONFLICT_DAYS[idx + 1])}
        disabled={!canNext}
        className="flex items-center justify-center w-[22px] h-[22px] border transition-colors"
        style={{
          borderColor: 'var(--bd)',
          background: 'transparent',
          opacity: canNext ? 1 : 0.3,
          cursor: canNext ? 'pointer' : 'default',
        }}
      >
        <ChevronRight size={12} strokeWidth={2} className="text-[var(--t3)]" />
      </button>
    </div>
  );
}
