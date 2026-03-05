'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { ActorsContent } from '@/components/actors/ActorsContent';
import { ListDetailScreenSkeleton } from '@/components/loading/screen-skeletons';

export default function ActorsPage() {
  return (
    <Suspense fallback={<ListDetailScreenSkeleton />}>
      <ActorsContent />
    </Suspense>
  );
}
