import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LoadingState } from '@realestate/ui';
import { getPropertyHeaderInfo } from '@/features/properties/actions/properties.action';
import { PropertyRentDetailPage } from '@/features/properties/components/rent/detail';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyRentDetailRoutePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getPropertyHeaderInfo(id);

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
      <PropertyRentDetailPage
        propertyId={id}
        initialHeader={{
          title: result.data.title ?? null,
          code: result.data.code ?? null,
          status: result.data.status ?? null,
          isFeatured: result.data.isFeatured ?? null,
        }}
      />
    </Suspense>
  );
}
