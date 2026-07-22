import type { StepperStepItem } from '@realestate/ui';

export const CREATE_PROPERTY_WIZARD_STEPS: StepperStepItem[] = [
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Título, descripción, tipo y precio de la propiedad',
  },
  {
    id: 'details',
    title: 'Detalles de la Propiedad',
    description: 'Características específicas según el tipo de propiedad',
  },
  {
    id: 'location',
    title: 'Ubicación',
    description: 'Estado, ciudad, dirección y coordenadas',
  },
  {
    id: 'multimedia',
    title: 'Multimedia',
    description: 'Imágenes y videos de la propiedad',
  },
  {
    id: 'seo',
    title: 'SEO y Marketing',
    description: 'Optimización para motores de búsqueda',
  },
  {
    id: 'notes',
    title: 'Notas Internas',
    description: 'Información adicional para el equipo interno',
  },
];

export const CREATE_PROPERTY_WIZARD_LAST_INDEX = CREATE_PROPERTY_WIZARD_STEPS.length - 1;
