# 07 · Modelo de datos

Motor: **MySQL 8**, base `real_estate_platform`. El esquema lo definen las entidades TypeORM (`core/src/modules/*/domain/*.entity.ts`) y se versiona con migraciones (`core/src/database/migrations`).

## 7.1 Entidades principales

| Entidad | Tabla (aprox.) | Descripción |
|---|---|---|
| User | `users` | Cuenta de acceso: correo, contraseña (hash), rol, estado, datos personales |
| Person | `persons` | Persona natural (nombre, RUT/DNI, contacto) usada en contratos |
| Property | `properties` | Propiedad: operación, tipo, precio, moneda, estado, ubicación, características, agente, SEO |
| PropertyType | `property_types` | Catálogo de tipos de propiedad |
| Multimedia / MultimediaVariant | `multimedia` | Fotos y videos, con variantes optimizadas |
| Contract | `contracts` | Contrato de compraventa o arriendo, con personas y roles |
| Payment | `payments` | Pagos asociados a un contrato |
| Document / DocumentType | `documents` | Archivos de contratos y personas, y su clasificación |
| Notification | `notifications` | Avisos para usuarios |
| AuditLog | `audit_logs` | Registro de cambios (quién, qué, cuándo) |
| PasswordResetToken | — | Tokens de recuperación de contraseña |
| Identity | — | Identidad de la empresa (CMS) |
| Appearance / AppearanceTemplate | — | Apariencia del portal |
| PortalHeader / PortalFooter / PortalFeaturedSettings / PortalListingsSettings | — | Configuración del portal desde el CMS |
| Slide · AboutUs · TeamMember · Testimonial · Article | — | Contenido del CMS |
| ConfigOption · PredictStatus | — | Configuración general y estimación de valor |

## 7.2 Relaciones clave

```
User 1──1 Person
User(AGENT) 1──* Property (agente asignado)
User(COMMUNITY) 1──* Property (solicitante / propietario)
Property *──1 PropertyType
Property 1──* Multimedia
Property 1──* Contract
Contract *──* Person (con rol: vendedor, comprador, arrendatario…)
Contract 1──* Payment
Contract 1──* Document *──1 DocumentType
User 1──* Notification
```

## 7.3 Borrado

Las propiedades y otras entidades usan **borrado lógico** (`deletedAt`): no desaparecen de la base, solo dejan de mostrarse.

## 7.4 Índices

Hay índices para las búsquedas públicas (estado + operación, destacadas, región/comuna, precio y moneda) que mantienen rápidos los listados.

## 7.5 Datos iniciales (seed)

`npm run seed --prefix core` crea lo mínimo para operar: usuario administrador, tipos de propiedad, tipos de documento y datos de ejemplo. **En producción solo se usa el seed mínimo** (`seed:minimal`); `seed:reset` borra datos y nunca debe ejecutarse en producción.
