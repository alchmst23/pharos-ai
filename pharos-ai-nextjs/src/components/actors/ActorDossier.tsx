'use client';
import { CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IntelTabBar, TabsContent } from '@/components/shared/IntelTabs';
import { SectionDivider } from '@/components/shared/SectionDivider';
import Flag from '@/components/shared/Flag';
import XPostCard from '@/components/shared/XPostCard';
import { ACT_C, STA_C, type Actor } from '@/data/iranActors';
import { getPostsForActor } from '@/data/iranXPosts';
import { getActorForDay } from '@/lib/day-filter';
import type { ConflictDay } from '@/types/domain';
import { CONFLICT_DAYS } from '@/types/domain';

const TYPE_C: Record<string, string> = {
  MILITARY: 'var(--danger)', DIPLOMATIC: 'var(--info)',
  POLITICAL: 'var(--cyber)', ECONOMIC: 'var(--warning)', INTELLIGENCE: 'var(--t2)',
};

const DAY_LABELS: Record<ConflictDay, string> = {
  '2026-02-28': 'D1',
  '2026-03-01': 'D2',
  '2026-03-02': 'D3',
};

interface Props {
  actor: Actor;
  tab: 'intel' | 'signals';
  onTabChange: (t: 'intel' | 'signals') => void;
  currentDay: ConflictDay;
}

export function ActorDossier({ actor, tab, onTabChange, currentDay }: Props) {
  const snap   = getActorForDay(actor, currentDay);
  const actC   = ACT_C[snap.activityLevel] ?? 'var(--t2)';
  const staC   = STA_C[snap.stance] ?? 'var(--t2)';
  const xPosts = getPostsForActor(actor.id);

  // Filter recent actions to selected day
  const dayActions = actor.recentActions.filter(a => a.date === currentDay);

  const tabs = [
    { value: 'intel'   as const, label: 'ACTOR INTELLIGENCE' },
    { value: 'signals' as const, label: `𝕏 SIGNALS${xPosts.length > 0 ? ` (${xPosts.length})` : ''}` },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[var(--bd)] bg-[var(--bg-2)] shrink-0">
        <div className="label text-[8px] text-[var(--t3)] mb-2">
          ACTOR INTELLIGENCE DOSSIER // PHAROS THREAT ANALYSIS // OPERATION EPIC FURY
        </div>
        <div className="flex items-start gap-3.5 mb-2.5">
          {actor.countryCode && <Flag code={actor.countryCode} size={36} />}
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-base font-bold text-[var(--t1)] leading-[1.1]">
                {actor.name.toUpperCase()}
              </h1>
              <span
                className="text-[8px] font-bold tracking-[0.06em] px-2 py-0.5"
                style={{ border: `1px solid ${actC}`, color: actC }}
              >
                {snap.activityLevel}
              </span>
              <span
                className="text-[8px] font-bold tracking-[0.06em] px-2 py-0.5"
                style={{ border: `1px solid ${staC}`, color: staC }}
              >
                {snap.stance}
              </span>
            </div>
            <span className="mono text-[10px] text-[var(--t2)]">{actor.fullName}</span>
            <span className="label ml-2.5 text-[8px] text-[var(--t3)]">{actor.type}</span>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <div className="h-1.5 w-20 bg-[var(--bd)]">
              <div style={{ width: `${snap.activityScore}%`, height: '100%', background: actC }} />
            </div>
            <span className="mono text-[11px]" style={{ color: actC }}>{snap.activityScore}%</span>
          </div>
        </div>

        {/* Stance timeline — 3 pills showing stance across days */}
        <div className="flex items-center gap-1 mt-1">
          <span className="label text-[7px] text-[var(--t4)] mr-1">STANCE</span>
          {CONFLICT_DAYS.map(day => {
            const ds = getActorForDay(actor, day);
            const sc = STA_C[ds.stance] ?? 'var(--t2)';
            const isCurrent = day === currentDay;
            return (
              <div
                key={day}
                className="flex items-center gap-[3px] px-[6px] py-[2px]"
                style={{
                  background: sc + '18',
                  border: `1px solid ${isCurrent ? sc : 'transparent'}`,
                }}
              >
                <span className="mono text-[7px] font-bold" style={{ color: sc }}>{DAY_LABELS[day]}</span>
                <span className="text-[7px] font-bold tracking-[0.04em]" style={{ color: sc }}>{ds.stance}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <IntelTabBar value={tab} onValueChange={onTabChange} tabs={tabs}>
        <TabsContent value="intel" className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-[22px] py-[18px]">
              <div className="mb-5">
                <SectionDivider label="SAYING — OFFICIAL POSITION" />
                <div className="pl-3" style={{ borderLeft: `3px solid ${staC}` }}>
                  <p className="text-[12.5px] text-[var(--t1)] leading-relaxed italic">
                    {snap.saying}
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <SectionDivider label="DOING — VERIFIED ACTIONS" />
                <div className="flex flex-col gap-1">
                  {snap.doing.map((action, i) => (
                    <div key={i} className="flex gap-2.5 px-2.5 py-1.5 border border-[var(--bd)]">
                      <span className="text-xs shrink-0 mt-px" style={{ color: actC }}>▸</span>
                      <span className="text-xs text-[var(--t1)] leading-snug">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <SectionDivider label="PHAROS ASSESSMENT" />
                <div className="border-l-[3px] border-[var(--blue)] pl-3">
                  <p className="text-[12.5px] text-[var(--t1)] leading-relaxed">{snap.assessment}</p>
                </div>
              </div>

              <div className="mb-5">
                <SectionDivider label={`RECENT ACTIONS — ${currentDay} (${dayActions.length})`} />
                <div className="flex flex-col gap-1">
                  {dayActions.map((action, i) => {
                    const ac = TYPE_C[action.type] ?? 'var(--t2)';
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-[86px_64px_1fr] py-1.5 border-b border-[var(--bd-s)]"
                      >
                        <span className="mono text-[10px] text-[var(--t3)] self-start pt-px">
                          {action.date}
                        </span>
                        <div className="flex flex-col gap-[3px]">
                          <span
                            className="text-[8px] font-bold px-[5px] py-px tracking-[0.04em]"
                            style={{ background: ac + '18', color: ac }}
                          >
                            {action.type}
                          </span>
                          <div className="flex gap-1 items-center">
                            {action.verified
                              ? <CheckCircle size={8} className="text-[var(--success)]" strokeWidth={2} />
                              : <span className="mono text-[8px] text-[var(--t4)]">UNCFMD</span>
                            }
                          </div>
                        </div>
                        <p className="text-[11.5px] text-[var(--t1)] leading-snug pl-1">
                          {action.description}
                        </p>
                      </div>
                    );
                  })}
                  {dayActions.length === 0 && (
                    <p className="text-[10px] text-[var(--t4)] py-2">No recorded actions for this day</p>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <SectionDivider label="KEY FIGURES" />
                <div className="flex gap-1.5 flex-wrap">
                  {actor.keyFigures.map((fig, i) => (
                    <div key={i} className="px-2.5 py-[3px] border border-[var(--bd)] bg-[var(--bg-2)]">
                      <span className="text-[10px] text-[var(--t2)]">{fig}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="signals" className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-4 py-3">
              {xPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="text-xl text-[var(--t3)]">𝕏</span>
                  <p className="label text-[var(--t3)] mt-2">
                    No signals indexed for this actor
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-2.5">
                    <span className="label text-[8px]">
                      {xPosts.length} POSTS · PHAROS-CURATED · {actor.name.toUpperCase()}
                    </span>
                  </div>
                  {xPosts.map(p => <XPostCard key={p.id} post={p as import('@/data/iranXPosts').XPost} />)}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </IntelTabBar>
    </div>
  );
}
