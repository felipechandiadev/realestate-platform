import '@testing-library/jest-dom/extend-expect';

// Mock next/navigation defaults used by DataGrid header/body
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (k: string) => null, toString: () => '' }),
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/',
}));
