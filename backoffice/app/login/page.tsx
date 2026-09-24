'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, TextField } from '@realestate/ui';
import { getIdentity } from '@/features/cms/actions/identity.action';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const identity = await getIdentity();
        const name = identity?.name?.trim();
        if (!cancelled && name) {
          setCompanyName(name);
        }
      } catch {
        // Identity optional on login; keep form usable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      setError('Credenciales inválidas o sin acceso staff');
      return;
    }
    router.replace(callbackUrl.startsWith('/') ? callbackUrl : '/');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 border rounded-lg p-6"
        autoComplete="off"
      >
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {companyName || 'Backoffice'}
          </h1>
          <p className="text-base text-muted-foreground">Iniciar sesión</p>
        </div>

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
