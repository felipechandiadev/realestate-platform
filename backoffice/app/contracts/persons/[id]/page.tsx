import { Suspense } from 'react';
import { getPerson } from '@/features/contracts/actions/persons.action';
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots';
import PersonDetailView from '../ui/PersonDetailView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PersonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPerson(id);

  return (
    <Suspense fallback={<PageLoadingDots />}>
      <PersonDetailView person={person} />
    </Suspense>
  );
}
