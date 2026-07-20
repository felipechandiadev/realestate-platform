# Card Component

Un componente de tarjeta versátil y flexible con áreas dedicadas para contenido superior, contenido principal y acciones, ideal para mostrar información estructurada de manera elegante.

## 🚀 Características Principales

- ✅ **Tres Áreas Definidas**: Top area, content area, actions area
- ✅ **Altura Configurable**: Control total sobre las dimensiones
- ✅ **Layout Flexible**: Sistema de áreas proporcionales
- ✅ **Responsive**: Diseño adaptativo
- ✅ **TypeScript**: Completamente tipado
- ✅ **Data Test IDs**: Soporte para testing automatizado
- ✅ **Overflow Management**: Manejo automático de contenido largo

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import Card from '@/components/Card';
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import Card from '@/components/Card';
import { Button } from '@/components/Button';

export default function BasicCard() {
  return (
    <div className="w-80">
      <Card
        height="300px"
        topArea={
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">Logo</span>
          </div>
        }
        content={
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Título de la Tarjeta</h3>
            <p className="text-gray-600 text-sm">
              Descripción breve del contenido de esta tarjeta.
            </p>
          </div>
        }
        actionsArea={
          <Button variant="primary" size="sm">
            Acción
          </Button>
        }
      />
    </div>
  );
}
```

## 🔧 API Reference

### Props del Card

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `height` | `string \| number` | `"20rem"` | Altura total de la tarjeta |
| `topArea` | `React.ReactNode` | `undefined` | Contenido del área superior |
| `topAreaHeight` | `string \| number` | `"40%"` | Altura del área superior |
| `content` | `React.ReactNode` | `undefined` | Contenido principal de la tarjeta |
| `actionsArea` | `React.ReactNode` | `undefined` | Área de acciones/botones |
| `className` | `string` | `""` | Clases CSS adicionales |
| `dataTestId` | `string` | `undefined` | ID para testing |

## 📏 Sistema de Áreas

### Área Superior (Top Area)

```tsx
<Card
  topArea={
    <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
      <img src="/logo.png" alt="Logo" className="w-16 h-16" />
    </div>
  }
  topAreaHeight="120px"  // Altura fija
  // ... otros props
/>
```

### Área de Contenido (Content Area)

```tsx
<Card
  content={
    <div className="text-center space-y-3">
      <h3 className="text-xl font-bold">Producto Premium</h3>
      <p className="text-gray-600">
        Este producto ofrece las mejores características del mercado.
      </p>
      <div className="text-2xl font-bold text-green-600">$99.99</div>
    </div>
  }
  // ... otros props
/>
```

### Área de Acciones (Actions Area)

```tsx
<Card
  actionsArea={
    <div className="flex gap-2 w-full">
      <Button variant="outlined" size="sm" className="flex-1">
        Ver Detalles
      </Button>
      <Button variant="primary" size="sm" className="flex-1">
        Comprar Ahora
      </Button>
    </div>
  }
  // ... otros props
/>
```

## 📏 Control de Dimensiones

### Altura Total de la Tarjeta

```tsx
// Altura fija en píxeles
<Card height="300px" />

// Altura fija en rem
<Card height="20rem" />

// Altura como número (píxeles)
<Card height={320} />

// Altura responsiva con Tailwind
<Card height="h-80" className="md:h-96" />
```

### Altura del Área Superior

```tsx
// Porcentaje del total
<Card topAreaHeight="30%" />

// Altura fija en píxeles
<Card topAreaHeight="100px" />

// Altura fija en rem
<Card topAreaHeight="6rem" />

// Como número (píxeles)
<Card topAreaHeight={120} />
```

## 🎯 Casos de Uso Comunes

### Tarjeta de Producto

```tsx
import React from 'react';
import Card from '@/components/Card';
import { Button } from '@/components/Button';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card
      height="400px"
      className="shadow-lg hover:shadow-xl transition-shadow"
      topArea={
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      }
      topAreaHeight="60%"
      content={
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          <div className="text-xl font-bold text-green-600">
            ${product.price}
          </div>
        </div>
      }
      actionsArea={
        <div className="flex gap-2 w-full">
          <Button variant="outlined" size="sm" className="flex-1">
            Ver Detalles
          </Button>
          <Button variant="primary" size="sm" className="flex-1">
            Agregar al Carrito
          </Button>
        </div>
      }
    />
  );
}
```

### Tarjeta de Usuario

```tsx
import React from 'react';
import Card from '@/components/Card';
import { Button } from '@/components/Button';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export default function UserCard({ user }: { user: User }) {
  return (
    <Card
      height="280px"
      className="shadow-md"
      topArea={
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full border-4 border-white mb-2"
          />
          <h3 className="text-lg font-semibold">{user.name}</h3>
        </div>
      }
      topAreaHeight="70%"
      content={
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-600">{user.email}</p>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {user.role}
          </span>
        </div>
      }
      actionsArea={
        <Button variant="primary" size="sm">
          Ver Perfil
        </Button>
      }
    />
  );
}
```

### Tarjeta de Estadísticas

```tsx
import React from 'react';
import Card from '@/components/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: string;
  color: string;
}

export default function StatCard({ title, value, change, icon, color }: StatCardProps) {
  return (
    <Card
      height="160px"
      className="shadow-sm"
      topArea={
        <div className="w-full h-full flex items-center justify-between p-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className="text-2xl font-bold">{value}</div>
            <div className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-white">
              {icon}
            </span>
          </div>
        </div>
      }
      topAreaHeight="100%"
    />
  );
}

// Uso
<StatCard
  title="Ventas Totales"
  value="$45,231"
  change="+20.1%"
  icon="trending_up"
  color="bg-green-500"
/>
```

### Tarjeta de Proyecto

```tsx
import React from 'react';
import Card from '@/components/Card';
import { Button } from '@/components/Button';

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  dueDate: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <Card
      height="320px"
      className="shadow-md"
      topArea={
        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 flex flex-col justify-end p-4 text-white">
          <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
          <span className={`inline-block px-2 py-1 text-xs rounded-full self-start ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>
      }
      topAreaHeight="50%"
      content={
        <div className="space-y-3 w-full px-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Fecha límite: {project.dueDate}
          </div>
        </div>
      }
      actionsArea={
        <div className="flex gap-2">
          <Button variant="outlined" size="sm">
            Editar
          </Button>
          <Button variant="primary" size="sm">
            Ver Detalles
          </Button>
        </div>
      }
    />
  );
}
```

## 🎨 Personalización

### Estilos y Themes

```tsx
// Tarjeta con tema oscuro
<Card
  className="bg-gray-800 border-gray-700 text-white"
  topArea={<div className="bg-gray-700">...</div>}
  // ...
/>

// Tarjeta con bordes redondeados personalizados
<Card
  className="rounded-xl shadow-2xl"
  // ...
/>

// Tarjeta compacta
<Card
  height="200px"
  topAreaHeight="30%"
  className="shadow-sm"
/>
```

### Contenido Complejo en Áreas

```tsx
<Card
  height="500px"
  topArea={
    <div className="relative w-full h-full">
      <img src="/hero-image.jpg" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 flex items-end p-4">
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-1">Título Destacado</h2>
          <p className="text-sm opacity-90">Subtítulo descriptivo</p>
        </div>
      </div>
    </div>
  }
  topAreaHeight="60%"
  content={
    <div className="space-y-4 w-full max-w-md">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">1.2K</div>
          <div className="text-sm text-gray-600">Seguidores</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">89</div>
          <div className="text-sm text-gray-600">Proyectos</div>
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
  }
  actionsArea={
    <div className="flex gap-3 w-full">
      <Button variant="outlined" className="flex-1">
        Seguir
      </Button>
      <Button variant="primary" className="flex-1">
        Contactar
      </Button>
    </div>
  }
/>
```

## 📱 Responsive Design

El Card es completamente responsive:

```tsx
// Grid responsivo de tarjetas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card
    height="300px"
    className="w-full"
    // ... props
  />
  <Card
    height="300px"
    className="w-full"
    // ... props
  />
  <Card
    height="300px"
    className="w-full"
    // ... props
  />
</div>

// Altura responsiva
<Card
  height="250px"
  className="md:h-80 lg:h-96"
  topAreaHeight="40%"
  // ... props
/>
```

## 🎯 Mejores Prácticas

### 1. Mantén Proporciones Consistentes

```tsx
// ✅ Bien - proporciones similares en tarjetas relacionadas
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card height="320px" topAreaHeight="50%" />
  <Card height="320px" topAreaHeight="50%" />
  <Card height="320px" topAreaHeight="50%" />
</div>

// ❌ Mal - proporciones inconsistentes
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card height="300px" topAreaHeight="40%" />
  <Card height="350px" topAreaHeight="60%" />
  <Card height="280px" topAreaHeight="30%" />
</div>
```

### 2. Usa Áreas Apropiadamente

```tsx
// ✅ Bien - contenido visual en topArea
<Card
  topArea={<img src="/product.jpg" />}
  content={<ProductInfo />}
  actionsArea={<BuyButton />}
/>

// ✅ Bien - información clave en content
<Card
  topArea={<UserAvatar />}
  content={<UserDetails />}
  actionsArea={<ActionButtons />}
/>
```

### 3. Gestiona Overflow

```tsx
// ✅ Bien - controla contenido largo
<Card
  content={
    <div className="overflow-hidden">
      <h3 className="truncate">Título muy largo que se corta</h3>
      <p className="line-clamp-3">Descripción larga que se limita a 3 líneas...</p>
    </div>
  }
/>
```

### 4. Accesibilidad

```tsx
// ✅ Bien - usa dataTestId para testing
<Card
  dataTestId="product-card-123"
  topArea={<img alt="Producto XYZ" />}
  content={<h3>Producto XYZ</h3>}
  actionsArea={<button>Añadir al carrito</button>}
/>
```

## 🐛 Solución de Problemas

### Problema: Las áreas no se muestran correctamente

```tsx
// Asegúrate de que las áreas tengan contenido
<Card
  topArea={<div>Contenido superior</div>}  // ✅ Correcto
  content={<div>Contenido principal</div>} // ✅ Correcto
  actionsArea={<button>Acción</button>}    // ✅ Correcto
/>

// ❌ Incorrecto - áreas vacías
<Card /> // No se mostrará nada
```

### Problema: Altura no funciona

```tsx
// Usa valores válidos para height
<Card height="300px" />     // ✅ Correcto
<Card height="20rem" />     // ✅ Correcto
<Card height={300} />       // ✅ Correcto

// ❌ Incorrecto
<Card height="auto" />      // No funcionará bien con flex
<Card height="100%" />      // Depende del contenedor
```

### Problema: Contenido se desborda

```tsx
// Controla el contenido en cada área
<Card
  content={
    <div className="overflow-y-auto max-h-full">
      {/* Contenido que puede ser largo */}
    </div>
  }
/>
```

### Problema: Área superior no ocupa todo el espacio

```tsx
// El topArea se expande para ocupar topAreaHeight
<Card
  topAreaHeight="50%"
  topArea={
    <div className="w-full h-full flex items-center justify-center">
      {/* Este div ocupará el 50% de la altura total */}
    </div>
  }
/>
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/Card/page.tsx` - Showcase completo con diferentes tipos de tarjetas
- `app/components/DataGrid/` - Ejemplos de tarjetas en layouts de grid

## 🤝 Contribución

Para contribuir al componente Card:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevas opciones de layout manteniendo la simplicidad
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que el responsive design se mantenga en todas las modificaciones</content>
<parameter name="filePath">/Users/felipe/dev/DSP-App/app/components/Card/README.md