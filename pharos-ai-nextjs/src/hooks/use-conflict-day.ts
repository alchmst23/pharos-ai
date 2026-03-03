'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { dayLabel, dayShort, dayIndex } from '@/lib/day-filter';
import type { ConflictDay } from '@/types/domain';
import { CONFLICT_DAYS } from '@/types/domain';

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
    dayLabel: dayLabel(currentDay),
    dayShort: dayShort(currentDay),
    dayIndex: dayIndex(currentDay),
    allDays: CONFLICT_DAYS,
  };
}
