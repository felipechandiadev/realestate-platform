/**
 * Genera un slug automático basado en el título
 * Convierte a minúsculas, reemplaza espacios con guiones y remove caracteres especiales
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
