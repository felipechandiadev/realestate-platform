import { getPerson } from '@/features/backoffice/contracts/actions/persons.action';
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
    <div className="p-6">
      <PersonDetailView person={person} />
    </div>
  );
}
