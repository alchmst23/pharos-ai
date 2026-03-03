import type { ConflictDay, ActorDaySnapshot, ConflictDaySnapshot, IntelEvent, XPost, Actor } from '@/types/domain';
import { CONFLICT_DAYS } from '@/types/domain';
import { EVENTS } from '@/data/iranEvents';
import { X_POSTS } from '@/data/iranXPosts';
import { CONFLICT } from '@/data/iranConflict';

/** Get the ConflictDay a timestamp falls on (defaults to last day). */
export function getDayFromTimestamp(ts: string): ConflictDay {
  const date = ts.slice(0, 10) as ConflictDay;
  if (CONFLICT_DAYS.includes(date)) return date;
  return CONFLICT_DAYS[CONFLICT_DAYS.length - 1];
}

/** Filter events to a single conflict day. */
export function getEventsForDay(day: ConflictDay): IntelEvent[] {
  return EVENTS.filter(e => getDayFromTimestamp(e.timestamp) === day);
}

/** Filter X posts to a single conflict day. */
export function getPostsForDay(day: ConflictDay): XPost[] {
  return X_POSTS.filter(p => getDayFromTimestamp(p.timestamp) === day);
}

/** Get an actor's snapshot for a given day. */
export function getActorForDay(actor: Actor, day: ConflictDay): ActorDaySnapshot {
  return actor.daySnapshots[day];
}

/** Get the conflict-level snapshot for a given day. */
export function getConflictForDay(day: ConflictDay): ConflictDaySnapshot {
  return CONFLICT.daySnapshots.find(s => s.day === day) ?? CONFLICT.daySnapshots[CONFLICT.daySnapshots.length - 1];
}

/** Day index (0-based) from a ConflictDay. */
export function dayIndex(day: ConflictDay): number {
  return CONFLICT_DAYS.indexOf(day);
}

/** Human label: "DAY 1", "DAY 2", etc. */
export function dayLabel(day: ConflictDay): string {
  return `DAY ${dayIndex(day) + 1}`;
}

/** Short date: "FEB 28", "MAR 1", etc. */
export function dayShort(day: ConflictDay): string {
  const d = new Date(day + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase();
}

/** Abbreviated day label: "D1", "D2", etc. */
export function dayAbbrev(day: ConflictDay): string {
  return `D${dayIndex(day) + 1}`;
}
