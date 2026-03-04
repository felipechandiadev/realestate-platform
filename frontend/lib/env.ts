// Prefer the public var so SSR and Client render the same origin when both are defined
const rawBackendApiUrl =
  process.env.NEXT_PUBLIC_AUTH_API_URL ??
  process.env.AUTH_API_URL ??
  'http://localhost:3000';

const normalizedBackendApiUrl = rawBackendApiUrl.replace(/\/$/, '');

export const env = {
  backendApiUrl: normalizedBackendApiUrl,
};

// Optional safety: warn in dev if both vars exist and differ (helps avoid hydration mismatches)
if (
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_AUTH_API_URL &&
  process.env.AUTH_API_URL &&
  process.env.NEXT_PUBLIC_AUTH_API_URL.replace(/\/$/, '') !== process.env.AUTH_API_URL.replace(/\/$/, '')
) {
   
  console.warn(
    '[env] NEXT_PUBLIC_AUTH_API_URL and AUTH_API_URL differ. Using NEXT_PUBLIC_AUTH_API_URL to keep SSR/Client consistent:',
    {
      NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
      AUTH_API_URL: process.env.AUTH_API_URL,
    }
  );
}

if (!normalizedBackendApiUrl) {
  throw new Error(
    'AUTH_API_URL environment variable is required to contact the backend API.',
  );
}
