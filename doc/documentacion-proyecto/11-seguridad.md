# 11 · Seguridad

## 11.1 Medidas implementadas

| Ámbito | Medida |
|---|---|
| Transporte | HTTPS obligatorio (Let's Encrypt), redirección desde HTTP |
| Contraseñas | Guardadas con hash (nunca en texto plano) |
| Sesión | JWT firmado; NextAuth en los frontends |
| Autorización | Roles y permisos validados en la API |
| Validación | DTOs con validación estricta de entrada |
| Abuso | Límite de 5 solicitudes por minuto e IP en registro, recuperación y formularios públicos |
| Enumeración de cuentas | Respuestas neutras en verificación y recuperación |
| Tokens | Verificación 24 h, recuperación 30 min, un solo uso |
| Base de datos | Solo accesible desde el servidor |
| Documentación API | Swagger desactivado en producción |
| Auditoría | Registro de cambios relevantes |
| Secretos | Fuera del repositorio, en `.env` del servidor |

## 11.2 Datos personales

La plataforma guarda datos personales (nombre, RUT/DNI, correo, teléfono, documentos de contratos). Recomendaciones para el cliente:
- Mantener actualizada la [política de privacidad](https://bravoshottpropiedades.cl/privacidad).
- Limitar las cuentas de administrador a quienes las necesitan y desactivar usuarios que dejan la empresa.
- No compartir contraseñas entre personas.

## 11.3 Acciones recomendadas en la entrega

- [ ] Rotar `JWT_SECRET`, `NEXTAUTH_SECRET`, la contraseña de MySQL, la API key de Resend y las claves de R2.
- [ ] Cambiar la contraseña del administrador inicial.
- [ ] Guardar los `.env` en un gestor de contraseñas del cliente.
- [ ] Activar respaldos automáticos de la base de datos.
- [ ] Activar 2FA en Cloudflare, Resend, GitHub y el proveedor del VPS.
