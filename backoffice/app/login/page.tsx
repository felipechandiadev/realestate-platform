'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, TextField } from '@realestate/ui';

const DEV_SEED_ADMIN = {
  email: 'admin@re.cl',
  password: '890890',
} as const;

const isDev = process.env.NODE_ENV === 'development';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState(isDev ? DEV_SEED_ADMIN.email : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    const result = await signIn('credentials', {
      email: normalizedEmail,
      password: normalizedPassword,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(
        isDev
          ? 'Credenciales inválidas. En dev usa admin@re.cl / 890890 (seed). Revisa que el navegador no autocomplete otra contraseña.'
          : 'Credenciales inválidas o sin acceso staff',
      );
      return;
    }
    router.replace(callbackUrl.startsWith('/') ? callbackUrl : '/');
    router.refresh();
  }

  function fillDevCredentials() {
    setEmail(DEV_SEED_ADMIN.email);
    setPassword(DEV_SEED_ADMIN.password);
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 border rounded-lg p-6"
        autoComplete="off"
      >
        <h1 className="text-xl font-semibold">Backoffice — Iniciar sesión</h1>

        {isDev ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p className="font-medium">Dev (seed)</p>
            <p>
              <code>{DEV_SEED_ADMIN.email}</code> / <code>{DEV_SEED_ADMIN.password}</code>
            </p>
            <button
              type="button"
              className="mt-2 text-primary underline"
              onClick={fillDevCredentials}
            >
              Rellenar credenciales
            </button>
          </div>
        ) : null}

        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}
