import { PropertyStatus } from '../../../shared/enums/property-status.enum';

/**
 * Estados a los que una propiedad solo puede pasar teniendo un agente asignado.
 * Una única lista para crear, editar y para los agentes de IA, así no se desincronizan.
 */
export const STATUSES_REQUIRING_AGENT: PropertyStatus[] = [
  PropertyStatus.PRE_APPROVED,
  PropertyStatus.PUBLISHED,
  PropertyStatus.CONTRACT_IN_PROGRESS,
  PropertyStatus.SOLD,
  PropertyStatus.RENTED,
];
