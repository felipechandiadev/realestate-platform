import { SetMetadata } from '@nestjs/common';

/**
 * Marca un endpoint (o un controlador completo) como público.
 * Los guards globales (JwtAuthGuard + RolesGuard) son deny-by-default:
 * todo lo que no lleve @Public() exige un token válido.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
