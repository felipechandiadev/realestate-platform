import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user?: DefaultSession['user'] & {
      id?: string;
      role?: string;
      phone?: string;
      personId?: string;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    phone?: string;
    personId?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    role?: string;
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      role?: string;
      phone?: string;
      personId?: string;
    };
  }
}
