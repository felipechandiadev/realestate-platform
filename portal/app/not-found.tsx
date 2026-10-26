import Link from 'next/link';

export const metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Página no encontrada</h1>
        <p className="text-muted-foreground">
          La página que buscas no existe o la propiedad ya no está publicada.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/properties" className="text-primary underline">
            Ver propiedades
          </Link>
          <Link href="/" className="text-primary underline">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
