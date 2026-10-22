import { createApiClient } from '@realestate/api-client';
import { env } from '@/lib/env';

export const apiClient = createApiClient(() => env.backendApiUrl);
