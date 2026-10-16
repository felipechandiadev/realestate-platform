import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots';
import { getContractById } from '@/features/contracts/actions/contracts.action';
import ContractDetailPage from '../../ui/ContractDetail/ContractDetailPage';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContractRentDetailRoutePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getContractById(id);

  if (!result.success || !result.contract) {
    notFound();
  }

  return (
    <Suspense
      fallback={<PageLoadingDots />}
    >
      <ContractDetailPage
        contractId={id}
        listBasePath="/contracts/rent"
        initialHeader={{
          code: result.contract.code ?? null,
          status: result.contract.status ?? null,
        }}
      />
    </Suspense>
  );
}
