'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { ActorsContent } from '@/components/actors/ActorsContent';

export default function ActorsPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><span className="label">Loading…</span></div>}>
      <ActorsContent />
    </Suspense>
  );
}
