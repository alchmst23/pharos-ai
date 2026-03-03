'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { BriefContent } from '@/components/brief/BriefContent';

export default function BriefPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><span className="label">Loading…</span></div>}>
      <BriefContent />
    </Suspense>
  );
}
