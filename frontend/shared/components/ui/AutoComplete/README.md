# AutoComplete Component

Componente de autocompletado avanzado con filtrado en tiempo real, navegación por teclado completa, validación integrada y soporte para tipos de datos genéricos. Ideal para formularios donde los usuarios necesitan seleccionar de una lista de opciones con capacidad de búsqueda.

## 🚀 Características Principales

- ✅ **Autocompletado Inteligente**: Filtrado en tiempo real mientras escribes
- ✅ **Navegación por Teclado**: Soporte completo para Arrow keys, Enter, Escape
- ✅ **Validación Integrada**: Mensajes de error y estados de validación
- ✅ **Tipos Genéricos**: Soporte para cualquier tipo de dato con funciones customizables
- ✅ **Accesibilidad**: Labels ARIA, navegación por teclado y lectores de pantalla
- ✅ **TypeScript**: Completamente tipado con interfaces genéricas
- ✅ **Data Test IDs**: Soporte completo para testing automatizado
- ✅ **Responsive**: Diseño adaptativo que funciona en todos los dispositivos

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import AutoComplete from '@/components/AutoComplete/AutoComplete';
```

## 🎯 Uso Básico

```tsx
import React, { useState } from 'react';
import AutoComplete from '@/components/AutoComplete/AutoComplete';

interface Country {
  id: number;
  label: string;
  code: string;
}

export default function BasicAutoComplete() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const countries: Country[] = [
    { id: 1, label: 'Estados Unidos', code: 'US' },
    { id: 2, label: 'México', code: 'MX' },
    { id: 3, label: 'Canadá', code: 'CA' },
    { id: 4, label: 'Argentina', code: 'AR' },
    { id: 5, label: 'Chile', code: 'CL' },
  ];

  return (
    <div className="p-6 max-w-md">
      <AutoComplete
        options={countries}
        label="País"
        placeholder="Selecciona un país"
        value={selectedCountry}
        onChange={setSelectedCountry}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.id}
      />

      {selectedCountry && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            País seleccionado: {selectedCountry.label} ({selectedCountry.code})
          </p>
        </div>
      )}
    </div>
  );
}
```

## 🔧 API Reference

### Props del AutoComplete

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `options` | `T[]` | - | Array de opciones para autocompletar |
| `label` | `string` | - | Label del campo |
| `placeholder` | `string` | - | Placeholder cuando no hay label |
| `value` | `T \| null` | `null` | Valor seleccionado actualmente |
| `onChange` | `(option: T \| null) => void` | - | Callback cuando cambia la selección |
| `name` | `string` | - | Nombre del campo para formularios |
| `required` | `boolean` | `false` | Si el campo es requerido |
| `getOptionLabel` | `(option: T) => string` | Auto | Función para obtener el label de una opción |
| `getOptionValue` | `(option: T) => any` | Auto | Función para obtener el valor de una opción |
| `data-test-id` | `string` | `"auto-complete-root"` | ID para testing |

### Interface Option

```tsx
interface Option {
  id: number;
  label: string;
}
```

## 🎯 Casos de Uso Comunes

### Búsqueda de Usuarios

```tsx
import React, { useState, useEffect } from 'react';
import AutoComplete from '@/components/AutoComplete/AutoComplete';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export default function UserSearch() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Simular carga de usuarios
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
        { id: 2, name: 'María García', email: 'maria@example.com' },
        { id: 3, name: 'Carlos López', email: 'carlos@example.com' },
        { id: 4, name: 'Ana Rodríguez', email: 'ana@example.com' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Asignar Usuario</h3>

      <AutoComplete
        options={users}
        label="Usuario"
        placeholder="Buscar usuario..."
        value={selectedUser}
        onChange={setSelectedUser}
        getOptionLabel={(user) => `${user.name} (${user.email})`}
        getOptionValue={(user) => user.id}
        required
      />

      {selectedUser && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            {selectedUser.avatar && (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-green-800">{selectedUser.name}</p>
              <p className="text-sm text-green-600">{selectedUser.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Selección de Productos

```tsx
import React, { useState } from 'react';
import AutoComplete from '@/components/AutoComplete/AutoComplete';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

export default function ProductSelector() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products: Product[] = [
    { id: 1, name: 'Laptop Dell XPS 13', category: 'Computadoras', price: 1299, inStock: true },
    { id: 2, name: 'iPhone 15 Pro', category: 'Teléfonos', price: 999, inStock: true },
    { id: 3, name: 'Samsung Galaxy S24', category: 'Teléfonos', price: 899, inStock: false },
    { id: 4, name: 'MacBook Air M3', category: 'Computadoras', price: 1099, inStock: true },
    { id: 5, name: 'iPad Pro 12.9"', category: 'Tablets', price: 1099, inStock: true },
  ];

  return (
    <div className="p-6 max-w-lg">
      <h3 className="text-lg font-semibold mb-4">Seleccionar Producto</h3>

      <AutoComplete
        options={products}
        label="Producto"
        placeholder="Buscar producto..."
        value={selectedProduct}
        onChange={setSelectedProduct}
        getOptionLabel={(product) =>
          `${product.name} - $${product.price} ${product.inStock ? '✓' : '✗'}`
        }
        getOptionValue={(product) => product.id}
      />

      {selectedProduct && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold">{selectedProduct.name}</h4>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Categoría: {selectedProduct.category}</p>
            <p>Precio: ${selectedProduct.price}</p>
            <p className={selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}>
              {selectedProduct.inStock ? 'En stock' : 'Agotado'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Búsqueda de Ciudades

```tsx
import React, { useState, useMemo } from 'react';
import AutoComplete from '@/components/AutoComplete/AutoComplete';

interface City {
  id: number;
  name: string;
  country: string;
  population: number;
}

export default function CitySearch() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const cities: City[] = useMemo(() => [
    { id: 1, name: 'Nueva York', country: 'Estados Unidos', population: 8500000 },
    { id: 2, name: 'Los Ángeles', country: 'Estados Unidos', population: 4000000 },
    { id: 3, name: 'Chicago', country: 'Estados Unidos', population: 2700000 },
    { id: 4, name: 'Ciudad de México', country: 'México', population: 9200000 },
    { id: 5, name: 'Guadalajara', country: 'México', population: 1500000 },
    { id: 6, name: 'Santiago', country: 'Chile', population: 6200000 },
    { id: 7, name: 'Buenos Aires', country: 'Argentina', population: 2900000 },
    { id: 8, name: 'Bogotá', country: 'Colombia', population: 7100000 },
  ], []);

  return (
    <div className="p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Buscar Ciudad</h3>

      <AutoComplete
        options={cities}
        label="Ciudad"
        placeholder="Escribe el nombre de una ciudad"
        value={selectedCity}
        onChange={setSelectedCity}
        getOptionLabel={(city) => `${city.name}, ${city.country}`}
        getOptionValue={(city) => city.id}
      />

      {selectedCity && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900">{selectedCity.name}</h4>
          <div className="mt-2 text-sm text-blue-700">
            <p>País: {selectedCity.country}</p>
            <p>Población: {selectedCity.population.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Formulario de Registro con AutoComplete

```tsx
import React, { useState } from 'react';
import AutoComplete from '@/components/AutoComplete/AutoComplete';
import Button from '@/components/Button/Button';

interface Department {
  id: number;
  name: string;
  code: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: null as Department | null,
  });

  const departments: Department[] = [
    { id: 1, name: 'Recursos Humanos', code: 'HR' },
    { id: 2, name: 'Tecnología', code: 'IT' },
    { id: 3, name: 'Ventas', code: 'SALES' },
    { id: 4, name: 'Marketing', code: 'MKT' },
    { id: 5, name: 'Finanzas', code: 'FIN' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Submit logic here
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md space-y-4">
      <h3 className="text-xl font-semibold">Registro de Empleado</h3>

      <div>
        <input
          type="text"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-3 border rounded"
          required
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-3 border rounded"
          required
        />
      </div>

      <AutoComplete
        options={departments}
        label="Departamento"
        placeholder="Selecciona un departamento"
        value={formData.department}
        onChange={(dept) => setFormData(prev => ({ ...prev, department: dept }))}
        getOptionLabel={(dept) => dept.name}
        getOptionValue={(dept) => dept.id}
        required
      />

      <Button type="submit" className="w-full">
        Registrar Empleado
      </Button>
    </form>
  );
}
```

### AutoComplete con API

```tsx
import React, { useState, useEffect, useMemo } from 'react';
import AutoComplete from '@/components/AutoComplete/AutoComplete';
import DotProgress from '@/features/shared/ui/DotProgress/DotProgress';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
}

export default function GitHubRepoSearch() {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setRepos([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10`
        );
        const data = await response.json();
        setRepos(data.items || []);
      } catch (error) {
        console.error('Error fetching repos:', error);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const options = useMemo(() =>
    repos.map(repo => ({
      ...repo,
      label: `${repo.full_name} (${repo.stargazers_count} ⭐)`
    })),
    [repos]
  );

  return (
    <div className="p-6 max-w-lg">
      <h3 className="text-lg font-semibold mb-4">Buscar Repositorios de GitHub</h3>

      <div className="relative">
        <AutoComplete
          options={options}
          label="Repositorio"
          placeholder="Buscar repositorios..."
          value={selectedRepo}
          onChange={(repo) => {
            setSelectedRepo(repo);
            if (repo) setQuery(repo.name);
          }}
          getOptionLabel={(repo) => repo.label}
          getOptionValue={(repo) => repo.id}
        />

        {loading && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <DotProgress size={16} />
          </div>
        )}
      </div>

      {selectedRepo && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold">{selectedRepo.full_name}</h4>
          {selectedRepo.description && (
            <p className="text-sm text-gray-600 mt-1">{selectedRepo.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>⭐ {selectedRepo.stargazers_count}</span>
            <a
              href={`https://github.com/${selectedRepo.full_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              Ver en GitHub →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🎨 Personalización

### Funciones Customizables

```tsx
// AutoComplete con funciones personalizadas
const CustomAutoComplete = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const complexOptions = [
    { id: 1, title: 'Proyecto Alpha', status: 'active', priority: 'high' },
    { id: 2, title: 'Proyecto Beta', status: 'pending', priority: 'medium' },
    { id: 3, title: 'Proyecto Gamma', status: 'completed', priority: 'low' },
  ];

  return (
    <AutoComplete
      options={complexOptions}
      label="Proyecto"
      placeholder="Buscar proyecto..."
      value={selectedItem}
      onChange={setSelectedItem}
      // Función personalizada para el label
      getOptionLabel={(option) => {
        const statusEmoji = {
          active: '🟢',
          pending: '🟡',
          completed: '✅'
        };
        const priorityEmoji = {
          high: '🔴',
          medium: '🟡',
          low: '🟢'
        };
        return `${statusEmoji[option.status]} ${option.title} (${priorityEmoji[option.priority]})`;
      }}
      // Función personalizada para el valor
      getOptionValue={(option) => option.id}
    />
  );
};
```

### Estilos Personalizados

```tsx
// AutoComplete con estilos personalizados
const StyledAutoComplete = () => {
  return (
    <div className="custom-autocomplete">
      <style jsx>{`
        .custom-autocomplete [data-test-id="auto-complete-input"] {
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          padding: 12px 16px;
          font-size: 16px;
        }

        .custom-autocomplete [data-test-id="auto-complete-input"]:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .custom-autocomplete [data-test-id="auto-complete-label"] {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
        }
      `}</style>

      <AutoComplete
        options={countries}
        label="País"
        placeholder="Selecciona tu país"
        value={selectedCountry}
        onChange={setSelectedCountry}
        getOptionLabel={(country) => country.name}
        getOptionValue={(country) => country.id}
      />
    </div>
  );
};
```

### Tema Oscuro

```tsx
// AutoComplete con tema oscuro
const DarkAutoComplete = () => {
  return (
    <div className="dark-theme p-6 bg-gray-900 min-h-screen">
      <AutoComplete
        options={options}
        label="Opción"
        placeholder="Buscar opción..."
        value={selectedOption}
        onChange={setSelectedOption}
        getOptionLabel={(opt) => opt.label}
        getOptionValue={(opt) => opt.id}
      />

      <style jsx global>{`
        .dark-theme {
          --color-background: #1f2937;
          --color-primary: #8b5cf6;
          --color-border: #374151;
          --color-foreground: #f9fafb;
        }

        .dark-theme [data-test-id="auto-complete-list"] li {
          background-color: #1f2937;
          color: #f9fafb;
        }

        .dark-theme [data-test-id="auto-complete-list"] li:hover {
          background-color: #374151;
        }
      `}</style>
    </div>
  );
};
```

## 📱 Responsive Design

El AutoComplete es completamente responsive:

```tsx
// Diseño responsive automático
<AutoComplete
  options={options}
  label="Selección"
  placeholder="Buscar..."
  value={selected}
  onChange={setSelected}
/>

// En diferentes tamaños de pantalla
<div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
  <AutoComplete
    options={largeOptions}
    label="Opción Grande"
    placeholder="Buscar en lista grande..."
    value={selected}
    onChange={setSelected}
  />
</div>

// En formularios móviles
<div className="px-4 sm:px-6">
  <AutoComplete
    options={mobileOptions}
    label="Selección Móvil"
    placeholder="Toca para buscar..."
    value={selected}
    onChange={setSelected}
  />
</div>
```

## 🎯 Mejores Prácticas

### 1. Datos Eficientes

```tsx
// ✅ Bien - opciones con IDs únicos
const options = [
  { id: 1, label: 'Opción 1' },
  { id: 2, label: 'Opción 2' },
  // ...
];

// ✅ Bien - usar useMemo para listas grandes
const memoizedOptions = useMemo(() =>
  largeData.map(item => ({
    id: item.id,
    label: item.name,
  })), [largeData]
);

// ❌ Mal - arrays sin IDs consistentes
const badOptions = [
  'Opción 1', // Sin ID
  'Opción 2', // Sin ID
];
```

### 2. Funciones de Label/Value

```tsx
// ✅ Bien - funciones claras y eficientes
<AutoComplete
  options={users}
  getOptionLabel={(user) => `${user.firstName} ${user.lastName}`}
  getOptionValue={(user) => user.id}
/>

// ✅ Bien - memoizar funciones si es necesario
const getOptionLabel = useCallback((option) =>
  `${option.name} - ${option.category}`, []
);

const getOptionValue = useCallback((option) => option.id, []);

// ❌ Mal - funciones complejas en cada render
<AutoComplete
  options={options}
  getOptionLabel={(option) => {
    // Lógica compleja aquí se ejecuta en cada render
    return expensiveComputation(option);
  }}
/>
```

### 3. Manejo de Estado

```tsx
// ✅ Bien - estado consistente
const [selectedOption, setSelectedOption] = useState(null);
const [inputValue, setInputValue] = useState('');

// El componente maneja inputValue internamente
<AutoComplete
  value={selectedOption}
  onChange={setSelectedOption}
/>

// ✅ Bien - reset controlado
const handleReset = () => {
  setSelectedOption(null);
};

// ❌ Mal - manipular estado interno directamente
const badReset = () => {
  // No manipules el estado interno del componente
  setInputValue(''); // ❌
};
```

### 4. Validación

```tsx
// ✅ Bien - validación externa
const [errors, setErrors] = useState({});

const validateSelection = (value) => {
  if (!value && required) {
    setErrors(prev => ({ ...prev, selection: 'Este campo es requerido' }));
  } else {
    setErrors(prev => ({ ...prev, selection: undefined }));
  }
};

<AutoComplete
  value={selectedOption}
  onChange={(value) => {
    setSelectedOption(value);
    validateSelection(value);
  }}
  required
/>

{errors.selection && (
  <p className="text-red-500 text-sm mt-1">{errors.selection}</p>
)}
```

### 5. Performance con Datos Grandes

```tsx
// ✅ Bien - paginación virtual para listas grandes
const VirtualizedAutoComplete = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Filtrar en el servidor
  const filteredOptions = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return searchOnServer(searchTerm, page);
  }, [searchTerm, page]);

  return (
    <AutoComplete
      options={filteredOptions}
      value={selected}
      onChange={setSelected}
      // El componente maneja el filtrado local de las opciones proporcionadas
    />
  );
};

// ✅ Bien - debounce para búsquedas
const DebouncedAutoComplete = () => {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Usar debouncedQuery para la búsqueda
};
```

## 🐛 Solución de Problemas

### Problema: Las opciones no se filtran correctamente

```tsx
// Verifica que getOptionLabel devuelva string
<AutoComplete
  options={options}
  getOptionLabel={(option) => {
    // ✅ Bien - devolver string
    return option.name || '';
  }}
  // ❌ Mal - devolver undefined o null
  getOptionLabel={(option) => option.name} // Puede ser undefined
/>

// Verifica que las opciones sean consistentes
const options = [
  { id: 1, name: 'Opción 1' }, // ✅
  { id: 2, name: 'Opción 2' }, // ✅
  // ❌ Mal - mezcla de tipos
  'Opción 3', // String
];
```

### Problema: La navegación por teclado no funciona

```tsx
// Verifica que el input tenga foco
// El componente maneja automáticamente la navegación cuando está focused

// Para debugging, agrega logs
<AutoComplete
  options={options}
  onChange={(value) => {
    console.log('Selected:', value);
  }}
  // El componente debería responder a:
  // - Arrow Down/Up: navegar opciones
  // - Enter: seleccionar opción resaltada
  // - Escape: cerrar dropdown
/>
```

### Problema: El dropdown no se abre

```tsx
// Verifica que haya opciones filtradas
const filteredOptions = options.filter(opt =>
  opt.label.toLowerCase().includes(inputValue.toLowerCase())
);

console.log('Filtered options:', filteredOptions); // Debe tener elementos

// Verifica que el estado open sea true
// El componente abre automáticamente cuando:
// 1. El input tiene foco
// 2. Hay texto en el input
// 3. Hay opciones filtradas
```

### Problema: La selección no se actualiza

```tsx
// ✅ Bien - usar onChange correctamente
const [selected, setSelected] = useState(null);

<AutoComplete
  value={selected}
  onChange={(newValue) => {
    console.log('New value:', newValue);
    setSelected(newValue);
  }}
/>

// Verifica que el valor sea consistente con getOptionValue
<AutoComplete
  options={options}
  value={selected}
  onChange={setSelected}
  getOptionValue={(option) => option.id} // Asegúrate de que selected tenga esta estructura
/>
```

### Problema: El label no se muestra correctamente

```tsx
// Verifica el shrink behavior
// El label se encoge cuando:
// 1. El input tiene foco
// 2. Hay texto en el input

// Para debugging
const shrink = focused || inputValue.length > 0;
console.log('Shrink:', shrink, 'Focused:', focused, 'Input:', inputValue);

// Verifica que el label tenga posición absoluta
<label className="absolute left-3 top-0 ...">
// ✅ Correcto - positioned absolutely
```

### Problema: Conflictos con otros event listeners

```tsx
// Si hay problemas con navegación por teclado,
// verifica que no haya otros event listeners globales

// El componente usa document.addEventListener('keydown', ...)
// Asegúrate de que otros componentes no interfieran

// Solución: usar stopPropagation si es necesario
const handleKeyDown = (e) => {
  if (someCondition) {
    e.stopPropagation(); // Prevenir que otros listeners interfieran
  }
};
```

### Problema: Performance con listas grandes

```tsx
// Para listas > 1000 elementos, considera:

// 1. Filtrado en el servidor
const ServerFilteredAutoComplete = () => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (query.length > 2) {
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(setOptions);
    }
  }, [query]);

  return (
    <AutoComplete
      options={options}
      // ... otras props
    />
  );
};

// 2. Virtualización (si es necesario)
import { FixedSizeList as List } from 'react-window';

// Implementar lista virtualizada en el dropdown
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/AutoComplete/AutoComplete.tsx` - Implementación completa
- `app/components/DropdownList/DropdownList.tsx` - Componente relacionado
- `app/components/BaseForm/BaseForm.tsx` - Integración con formularios

## 🤝 Contribución

Para contribuir al componente AutoComplete:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevas funcionalidades manteniendo la navegación por teclado
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que la accesibilidad se mantenga en todas las adiciones
6. Prueba el componente con diferentes tipos de datos y escenarios edge case
7. Considera el impacto en performance de nuevas funcionalidades