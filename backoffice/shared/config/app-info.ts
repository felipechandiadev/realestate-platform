export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'RealEstate Platform';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.33.1';
export const APP_RELEASE = process.env.NEXT_PUBLIC_APP_RELEASE || '21 de diciembre de 2025';

export const APP_FEATURES = [
  'Propiedades en venta y en arriendo, con sus tipos.',
  'Contratos de compraventa y de arriendo, con personas y documentos.',
  'Usuarios: administradores, agentes y comunidad.',
  'Contenido del sitio: slider, nosotros, equipo, testimonios, blog, identidad, barra superior y apariencia.',
  'Notificaciones.',
] as const;

export const APP_AUTHOR = {
  name: 'Felipe Chandía Castillo',
  email: 'felipe.chandia.cast@gmail.com',
  phone: '+56930978304',
  phoneLabel: '+56 9 3097 8304',
} as const;
