'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { FeedContent } from '@/components/feed/FeedContent';

export default function IntelFeedPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><span className="label">Loading…</span></div>}>
      <FeedContent />
    </Suspense>
  );
}
