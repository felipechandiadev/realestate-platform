# Duplicación restante (fase 6)

## Extraído a `packages/api-client`

- `portal/lib/api/client.ts` y `backoffice/lib/api/client.ts` ahora son wrappers delgados
  sobre `createApiClient()` de `@realestate/api-client`.

## Sigue duplicado (no forzar merge)

| Pieza | Motivo |
|-------|--------|
| `lib/apiClient.ts` (`fetchWithAuthCheck` / `withAuthCheck`) | Depende de `next/navigation` `redirect`; misma lógica pero acoplada a Next. |
| `lib/env.ts` | Idéntico en esencia; cada app puede divergir en vars públicas. |
| `lib/auth.ts` | NextAuth options distintas (callbacks, páginas). |
| `lib/routeTitles*.ts` / `route-model.json` | Rutas distintas portal vs backoffice. |
| `features/shared/**/services` | Muchos servicios espejo; conviene migrar gradualmente tras estabilizar el client. |
| Componentes UI compartibles | Ya viven en `packages/ui`; lo que queda en apps es específico de audiencia. |

No se movió `features/shared` completo: hay divergencias y riesgo alto sin tests de integración.
