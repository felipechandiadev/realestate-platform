import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/lib/env';

const backendBaseUrl = env.backendApiUrl;

type BackendAuthResponse = {
  access_token: string;
  userId: string;
  email: string;
  role: string;
  name: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    phone?: string;
    personId?: string;
  };
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: '/portal',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
        audience: { label: 'Audience', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const audience =
          credentials.audience === 'staff' || credentials.audience === 'community'
            ? credentials.audience
            : undefined;

        const endpoints = audience
          ? [`${backendBaseUrl}/auth/${audience}/sign-in`]
          : [
              `${backendBaseUrl}/auth/staff/sign-in`,
              `${backendBaseUrl}/auth/community/sign-in`,
            ];

        try {
          let lastError: string | null = null;

          for (const endpoint of endpoints) {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              signal: controller.signal,
            });

            const payload = (await response.json().catch(() => null)) as
              | BackendAuthResponse
              | { message?: string; error?: string }
              | null;

            if (!response.ok || !payload || !('access_token' in payload)) {
              if (response.status === 403 && (payload as any)?.error === 'EMAIL_NOT_VERIFIED') {
                throw new Error('EMAIL_NOT_VERIFIED');
              }
              lastError = (payload as any)?.message || 'Credenciales inválidas';
              continue;
            }

            return {
              id: payload.user?.id ?? payload.userId,
              name: payload.user?.name ?? payload.name ?? payload.email,
              email: payload.user?.email ?? payload.email,
              role: payload.user?.role ?? payload.role,
              phone: payload.user?.phone,
              personId: payload.user?.personId,
              accessToken: payload.access_token,
            } as any;
          }

          throw new Error(lastError || 'Credenciales inválidas');
        } catch (error) {
          console.error('NextAuth authorize error', error);
          return null;
        } finally {
          clearTimeout(timeout);
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60 },
  pages: {
    signIn: '/portal',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role; // Include role in token
        token.user = {
          id: (user as any).id,
          email: (user as any).email ?? undefined,
          name: (user as any).name ?? undefined,
          role: (user as any).role,
          phone: (user as any).phone,
          personId: (user as any).personId,
        };
      }
      return token;
    },
    async session({ session, token }) {
      type TokenUser = {
        id?: string;
        email?: string | null;
        name: string | null;
        role?: string;
        phone?: string;
        personId?: string;
      };

      const tokenWithUser = token as typeof token & { user?: TokenUser };
      const enrichedUser = tokenWithUser.user;

      session.user = {
        ...(session.user ?? {}),
        id: enrichedUser?.id ?? (typeof token.id === 'string' ? token.id : undefined),
        email: enrichedUser?.email ?? session.user?.email,
        name: enrichedUser?.name ?? session.user?.name,
        role: enrichedUser?.role ?? (typeof token.role === 'string' ? token.role : undefined),
        phone: enrichedUser?.phone,
        personId: enrichedUser?.personId,
      } as any;

      if (typeof token.accessToken === 'string') {
        (session as typeof session & { accessToken?: string }).accessToken = token.accessToken;
      }

      return session;
    },
  },
};
