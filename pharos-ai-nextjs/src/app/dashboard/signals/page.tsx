'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { SignalsContent } from '@/components/signals/SignalsContent';
import { ListDetailScreenSkeleton } from '@/components/loading/screen-skeletons';

export default function SignalsPage() {
  return (
    <Suspense fallback={<ListDetailScreenSkeleton />}>
      <SignalsContent />
    </Suspense>
  );
}
