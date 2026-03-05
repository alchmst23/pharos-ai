'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { BriefContent } from '@/components/brief/BriefContent';
import { BriefScreenSkeleton } from '@/components/loading/screen-skeletons';

export default function BriefPage() {
  return (
    <Suspense fallback={<BriefScreenSkeleton />}>
      <BriefContent />
    </Suspense>
  );
}
