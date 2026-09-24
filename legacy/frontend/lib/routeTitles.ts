// Utilidades para obtener títulos dinámicos basados en rutas
export const routeTitles: Record<string, string> = {
  '/backOffice': 'Panel de Administración',
  '/backOffice/properties/sales': 'Propiedades en Venta',
  '/backOffice/properties/propertyTypes': 'Tipos de Propiedad',
  '/backOffice/contracts/persons': 'Personas',
  '/backOffice/contracts/documents': 'Documentos',
  '/backOffice/contracts/documentTypes': 'Tipos de Documentos',
  '/backOffice/users/administrators': 'Administradores',
  '/backOffice/cms/slider': 'Gestión de Slider',
  '/backOffice/cms/aboutUs': 'Sobre Nosotros',
  '/backOffice/cms/ourTeam': 'Nuestro Equipo',
  '/backOffice/cms/testimonials': 'Testimonios',
  '/backOffice/cms/articles': 'Artículos de Blog',
  '/backOffice/cms/identity': 'Identidad de la Empresa',
  // Agregar más rutas según sea necesario
};

/**
 * Obtiene el título correspondiente a una ruta
 * @param pathname - La ruta actual (ej: '/backOffice/users/administrators')
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
 * @param route - La ruta (ej: '/backOffice/new-section')
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