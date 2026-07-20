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

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false;
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

/** Must match authOptions.cookies.sessionToken.name — middleware reads this explicitly. */
export const sessionCookieName = `${cookiePrefix}next-auth.session.backoffice`;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(`${backendBaseUrl}/auth/staff/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            throw new Error((payload as any)?.message || 'Credenciales inválidas');
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
        } catch (error) {
          console.error('NextAuth staff authorize error', error);
          return null;
        } finally {
          clearTimeout(timeout);
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
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
      if (session.user && enrichedUser) {
        (session as any).accessToken = token.accessToken;
        (session as any).role = token.role;
        session.user = {
          ...session.user,
          id: enrichedUser.id,
          email: enrichedUser.email,
          name: enrichedUser.name,
          role: enrichedUser.role,
          phone: enrichedUser.phone,
          personId: enrichedUser.personId,
        } as any;
      }
      return session;
    },
  },
};
