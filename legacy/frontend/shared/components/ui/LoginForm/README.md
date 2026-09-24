# LoginForm Component

Formulario de autenticación completo y elegante con integración de NextAuth, manejo automático de roles, redirección inteligente y diseño moderno con logo integrado.

## 🚀 Características Principales

- ✅ **Integración NextAuth**: Autenticación completa con credenciales
- ✅ **Manejo de Roles**: Redirección automática según rol (admin/operator)
- ✅ **Validación en Tiempo Real**: Feedback inmediato de errores
- ✅ **Toggle de Contraseña**: Mostrar/ocultar contraseña
- ✅ **Diseño Elegante**: Gradiente de fondo con logo integrado
- ✅ **Responsive**: Diseño adaptativo para móviles y desktop
- ✅ **TypeScript**: Completamente tipado
- ✅ **Accesibilidad**: Labels apropiados y navegación por teclado
- ✅ **Data Test IDs**: Soporte completo para testing automatizado
- ✅ **Estados de Carga**: Feedback visual durante autenticación

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import LoginForm from '@/components/LoginForm/LoginForm';

# Asegúrate de que NextAuth esté configurado
# Revisa la configuración en pages/api/auth/[...nextauth].ts
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';

export default function LoginPage() {
  const handleRegister = () => {
    // Redirigir a página de registro
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <LoginForm onRegister={handleRegister} />
    </div>
  );
}
```

## 🔧 API Reference

### Props del LoginForm

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `onLogin` | `(username: string, password: string) => Promise<void>` | - | Callback personalizado para login (opcional, usa NextAuth por defecto) |
| `onRegister` | `() => void` | - | Callback para redirección a registro |
| `loading` | `boolean` | `false` | Estado de carga externa |

## 🎯 Casos de Uso Comunes

### Página de Login Completa

```tsx
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Lógica de autenticación personalizada
      const response = await fetch('/api/custom-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Manejar éxito
        console.log('Login exitoso:', data);
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error; // El LoginForm maneja los errores
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md">
        <LoginForm
          onLogin={handleCustomLogin}
          onRegister={handleRegister}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
```

### Login Modal/Dialog

```tsx
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';
import { Dialog } from '@/components/Dialog';

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLoginSuccess = () => {
    setIsOpen(false);
    // Recargar la página o redirigir
    window.location.reload();
  };

  const handleRegister = () => {
    setIsOpen(false);
    // Abrir modal de registro o redirigir
    window.location.href = '/register';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Iniciar Sesión
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title=""
        size="sm"
      >
        <div className="p-0">
          <LoginForm
            onRegister={handleRegister}
          />
        </div>
      </Dialog>
    </>
  );
}
```

### Login con Contexto de Autenticación

```tsx
import React, { useContext } from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';
import { AuthContext } from '@/context/AuthContext';

export default function AuthenticatedApp() {
  const { user, login, logout, isLoading } = useContext(AuthContext);

  const handleCustomLogin = async (username: string, password: string) => {
    await login(username, password);
  };

  const handleRegister = () => {
    // Lógica para mostrar formulario de registro
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Bienvenido, {user.name}</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </header>
        {/* Contenido de la aplicación */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <LoginForm
        onLogin={handleCustomLogin}
        onRegister={handleRegister}
        loading={isLoading}
      />
    </div>
  );
}
```

### Login con Recuperación de Contraseña

```tsx
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';

export default function LoginWithRecovery() {
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRegister = () => {
    window.location.href = '/register';
  };

  const handleForgotPassword = () => {
    setShowRecovery(true);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecovering(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      if (response.ok) {
        alert('Se ha enviado un enlace de recuperación a tu correo');
        setShowRecovery(false);
        setRecoveryEmail('');
      } else {
        alert('Error al enviar el correo de recuperación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="w-full max-w-md relative">
          <LoginForm onRegister={handleRegister} />

          {/* Enlace para recuperar contraseña */}
          <div className="text-center mt-4">
            <button
              onClick={handleForgotPassword}
              className="text-white text-sm hover:underline focus:outline-none focus:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>

      {/* Modal de recuperación de contraseña */}
      <Dialog
        open={showRecovery}
        onClose={() => setShowRecovery(false)}
        title="Recuperar Contraseña"
        size="sm"
      >
        <form onSubmit={handleRecoverySubmit} className="space-y-4">
          <TextField
            label="Correo Electrónico"
            type="email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={() => setShowRecovery(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isRecovering}
              className="flex-1"
            >
              {isRecovering ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
```

### Login Multi-Tenant

```tsx
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';
import { Select } from '@/components/Select';

export default function MultiTenantLogin() {
  const [selectedTenant, setSelectedTenant] = useState('');

  const tenants = [
    { value: 'tenant1', label: 'Empresa A' },
    { value: 'tenant2', label: 'Empresa B' },
    { value: 'tenant3', label: 'Empresa C' },
  ];

  const handleLogin = async (username: string, password: string) => {
    if (!selectedTenant) {
      throw new Error('Por favor selecciona una empresa');
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        tenant: selectedTenant,
      }),
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const data = await response.json();
    // Manejar la respuesta...
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500">
      <div className="w-full max-w-md space-y-6">
        {/* Selector de tenant */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <Select
            label="Seleccionar Empresa"
            value={selectedTenant}
            onChange={(value) => setSelectedTenant(value)}
            options={tenants}
            placeholder="Elige una empresa..."
          />
        </div>

        {/* Formulario de login */}
        <LoginForm
          onLogin={handleLogin}
          onRegister={() => window.location.href = '/register'}
        />
      </div>
    </div>
  );
}
```

## 🎨 Personalización

### Estilos Personalizados

```tsx
// Personalizar colores del gradiente
<div className="min-h-screen flex items-center justify-center"
     style={{
       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
     }}>
  <LoginForm />
</div>

// Personalizar el contenedor del formulario
<LoginForm
  className="custom-login-form"
/>

// En tu CSS
.custom-login-form {
  background: linear-gradient(to bottom,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0) 33%,
    rgba(255,255,255,0.6) 100%);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}
```

### Logo Personalizado

```tsx
// El componente incluye Logo automáticamente
// Para personalizar, modifica el componente Logo
// o crea una variante personalizada

import CustomLogo from '@/components/CustomLogo';

export default function CustomLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md">
        {/* Logo personalizado */}
        <div className="text-center mb-8">
          <CustomLogo className="w-32 h-32 mx-auto" />
          <h1 className="text-2xl font-bold text-white mt-4">Mi Aplicación</h1>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
```

### Campos Adicionales

```tsx
// Para agregar campos adicionales, crea un formulario personalizado
// que use LoginForm como base

import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';
import { TextField } from '@/components/TextField';
import { Checkbox } from '@/components/Checkbox';

export default function ExtendedLoginForm() {
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleExtendedLogin = async (username: string, password: string) => {
    // Lógica de login extendida
    const response = await fetch('/api/auth/login-extended', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        rememberMe,
        twoFactorCode,
      }),
    });

    if (!response.ok) {
      throw new Error('Error de autenticación');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="w-full max-w-md space-y-4">
        <LoginForm onLogin={handleExtendedLogin} />

        {/* Campos adicionales */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 space-y-4">
          <TextField
            label="Código 2FA"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="000000"
          />

          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded"
            />
            <span>Recordarme</span>
          </label>
        </div>
      </div>
    </div>
  );
}
```

## 📱 Responsive Design

El LoginForm es completamente responsive:

```tsx
// Diseño responsive automático
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
  <LoginForm /> {/* Se adapta automáticamente */}
</div>

// En diferentes tamaños de pantalla
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-sm sm:max-w-md">
    <LoginForm />
  </div>
</div>

// Para móviles pequeños
@media (max-width: 640px) {
  .login-container {
    padding: 1rem;
  }

  .login-form {
    max-width: 100%;
  }
}
```

## 🎯 Mejores Prácticas

### 1. Manejo Seguro de Credenciales

```tsx
// ✅ Bien - usar HTTPS siempre
// ✅ Bien - validar en el servidor
// ✅ Bien - implementar rate limiting
// ✅ Bien - usar tokens seguros con expiración

// ❌ Mal - almacenar contraseñas en localStorage
// ❌ Mal - enviar credenciales sin encriptación
```

### 2. Feedback de Usuario

```tsx
// ✅ Bien - mostrar estados de carga
const [isLoading, setIsLoading] = useState(false);

<LoginForm
  loading={isLoading}
  onLogin={async (username, password) => {
    setIsLoading(true);
    try {
      await login(username, password);
    } finally {
      setIsLoading(false);
    }
  }}
/>

// ✅ Bien - mensajes de error específicos pero seguros
const getErrorMessage = (error: string) => {
  switch (error) {
    case 'INVALID_CREDENTIALS':
      return 'Usuario o contraseña incorrectos';
    case 'ACCOUNT_LOCKED':
      return 'Cuenta bloqueada temporalmente';
    case 'TOO_MANY_ATTEMPTS':
      return 'Demasiados intentos. Intenta más tarde';
    default:
      return 'Error al iniciar sesión';
  }
};
```

### 3. Accesibilidad

```tsx
// ✅ Bien - navegación por teclado completa
// ✅ Bien - labels apropiados (incluidos automáticamente)
// ✅ Bien - indicadores de foco visibles
// ✅ Bien - soporte para lectores de pantalla

// El componente incluye:
// - role="form" apropiado
// - aria-label en campos
// - aria-describedby para errores
// - navegación por tab correcta
```

### 4. Seguridad

```tsx
// ✅ Bien - implementar timeouts de sesión
// ✅ Bien - forzar cambio de contraseña periódicamente
// ✅ Bien - logging de intentos de login
// ✅ Bien - bloqueo de cuenta después de múltiples fallos

// Configuración recomendada de NextAuth
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // ... otras opciones
};
```

## 🐛 Solución de Problemas

### Problema: Error de autenticación constante

```tsx
// Verifica la configuración de NextAuth
// Asegúrate de que las credenciales sean correctas
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        userName: { label: 'Username', type: 'text' },
        pass: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Lógica de validación aquí
        const user = await validateCredentials(credentials);
        return user;
      },
    }),
  ],
  // ... resto de configuración
};
```

### Problema: Redirección después del login no funciona

```tsx
// Verifica el callback de redirección en NextAuth
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user.role = token.role;
    }
    return session;
  },
  async redirect({ url, baseUrl }) {
    // Lógica de redirección personalizada
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    else if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  },
},
```

### Problema: El formulario no se envía

```tsx
// Asegúrate de que el formulario tenga un botón type="submit"
<Button
  type="submit"  // ✅ Obligatorio
  variant="primary"
  disabled={loading}
>
  {loading ? 'Ingresando...' : 'Ingresar'}
</Button>

// O usa onSubmit en el form
<form onSubmit={handleSubmit}>
  {/* campos */}
  <button type="submit">Ingresar</button>
</form>
```

### Problema: Los estilos no se aplican correctamente

```tsx
// El componente usa Tailwind CSS
// Asegúrate de que esté configurado correctamente

// Verifica que los estilos base estén incluidos
import 'tailwindcss/base';
import 'tailwindcss/components';
import 'tailwindcss/utilities';

// Para el gradiente de fondo, asegúrate de que el contenedor padre tenga
// la altura correcta
<div className="min-h-screen flex items-center justify-center">
  <LoginForm />
</div>
```

### Problema: Error de hidratación en Next.js

```tsx
// Si usas el componente en páginas con SSR, considera usar dynamic import
import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/LoginForm/LoginForm'), {
  ssr: false,
  loading: () => <div>Cargando...</div>
});

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/LoginForm/page.tsx` - Showcase completo con diferentes configuraciones
- `pages/api/auth/[...nextauth].ts` - Configuración de NextAuth
- `app/api/auth/session` - Endpoint de sesión

## 🤝 Contribución

Para contribuir al componente LoginForm:

1. Mantén la integración con NextAuth como opción por defecto
2. Agrega nuevas opciones de personalización manteniendo la seguridad
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que la accesibilidad se mantenga en todas las adiciones
6. Prueba el componente con diferentes proveedores de autenticación
7. Considera siempre las implicaciones de seguridad de los cambios