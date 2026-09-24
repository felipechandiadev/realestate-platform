// Ejemplo de uso del sistema de títulos dinámicos
import { getTitleFromPath, addRouteTitle, getAllRouteTitles } from './routeTitles';

// Uso básico - obtener título de una ruta
const currentPath = '/backOffice/users/administrators';
const title = getTitleFromPath(currentPath);
console.log(title); // "Administradores"

// Agregar un nuevo mapeo de ruta
addRouteTitle('/backOffice/new-section', 'Nueva Sección');

// Ver todos los títulos disponibles
const allTitles = getAllRouteTitles();
console.log(allTitles);

// En un componente React:
/*
import { usePathname } from 'next/navigation';
import { getTitleFromPath } from '@/lib/routeTitles';

function MyComponent() {
  const pathname = usePathname();
  const pageTitle = getTitleFromPath(pathname);

  return (
    <div>
      <h1>{pageTitle}</h1>
      // resto del componente
    </div>
  );
}

// En la TopBar:
/*
import TopBar from '@/shared/components/ui/TopBar/TopBar';
import { usePathname } from 'next/navigation';
import { getTitleFromPath } from '@/lib/routeTitles';

function AppLayout() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return (
    <TopBar
      title={title} // ← Título dinámico basado en la ruta actual
      // ... otros props
    />
  );
}
*/

export {};