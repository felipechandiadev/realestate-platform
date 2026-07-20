# TopBar Component

Componente de barra superior responsiva con logo, título, navegación móvil y integración completa con sidebar. Diseñado para aplicaciones web modernas con navegación intuitiva.

## 🚀 Características Principales

- ✅ **Responsive**: Diseño adaptativo para desktop y móvil
- ✅ **Navegación Móvil**: Sidebar integrada con overlay
- ✅ **Logo Personalizable**: Soporte para logos personalizados o por defecto
- ✅ **Accesibilidad**: Labels ARIA y navegación por teclado
- ✅ **TypeScript**: Completamente tipado con interfaces claras
- ✅ **Data Test IDs**: Soporte completo para testing automatizado
- ✅ **Animaciones**: Transiciones suaves y estados hover
- ✅ **Tema Consistente**: Integración con sistema de diseño

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import TopBar from '@/components/TopBar/TopBar';
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import TopBar from '@/components/TopBar/TopBar';
import MySidebar from './MySidebar'; // Tu componente de sidebar

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <TopBar
        title="DSPM-App"
        logoSrc="/logo.svg"
        SideBarComponent={MySidebar}
      />

      {/* Contenido principal con padding top para la TopBar fija */}
      <main className="pt-16">
        <h1>Contenido de la aplicación</h1>
      </main>
    </div>
  );
}
```

## 🔧 API Reference

### Props del TopBar

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | `"title"` | Título que se muestra en la barra |
| `logoSrc` | `string` | - | URL de la imagen del logo (opcional) |
| `className` | `string` | `""` | Clases CSS adicionales |
| `SideBarComponent` | `React.ComponentType<{ onClose: () => void }>` | - | Componente de sidebar para navegación móvil |

## 🎯 Casos de Uso Comunes

### Layout de Aplicación Principal

```tsx
import React from 'react';
import TopBar from '@/components/TopBar/TopBar';
import Sidebar from '@/components/Sidebar/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TopBar fija en la parte superior */}
      <TopBar
        title="DSPM-App"
        logoSrc="/logo.svg"
        SideBarComponent={Sidebar}
      />

      {/* Contenido principal */}
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### Dashboard con Navegación

```tsx
import React, { useState } from 'react';
import TopBar from '@/components/TopBar/TopBar';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout() {
  const [currentView, setCurrentView] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar
        title="Dashboard DSPM"
        logoSrc="/dashboard-logo.svg"
        SideBarComponent={DashboardSidebar}
      />

      <div className="pt-16 flex">
        {/* Sidebar desktop (siempre visible en desktop) */}
        <div className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
          <DashboardSidebar onClose={() => {}} />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          {currentView === 'overview' && <OverviewPanel />}
          {currentView === 'reports' && <ReportsPanel />}
          {currentView === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
```

### Aplicación Móvil-First

```tsx
import React from 'react';
import TopBar from '@/components/TopBar/TopBar';
import MobileSidebar from './MobileSidebar';

export default function MobileApp() {
  return (
    <div className="min-h-screen bg-white">
      {/* TopBar con navegación móvil */}
      <TopBar
        title="DSPM Mobile"
        logoSrc="/mobile-logo.svg"
        SideBarComponent={MobileSidebar}
      />

      {/* Contenido optimizado para móvil */}
      <main className="pt-16 px-4 pb-20">
        <div className="space-y-6">
          <WelcomeCard />
          <QuickActions />
          <RecentActivity />
        </div>
      </main>

      {/* Bottom navigation para apps móviles */}
      <BottomNav />
    </div>
  );
}
```

### Admin Panel

```tsx
import React from 'react';
import TopBar from '@/components/TopBar/TopBar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        title="Panel de Administración"
        logoSrc="/admin-logo.svg"
        SideBarComponent={AdminSidebar}
        className="bg-red-600" // Tema especial para admin
      />

      <div className="pt-16 flex">
        {/* Sidebar con opciones de admin */}
        <div className="hidden lg:block w-64 bg-white shadow-lg min-h-screen border-r">
          <AdminSidebar onClose={() => {}} />
        </div>

        {/* Área de trabajo del admin */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UserManagementCard />
            <SystemSettingsCard />
            <ReportsCard />
            <AuditLogsCard />
          </div>
        </main>
      </div>
    </div>
  );
}
```

### E-commerce Header

```tsx
import React, { useState } from 'react';
import TopBar from '@/components/TopBar/TopBar';
import ShopSidebar from './ShopSidebar';

export default function EcommerceLayout() {
  const [cartItems, setCartItems] = useState(3);

  return (
    <div className="min-h-screen bg-white">
      <TopBar
        title="DSPM Store"
        logoSrc="/store-logo.svg"
        SideBarComponent={ShopSidebar}
      />

      {/* Header adicional con búsqueda y carrito */}
      <div className="pt-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-lg">
              <SearchBar />
            </div>

            {/* Carrito de compras */}
            <div className="flex items-center ml-4">
              <ShoppingCartIcon />
              {cartItems > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido de la tienda */}
      <main className="pt-4">
        <ProductGrid />
      </main>
    </div>
  );
}
```

## 🎨 Personalización

### Temas y Colores

```tsx
// TopBar con diferentes temas
const ThemedTopBar = () => {
  return (
    <div>
      {/* Tema por defecto (primary) */}
      <TopBar title="App Normal" SideBarComponent={Sidebar} />

      {/* Tema oscuro */}
      <TopBar
        title="App Oscura"
        SideBarComponent={Sidebar}
        className="bg-gray-900 text-white"
      />

      {/* Tema personalizado */}
      <TopBar
        title="App Personalizada"
        SideBarComponent={Sidebar}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
      />

      {/* Tema admin/warning */}
      <TopBar
        title="Panel Admin"
        SideBarComponent={AdminSidebar}
        className="bg-red-600 text-white"
      />
    </div>
  );
};
```

### Logos Personalizados

```tsx
// TopBar con diferentes tipos de logos
const LogoVariations = () => {
  return (
    <div className="space-y-4">
      {/* Logo por defecto */}
      <TopBar title="Con Logo Default" SideBarComponent={Sidebar} />

      {/* Logo personalizado */}
      <TopBar
        title="Con Logo Personalizado"
        logoSrc="/my-custom-logo.svg"
        SideBarComponent={Sidebar}
      />

      {/* Sin logo, solo título */}
      <TopBar
        title="Sin Logo"
        logoSrc="" // Logo vacío
        SideBarComponent={Sidebar}
      />

      {/* Logo con diferentes tamaños */}
      <div className="custom-logo-size">
        <style jsx>{`
          .custom-logo-size [data-test-id="top-bar-logo"] {
            width: 48px !important;
            height: 48px !important;
          }
        `}</style>
        <TopBar
          title="Logo Grande"
          logoSrc="/large-logo.svg"
          SideBarComponent={Sidebar}
        />
      </div>
    </div>
  );
};
```

### Sidebars Personalizadas

```tsx
// Diferentes tipos de sidebars
import React from 'react';

// Sidebar simple
const SimpleSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50">
    <div className="p-4">
      <button onClick={onClose} className="float-right">✕</button>
      <nav className="mt-8">
        <a href="/home" className="block py-2">Inicio</a>
        <a href="/about" className="block py-2">Acerca de</a>
        <a href="/contact" className="block py-2">Contacto</a>
      </nav>
    </div>
  </div>
);

// Sidebar compleja con categorías
const ComplexSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50">
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Menú</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ✕
        </button>
      </div>

      <nav className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Principal</h3>
          <div className="space-y-1">
            <a href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Dashboard</a>
            <a href="/projects" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Proyectos</a>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Configuración</h3>
          <div className="space-y-1">
            <a href="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Perfil</a>
            <a href="/settings" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Ajustes</a>
          </div>
        </div>
      </nav>
    </div>
  </div>
);

// Uso con diferentes sidebars
const AppWithSidebars = () => {
  return (
    <div>
      {/* App simple */}
      <TopBar
        title="App Simple"
        SideBarComponent={SimpleSidebar}
      />

      {/* App compleja */}
      <TopBar
        title="App Compleja"
        SideBarComponent={ComplexSidebar}
      />
    </div>
  );
};
```

## 📱 Responsive Design

El TopBar es completamente responsive:

```tsx
// Diseño responsive automático
<TopBar title="DSPM-App" SideBarComponent={Sidebar} />

// En diferentes tamaños de pantalla
<div className="w-full">
  {/* Desktop: Logo + Título + Menú */}
  {/* Tablet: Logo + Título + Menú hamburguesa */}
  {/* Mobile: Logo pequeño + Menú hamburguesa */}
  <TopBar title="DSPM-App" SideBarComponent={Sidebar} />
</div>

// Layouts específicos por breakpoint
<div className="hidden md:block">
  {/* Solo desktop */}
  <TopBar title="Desktop Only" SideBarComponent={DesktopSidebar} />
</div>

<div className="block md:hidden">
  {/* Solo móvil/tablet */}
  <TopBar title="Mobile Only" SideBarComponent={MobileSidebar} />
</div>
```

## 🎯 Mejores Prácticas

### 1. Posicionamiento y Layout

```tsx
// ✅ Bien - TopBar fija con padding correspondiente
export default function App() {
  return (
    <div className="min-h-screen">
      {/* TopBar fija */}
      <TopBar title="App" SideBarComponent={Sidebar} />

      {/* Contenido con padding top exacto */}
      <main className="pt-16"> {/* 64px = h-16 */}
        <Content />
      </main>
    </div>
  );
}

// ✅ Bien - z-index apropiado para overlays
<TopBar
  title="App"
  SideBarComponent={Sidebar}
  className="z-40" // Asegura que esté sobre otros elementos
/>

// ❌ Mal - sin padding, contenido cubierto
<main> {/* ❌ Contenido cubierto por TopBar */}
  <Content />
</main>
```

### 2. Navegación Móvil

```tsx
// ✅ Bien - sidebar responsive
const ResponsiveSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl">
    {/* Sidebar que ocupa toda la pantalla en móvil */}
  </div>
);

// ✅ Bien - overlay click para cerrar
<TopBar SideBarComponent={ResponsiveSidebar} />

// ✅ Bien - navegación por teclado
const AccessibleSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Menú de navegación"
  >
    {/* Contenido accesible */}
  </div>
);
```

### 3. Estados y Feedback

```tsx
// ✅ Bien - estados de carga
const LoadingTopBar = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <TopBar
      title={isLoading ? "Cargando..." : "DSPM-App"}
      SideBarComponent={Sidebar}
      className={isLoading ? "opacity-75" : ""}
    />
  );
};

// ✅ Bien - indicadores de estado
const StatusTopBar = () => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <TopBar
      title="DSPM-App"
      SideBarComponent={Sidebar}
      className={isOnline ? "bg-green-600" : "bg-red-600"}
    />
  );
};
```

### 4. Performance

```tsx
// ✅ Bien - lazy loading de sidebar
const LazySidebar = lazy(() => import('./HeavySidebar'));

const App = () => {
  return (
    <TopBar
      title="App"
      SideBarComponent={LazySidebar}
    />
  );
};

// ✅ Bien - memoización para evitar re-renders
const MemoizedTopBar = memo(TopBar);

// ✅ Bien - callbacks estables
const App = () => {
  const handleMenuClick = useCallback(() => {
    // Lógica del menú
  }, []);

  return (
    <TopBar
      title="App"
      onMenuClick={handleMenuClick}
      SideBarComponent={Sidebar}
    />
  );
};
```

## 🐛 Solución de Problemas

### Problema: TopBar cubre el contenido

```tsx
// Solución: Agregar padding top al contenido
<main className="pt-16"> {/* Ajustar según la altura de TopBar */}
  <Content />
</main>

// O usar calc con la altura exacta
<main style={{ paddingTop: '64px' }}>
  <Content />
</main>

// Para TopBar con alturas variables
<div className="relative">
  <TopBar title="App" SideBarComponent={Sidebar} />
  <main className="pt-16 lg:pt-20"> {/* Diferentes alturas por breakpoint */}
    <Content />
  </main>
</div>
```

### Problema: Sidebar no se abre/cierra correctamente

```tsx
// Verifica que SideBarComponent tenga la prop onClose
const MySidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div>
    <button onClick={onClose}>Cerrar</button>
    {/* Contenido del sidebar */}
  </div>
);

// Asegúrate de que el componente esté exportado correctamente
export default MySidebar;

// Verifica que no haya errores en la consola
<TopBar
  title="App"
  SideBarComponent={MySidebar} // ✅ Correcto
/>
```

### Problema: Logo no se muestra

```tsx
// Verifica la ruta del logo
<TopBar
  title="App"
  logoSrc="/logo.svg" // ✅ Debe estar en public/
  SideBarComponent={Sidebar}
/>

// Para logos en subdirectorios
<TopBar
  logoSrc="/images/logo.svg"
  SideBarComponent={Sidebar}
/>

// Si el logo no existe, usa el componente Logo por defecto
<TopBar
  title="App"
  // logoSrc no especificado = usa Logo por defecto
  SideBarComponent={Sidebar}
/>
```

### Problema: TopBar no es responsive

```tsx
// El componente ya es responsive, pero verifica el CSS
// Asegúrate de que no haya estilos que lo rompan

// ✅ Correcto - clases responsive funcionan
<TopBar title="App" SideBarComponent={Sidebar} />

// Si necesitas personalización responsive
<TopBar
  title="App"
  className="px-4 sm:px-6 lg:px-8"
  SideBarComponent={Sidebar}
/>

// Verifica que el viewport meta tag esté presente
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Problema: Z-index conflicts

```tsx
// Asegúrate de que TopBar tenga el z-index más alto
<TopBar
  title="App"
  className="z-50" // Aumentar si es necesario
  SideBarComponent={Sidebar}
/>

// El overlay del sidebar usa z-50, TopBar usa z-40
// Ajusta según tu layout

// Para modales sobre TopBar
<Modal className="z-60" /> // Mayor que TopBar
```

### Problema: Iconos de Material Symbols no se muestran

```tsx
// Asegúrate de que la fuente esté cargada
// En _app.tsx o layout.tsx
import 'material-symbols';

// O en el HTML
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
/>

// Verifica que el icono existe
<span className="material-symbols-outlined">menu</span>

// Iconos alternativos si Material Symbols no funciona
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/TopBar/TopBar.tsx` - Implementación completa
- `app/components/TopBar/SideBar.tsx` - Componente de sidebar relacionado
- `app/layout.tsx` - Uso en el layout principal de la aplicación

## 🤝 Contribución

Para contribuir al componente TopBar:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevas funcionalidades manteniendo la responsividad
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que la accesibilidad se mantenga en todas las adiciones
6. Prueba el componente en diferentes dispositivos y tamaños de pantalla
7. Considera el impacto en performance de nuevas funcionalidades