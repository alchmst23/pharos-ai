'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { DayPickerDropdown } from '@/components/shared/DayPickerDropdown';
import { dayLabel, dayShort, getEventsForDay } from '@/lib/day-filter';
import type { ConflictDay } from '@/types/domain';
import { CONFLICT_DAYS } from '@/types/domain';

type Props = {
  currentDay: ConflictDay;
  onDayChange: (day: ConflictDay) => void;
  showAll?: boolean;
  allSelected?: boolean;
  onAllClick?: () => void;
};

export function DaySelector({ currentDay, onDayChange, showAll, allSelected, onAllClick }: Props) {
  const [open, setOpen] = useState(false);
  const idx = CONFLICT_DAYS.indexOf(currentDay);
  const canPrev = idx > 0;
  const canNext = idx < CONFLICT_DAYS.length - 1;
  const evtCount = getEventsForDay(currentDay).length;

  function handleSelect(day: ConflictDay) {
    onDayChange(day);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-[5px]">
      {showAll && (
        <Button
          variant="outline"
          size="xs"
          onClick={onAllClick}
          className="mono text-[9px] font-bold tracking-[0.06em] rounded-none"
          style={{
            borderColor: allSelected ? 'var(--blue)' : 'var(--bd)',
            background: allSelected ? 'var(--blue-dim)' : undefined,
            color: allSelected ? 'var(--blue-l)' : 'var(--t3)',
          }}
        >
          ALL
        </Button>
      )}

      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => canPrev && onDayChange(CONFLICT_DAYS[idx - 1])}
        disabled={!canPrev}
        className="rounded-none"
        style={{ borderColor: 'var(--bd)' }}
      >
        <ChevronLeft size={12} strokeWidth={2} className="text-[var(--t3)]" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="xs"
            className="flex items-center gap-1.5 min-w-[130px] justify-center rounded-none"
            style={{
              borderColor: allSelected ? 'var(--bd)' : 'var(--danger)',
              background: allSelected ? undefined : 'var(--danger-dim)',
            }}
          >
            <span
              className="mono text-[9px] font-bold tracking-[0.08em]"
              style={{ color: allSelected ? 'var(--t3)' : 'var(--danger)' }}
            >
              {dayLabel(currentDay)}
            </span>
            <span
              className="mono text-[8px]"
              style={{ color: allSelected ? 'var(--t4)' : 'var(--danger)' }}
            >
              {dayShort(currentDay)}
            </span>
            <span
              className="mono text-[7px]"
              style={{ color: allSelected ? 'var(--t4)' : 'var(--danger)' }}
            >
              {evtCount}E
            </span>
            <ChevronDown
              size={10}
              strokeWidth={2}
              style={{ color: allSelected ? 'var(--t4)' : 'var(--danger)' }}
            />
          </Button>
        </PopoverTrigger>

        <DayPickerDropdown
          currentDay={currentDay}
          allSelected={allSelected}
          onSelect={handleSelect}
        />
      </Popover>

      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => canNext && onDayChange(CONFLICT_DAYS[idx + 1])}
        disabled={!canNext}
        className="rounded-none"
        style={{ borderColor: 'var(--bd)' }}
      >
        <ChevronRight size={12} strokeWidth={2} className="text-[var(--t3)]" />
      </Button>
    </div>
  );
}
