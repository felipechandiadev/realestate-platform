# Alert Component

Un componente de alerta elegante y accesible con múltiples variantes visuales para mostrar mensajes informativos, de éxito, advertencia y error.

## 🚀 Características Principales

- ✅ **Múltiples Variantes**: success, info, warning, error
- ✅ **Accesibilidad**: ARIA role="alert" para lectores de pantalla
- ✅ **Diseño Elegante**: Bordes redondeados, colores apropiados
- ✅ **Overlay Visual**: Fondo semi-transparente para destacar
- ✅ **Responsive**: Diseño adaptativo
- ✅ **TypeScript**: Completamente tipado
- ✅ **Data Test IDs**: Soporte para testing automatizado

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import Alert from '@/components/Alert';
import type { AlertVariant } from '@/components/Alert';
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import Alert from '@/components/Alert';

export default function BasicAlert() {
  return (
    <div className="space-y-4">
      <Alert variant="success">
        ¡Operación completada exitosamente!
      </Alert>

      <Alert variant="info">
        Información importante para el usuario.
      </Alert>

      <Alert variant="warning">
        Advertencia: revisa antes de continuar.
      </Alert>

      <Alert variant="error">
        Error: no se pudo completar la operación.
      </Alert>
    </div>
  );
}
```

## 🔧 API Reference

### Props del Alert

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `AlertVariant` | `"info"` | Tipo de alerta (success, info, warning, error) |
| `children` | `React.ReactNode` | **Requerido** | Contenido de la alerta |
| `className` | `string` | `""` | Clases CSS adicionales |
| `dataTestId` | `string` | `undefined` | ID para testing (auto-generado si no se proporciona) |

### AlertVariant Type

```tsx
type AlertVariant = "success" | "info" | "warning" | "error";
```

## 🎨 Variantes

### Success (Éxito)

```tsx
<Alert variant="success">
  ✅ Los datos se guardaron correctamente
</Alert>
```

### Info (Información)

```tsx
<Alert variant="info">
  ℹ️ Recuerda completar todos los campos requeridos
</Alert>
```

### Warning (Advertencia)

```tsx
<Alert variant="warning">
  ⚠️ Esta acción no se puede deshacer
</Alert>
```

### Error (Error)

```tsx
<Alert variant="error">
  ❌ Error al procesar la solicitud
</Alert>
```

## 🎯 Casos de Uso Comunes

### Mensajes de Validación en Formularios

```tsx
import React, { useState } from 'react';
import Alert from '@/components/Alert';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';

export default function FormWithAlerts() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    // Validación
    const newErrors: string[] = [];
    if (!formData.email) {
      newErrors.push('El email es requerido');
    }
    if (!formData.password) {
      newErrors.push('La contraseña es requerida');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Usuario creado exitosamente');
      setFormData({ email: '', password: '' });
    } catch (error) {
      setErrors(['Error al crear el usuario']);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      {errors.map((error, index) => (
        <Alert key={index} variant="error">
          {error}
        </Alert>
      ))}

      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
      />

      <TextField
        label="Contraseña"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        required
      />

      <Button type="submit" variant="primary">
        Crear Cuenta
      </Button>
    </form>
  );
}
```

### Notificaciones de Estado

```tsx
import React, { useState, useEffect } from 'react';
import Alert from '@/components/Alert';

export default function StatusNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>>([]);

  // Simular recepción de notificaciones
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'success',
          message: 'Conexión establecida correctamente'
        },
        {
          id: '2',
          type: 'warning',
          message: 'La sesión expira en 5 minutos'
        }
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map(notification => (
        <Alert
          key={notification.id}
          variant={notification.type}
          className="shadow-lg cursor-pointer"
          onClick={() => dismissNotification(notification.id)}
        >
          {notification.message}
        </Alert>
      ))}
    </div>
  );
}
```

### Alertas en Contextos Específicos

```tsx
import React from 'react';
import Alert from '@/components/Alert';

export default function ContextAlerts() {
  return (
    <div className="space-y-6">
      {/* Alerta de éxito para operaciones completadas */}
      <div>
        <h3 className="text-lg font-medium mb-3">Operación Exitosa</h3>
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>El archivo se subió correctamente</span>
          </div>
        </Alert>
      </div>

      {/* Alerta informativa */}
      <div>
        <h3 className="text-lg font-medium mb-3">Información del Sistema</h3>
        <Alert variant="info">
          <div className="space-y-1">
            <p className="font-medium">Mantenimiento Programado</p>
            <p className="text-sm">El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 4:00 AM.</p>
          </div>
        </Alert>
      </div>

      {/* Alerta de advertencia */}
      <div>
        <h3 className="text-lg font-medium mb-3">Advertencia de Seguridad</h3>
        <Alert variant="warning">
          <div className="flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p className="font-medium">Contraseña Débil</p>
              <p className="text-sm">Considera cambiar tu contraseña por una más segura.</p>
            </div>
          </div>
        </Alert>
      </div>

      {/* Alerta de error */}
      <div>
        <h3 className="text-lg font-medium mb-3">Error del Sistema</h3>
        <Alert variant="error">
          <div className="space-y-2">
            <p className="font-medium">Error de Conexión</p>
            <p className="text-sm">No se pudo conectar al servidor. Verifica tu conexión a internet e intenta nuevamente.</p>
            <p className="text-xs opacity-75">Código de error: NETWORK_ERROR_503</p>
          </div>
        </Alert>
      </div>
    </div>
  );
}
```

## 🎨 Personalización

### Clases CSS Adicionales

```tsx
<Alert
  variant="success"
  className="shadow-lg border-2 animate-pulse"
>
  Alerta personalizada con animación
</Alert>
```

### Alertas con Iconos

```tsx
import React from 'react';
import Alert from '@/components/Alert';

const iconMap = {
  success: '✓',
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌'
};

export default function AlertsWithIcons() {
  return (
    <div className="space-y-4">
      {Object.entries(iconMap).map(([variant, icon]) => (
        <Alert key={variant} variant={variant as any}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span>Mensaje de {variant}</span>
          </div>
        </Alert>
      ))}
    </div>
  );
}
```

### Alertas Dismissibles

```tsx
import React, { useState } from 'react';
import Alert from '@/components/Alert';
import IconButton from '@/components/IconButton';

export default function DismissibleAlerts() {
  const [visibleAlerts, setVisibleAlerts] = useState({
    success: true,
    warning: true,
    error: true
  });

  const dismissAlert = (type: keyof typeof visibleAlerts) => {
    setVisibleAlerts(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div className="space-y-4">
      {visibleAlerts.success && (
        <Alert variant="success">
          <div className="flex items-center justify-between">
            <span>Operación completada</span>
            <IconButton
              icon="close"
              size="xs"
              variant="text"
              onClick={() => dismissAlert('success')}
              aria-label="Cerrar alerta"
            />
          </div>
        </Alert>
      )}

      {visibleAlerts.warning && (
        <Alert variant="warning">
          <div className="flex items-center justify-between">
            <span>Advertencia importante</span>
            <IconButton
              icon="close"
              size="xs"
              variant="text"
              onClick={() => dismissAlert('warning')}
              aria-label="Cerrar alerta"
            />
          </div>
        </Alert>
      )}

      {visibleAlerts.error && (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>Error del sistema</span>
            <IconButton
              icon="close"
              size="xs"
              variant="text"
              onClick={() => dismissAlert('error')}
              aria-label="Cerrar alerta"
            />
          </div>
        </Alert>
      )}
    </div>
  );
}
```

## 📱 Responsive Design

El Alert es completamente responsive:

```tsx
// Se adapta automáticamente al ancho del contenedor
<div className="w-full md:w-1/2 lg:w-1/3">
  <Alert variant="info">
    Contenido que se adapta al tamaño del contenedor
  </Alert>
</div>
```

## 🎯 Mejores Prácticas

### 1. Usa la Variante Apropiada

```tsx
// ✅ Bien - variante según el contexto
<Alert variant="success">Datos guardados correctamente</Alert>
<Alert variant="error">Error al procesar la solicitud</Alert>
<Alert variant="warning">Acción irreversible</Alert>
<Alert variant="info">Información adicional</Alert>

// ❌ Mal - variante incorrecta
<Alert variant="error">Todo está bien</Alert>
```

### 2. Mensajes Claros y Concisos

```tsx
// ✅ Bien - mensaje claro
<Alert variant="error">
  La contraseña debe tener al menos 8 caracteres
</Alert>

// ❌ Mal - mensaje confuso
<Alert variant="error">
  Error 422
</Alert>
```

### 3. Posicionamiento Estratégico

```tsx
// ✅ Bien - alertas en lugares visibles
<div className="space-y-4">
  {/* Alertas al inicio del formulario */}
  {errors.map(error => (
    <Alert key={error} variant="error">{error}</Alert>
  ))}

  {/* Formulario */}
  <form>...</form>
</div>

// ✅ Bien - notificaciones flotantes
<div className="fixed top-4 right-4 space-y-2 z-50">
  {notifications.map(notification => (
    <Alert key={notification.id} variant={notification.type}>
      {notification.message}
    </Alert>
  ))}
</div>
```

### 4. Manejo de Múltiples Alertas

```tsx
// ✅ Bien - lista de errores
{errors.length > 0 && (
  <div className="space-y-2">
    {errors.map((error, index) => (
      <Alert key={index} variant="error">
        {error}
      </Alert>
    ))}
  </div>
)}

// ✅ Bien - alerta única con lista
{errors.length > 0 && (
  <Alert variant="error">
    <ul className="list-disc list-inside space-y-1">
      {errors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  </Alert>
)}
```

### 5. Estados Temporales

```tsx
// ✅ Bien - alertas que desaparecen automáticamente
const [showSuccess, setShowSuccess] = useState(false);

const handleSave = async () => {
  try {
    await saveData();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Desaparece en 3 segundos
  } catch (error) {
    // Mostrar error
  }
};

{showSuccess && (
  <Alert variant="success">
    Cambios guardados exitosamente
  </Alert>
)}
```

## 🐛 Solución de Problemas

### Problema: La alerta no aparece

```tsx
// Asegúrate de que children tenga contenido
<Alert variant="success">
  Este mensaje aparecerá
</Alert>

// ❌ Incorrecto - sin children
<Alert variant="success" />
```

### Problema: Variante no funciona

```tsx
// Asegúrate de usar una variante válida
<Alert variant="success">Mensaje</Alert> // ✅ Correcto

// ❌ Incorrecto - variante inválida
<Alert variant="primary">Mensaje</Alert>
```

### Problema: Estilos no se aplican

```tsx
// Los estilos usan CSS classes específicas
// Asegúrate de que las clases CSS estén definidas:
// .alert-success, .alert-info, .alert-warning, .alert-error

<Alert variant="success" className="custom-class">
  Alerta con clase adicional
</Alert>
```

### Problema: Accesibilidad comprometida

```tsx
// El componente incluye automáticamente role="alert"
// Para testing, usa dataTestId
<Alert
  variant="error"
  dataTestId="error-alert"
>
  Mensaje de error
</Alert>
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/Alert/page.tsx` - Showcase completo con todas las variantes
- `app/components/BaseForm/` - Ejemplos de uso en validaciones de formulario

## 🤝 Contribución

Para contribuir al componente Alert:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevas variantes siguiendo el patrón de colores
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que la accesibilidad se mantenga en todas las modificaciones</content>
<parameter name="filePath">/Users/felipe/dev/DSP-App/app/components/Alert/README.md