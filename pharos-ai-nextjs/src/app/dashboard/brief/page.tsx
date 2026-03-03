'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { ACTORS }   from '@/data/iranActors';
import { ScrollArea } from '@/components/ui/scroll-area';
import Flag from '@/components/shared/Flag';
import { DaySelector } from '@/components/shared/DaySelector';
import { BriefSection, EconChip, ScenarioCard } from '@/components/brief/BriefSection';
import { useConflictDay } from '@/hooks/use-conflict-day';
import { getConflictForDay, getActorForDay } from '@/lib/day-filter';
import { ACT_C, STA_C } from '@/data/iranActors';

const SOURCES = [
  { name: 'Reuters',                     tier: 1, note: 'Primary wire coverage — Tel Aviv, Tehran, Washington, Muscat' },
  { name: 'New York Times',              tier: 1, note: 'Investigative sourcing + senior Pentagon readouts' },
  { name: 'Associated Press',            tier: 1, note: 'Casualty figures, diplomatic wires, Pakistan protests' },
  { name: 'CENTCOM official statements', tier: 1, note: 'US KIA, strike footage, fact-checks, friendly fire disclosure' },
  { name: 'IDF Spokesperson',            tier: 1, note: 'Strike confirmations, target lists, Northern Front operations' },
  { name: 'NBC News / Richard Engel',    tier: 1, note: 'On-ground reporting, verified footage, Trump interviews' },
  { name: 'The Guardian',                tier: 1, note: 'Live blog, RAF Akrotiri, IAEA, UK govt statements' },
  { name: 'IAEA Director General',       tier: 1, note: 'Nuclear facility safeguards, radiation monitoring, reactor warnings' },
  { name: 'Bloomberg / Javier Blas',     tier: 1, note: 'Energy markets, Ras Tanura shutdown, OPEC+ analysis' },
  { name: 'Al Jazeera',                  tier: 1, note: 'Gulf civilian damage, Iran leadership council, Larijani rejection' },
  { name: 'UK gov.uk / MoD',            tier: 1, note: 'E3 joint statement, RAF Akrotiri response, base authorization' },
  { name: 'IRNA / PressTV (Iran state)', tier: 2, note: 'Iranian claims — treat as propaganda unless corroborated by tier 1' },
  { name: 'Times of Israel',             tier: 2, note: 'Israeli domestic coverage, Beit Shemesh details, northern sirens' },
  { name: 'Kpler / MarineTraffic',       tier: 2, note: 'Strait of Hormuz vessel tracking, tanker strikes' },
  { name: 'Cirium (aviation)',            tier: 2, note: 'Flight cancellation tracking — 6,000+ across 3 days' },
];

const TIER_C: Record<number, string> = { 1: 'var(--success)', 2: 'var(--warning)' };

function BriefInner() {
  const { currentDay, setDay, dayLabel, dayIndex } = useConflictDay();
  const snapshot = getConflictForDay(currentDay);
  const majorActors = ACTORS.filter(a => ['us', 'idf', 'iran', 'irgc', 'houthis'].includes(a.id));

  return (
    <ScrollArea className="flex-1 bg-[var(--bg-1)]">
      <div className="max-w-[720px] mx-auto px-6 pt-8 pb-[60px]">

        {/* Classification header */}
        <div className="text-center mb-8 pb-5 border-b-2 border-[var(--bd)]">
          <div className="mb-2">
            <span className="mono text-[9px] font-bold tracking-[0.16em] text-[var(--t4)] uppercase">
              UNCLASSIFIED // PHAROS ANALYTICAL
            </span>
          </div>
          <h1 className="mono text-[22px] font-bold text-[var(--t1)] tracking-[0.04em] mb-[6px]">
            DAILY INTELLIGENCE BRIEF
          </h1>
          <h2 className="mono text-[15px] font-bold text-[var(--danger)] tracking-[0.08em] mb-2.5">
            OPERATION EPIC FURY / ROARING LION
          </h2>
          <div className="flex justify-center gap-5 mb-4">
            <span className="mono text-[10px] text-[var(--t3)]">DATE: {currentDay}</span>
            <span className="mono text-[10px] text-[var(--t3)]">AS OF: 12:00 UTC</span>
            <span className="mono text-[10px] text-[var(--t3)]">DAY {dayIndex + 1} OF OPERATIONS</span>
          </div>
          <div className="flex justify-center">
            <DaySelector currentDay={currentDay} onDayChange={setDay} />
          </div>
        </div>

        <BriefSection number="1" title="EXECUTIVE SUMMARY">
          <p className="leading-[1.8] text-[var(--t1)]">{snapshot.summary}</p>
        </BriefSection>

        <BriefSection number="2" title={`KEY DEVELOPMENTS — ${dayLabel}`}>
          <div className="flex flex-col gap-[6px]">
            {snapshot.keyFacts.map((fact, i) => (
              <div key={i} className="flex gap-3 px-3 py-2 bg-[var(--bg-2)] border border-[var(--bd)] [border-left:3px_solid_var(--danger)]">
                <span className="mono text-[10px] font-bold text-[var(--danger)] shrink-0 pt-[1px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[12.5px] text-[var(--t1)] leading-normal">{fact}</p>
              </div>
            ))}
          </div>
        </BriefSection>

        <BriefSection number="3" title="SITUATION BY ACTOR">
          <div className="flex flex-col gap-3">
            {majorActors.map(actor => {
              const snap = getActorForDay(actor, currentDay);
              const actC = ACT_C[snap.activityLevel] ?? 'var(--t2)';
              const staC = STA_C[snap.stance] ?? 'var(--t2)';
              return (
                <div key={actor.id} className="px-4 py-3 bg-[var(--bg-2)] border border-[var(--bd)]">
                  <div className="flex items-center gap-2 mb-2">
                    {actor.countryCode && <Flag code={actor.countryCode} size={18} />}
                    <span className="text-[13px] font-bold text-[var(--t1)]">{actor.fullName}</span>
                    <span className="text-[8px] font-bold px-[6px] py-[2px] ml-auto"
                      style={{ background: actC + '18', color: actC }}>
                      {snap.activityLevel}
                    </span>
                    <span className="text-[8px] font-bold px-[6px] py-[2px]"
                      style={{ background: staC + '18', color: staC }}>
                      {snap.stance}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[var(--t2)] leading-relaxed">{snap.assessment}</p>
                </div>
              );
            })}
          </div>
        </BriefSection>

        <BriefSection number="4" title="ECONOMIC IMPACT">
          <p className="leading-[1.8] text-[var(--t2)] mb-3">
            {snapshot.economicImpact.narrative}
          </p>
          <div className="flex gap-[10px] mb-3 flex-wrap">
            {snapshot.economicImpact.chips.map((chip, i) => (
              <EconChip key={i} label={chip.label} val={chip.val} sub={chip.sub} color={chip.color} />
            ))}
          </div>
        </BriefSection>

        <BriefSection number="5" title="OUTLOOK — THREE SCENARIOS">
          <div className="flex flex-col gap-[10px]">
            {snapshot.scenarios.map((s, i) => (
              <ScenarioCard key={i} label={s.label} subtitle={s.subtitle} color={s.color} prob={s.prob} body={s.body} />
            ))}
          </div>
        </BriefSection>

        <BriefSection number="6" title="SOURCES">
          <div className="flex flex-col gap-1">
            {SOURCES.map((src, i) => (
              <div key={i} className="flex items-center gap-[10px] px-[10px] py-[6px] border border-[var(--bd)]">
                <span
                  className="text-[8px] font-bold px-[5px] py-[1px] shrink-0"
                  style={{ background: TIER_C[src.tier] + '22', color: TIER_C[src.tier] }}
                >
                  T{src.tier}
                </span>
                <span className="text-[11px] font-semibold text-[var(--t1)] min-w-[180px]">{src.name}</span>
                <span className="text-[10px] text-[var(--t3)] flex-1">{src.note}</span>
              </div>
            ))}
          </div>
        </BriefSection>

        <div className="mt-10 pt-4 border-t border-[var(--bd)] text-center">
          <span className="label text-[8px] text-[var(--t4)]">
            UNCLASSIFIED // PHAROS ANALYTICAL // OPERATION EPIC FURY // {currentDay}
          </span>
        </div>
      </div>
    </ScrollArea>
  );
}

export default function BriefPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><span className="label">Loading…</span></div>}>
      <BriefInner />
    </Suspense>
  );
}
