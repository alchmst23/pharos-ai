'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { SignalsContent } from '@/components/signals/SignalsContent';

export default function SignalsPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><span className="label">Loading…</span></div>}>
      <SignalsContent />
    </Suspense>
  );
}
