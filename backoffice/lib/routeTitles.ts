// Utilidades para obtener títulos dinámicos basados en rutas
export const routeTitles: Record<string, string> = {
  '/': 'Panel de Administración',
  '/properties/sales': 'Propiedades en Venta',
  '/properties/rent': 'Propiedades en Arriendo',
  '/properties/propertyTypes': 'Tipos de Propiedad',
  '/contracts/persons': 'Personas',
  '/contracts/documents': 'Documentos',
  '/contracts/documentTypes': 'Tipos de Documentos',
  '/users/administrators': 'Administradores',
  '/cms/slider': 'Gestión de Slider',
  '/cms/aboutUs': 'Sobre Nosotros',
  '/cms/ourTeam': 'Nuestro Equipo',
  '/cms/testimonials': 'Testimonios',
  '/cms/articles': 'Artículos de Blog',
  '/cms/identity': 'Identidad de la Empresa',
  // Agregar más rutas según sea necesario
};

/**
 * Obtiene el título correspondiente a una ruta
 * @param pathname - La ruta actual (ej: '/users/administrators')
 * @param defaultTitle - Título por defecto si no se encuentra coincidencia
 * @returns El título correspondiente a la ruta
 */
export const getTitleFromPath = (pathname: string, defaultTitle = 'Panel de Administración'): string => {
  // Buscar coincidencia exacta primero
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }

  // Buscar coincidencias parciales (útil para rutas con parámetros o sub-rutas)
  for (const [route, title] of Object.entries(routeTitles)) {
    if (pathname.startsWith(route)) {
      return title;
    }
  }

  // Título por defecto
  return defaultTitle;
};

/**
 * Agrega un nuevo mapeo de ruta a título
 * @param route - La ruta (ej: '/new-section')
 * @param title - El título correspondiente
 */
export const addRouteTitle = (route: string, title: string): void => {
  routeTitles[route] = title;
};

/**
 * Obtiene todos los títulos de rutas disponibles
 * @returns Objeto con todas las rutas y sus títulos
 */
export const getAllRouteTitles = (): Record<string, string> => {
  return { ...routeTitles };
};