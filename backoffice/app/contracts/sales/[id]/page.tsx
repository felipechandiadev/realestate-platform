import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LoadingState } from '@realestate/ui';
import { getContractById } from '@/features/contracts/actions/contracts.action';
import ContractDetailPage from '../../ui/ContractDetail/ContractDetailPage';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContractSalesDetailRoutePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getContractById(id);

  if (!result.success || !result.contract) {
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
      <ContractDetailPage
        contractId={id}
        listBasePath="/contracts/sales"
        initialHeader={{
          code: result.contract.code ?? null,
          status: result.contract.status ?? null,
        }}
      />
    </Suspense>
  );
}
