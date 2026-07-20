import { getTestimonials } from '@/features/cms/actions/testimonials.action';
import { TestimonialsContent } from '@/features/cms/components/testimonials/TestimonialsContent';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TestimonialsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const result = await getTestimonials({ search });
  const initialTestimonials = result.success && result.data ? result.data : [];

  return <TestimonialsContent initialTestimonials={initialTestimonials} initialSearch={search} />;
}
