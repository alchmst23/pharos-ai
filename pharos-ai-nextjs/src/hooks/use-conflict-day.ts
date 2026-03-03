'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { ConflictDay } from '@/types/domain';
import { CONFLICT_DAYS } from '@/types/domain';

const DAY_LABELS: Record<ConflictDay, string> = {
  '2026-02-28': 'DAY 1',
  '2026-03-01': 'DAY 2',
  '2026-03-02': 'DAY 3',
};

const DAY_SHORT: Record<ConflictDay, string> = {
  '2026-02-28': 'FEB 28',
  '2026-03-01': 'MAR 1',
  '2026-03-02': 'MAR 2',
};

export function useConflictDay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = searchParams.get('day') as ConflictDay | null;
  const currentDay: ConflictDay = raw && CONFLICT_DAYS.includes(raw)
    ? raw
    : CONFLICT_DAYS[CONFLICT_DAYS.length - 1];

  const setDay = useCallback((day: ConflictDay) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('day', day);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return {
    currentDay,
    setDay,
    dayLabel: DAY_LABELS[currentDay],
    dayShort: DAY_SHORT[currentDay],
    dayIndex: CONFLICT_DAYS.indexOf(currentDay),
    allDays: CONFLICT_DAYS,
  };
}
