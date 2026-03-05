'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { FeedContent } from '@/components/feed/FeedContent';
import { ListDetailScreenSkeleton } from '@/components/loading/screen-skeletons';

export default function IntelFeedPage() {
  return (
    <Suspense fallback={<ListDetailScreenSkeleton />}>
      <FeedContent />
    </Suspense>
  );
}
