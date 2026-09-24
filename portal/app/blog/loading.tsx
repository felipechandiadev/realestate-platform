import CategoriesBlogSkeleton from './ui/CategoriesBlogSkeleton';
import ArticleCardSkeleton from './ui/ArticleCardSkeleton';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Inmobiliario
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre consejos, tendencias y guías sobre el mundo inmobiliario.
            Encuentra la información que necesitas para tomar las mejores decisiones.
          </p>
        </div>

        <div className="mb-8">
          <CategoriesBlogSkeleton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ArticleCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
