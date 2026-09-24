import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LoadingState } from '@realestate/ui';
import { getCommunityUserHeader } from '@/features/users/actions/users.action';
import { CommunityUserDetailPage } from '@/features/users/components/community/detail';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CommunityUserDetailRoutePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getCommunityUserHeader(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <LoadingState />
        </div>
      }
    >
      <CommunityUserDetailPage userId={id} initialHeader={result.data} />
    </Suspense>
  );
}
