# Mapa FK usuarios — staff vs community

Separación lógica (Fase C). Tabla `users` compartida; audiencia en JWT (`aud: staff | community`).

| Recurso | Relación | Audiencia |
|---------|----------|-----------|
| `users.role` ADMIN / AGENT | StaffUser lógico | staff |
| `users.role` COMMUNITY | CommunityUser lógico | community |
| Property.agentId | Staff (AGENT) | staff |
| Favoritos / owner community | CommunityUser | community |
| CMS (articles, slides, team) | Staff | staff |
| Contratos / documents admin | Staff | staff |
| Registro portal | Community only | community |

Endpoints:

- `POST /auth/staff/sign-in`
- `POST /auth/community/sign-in`
- `POST /auth/community/register`
- Legacy: `POST /auth/sign-in`, `POST /auth/register`
