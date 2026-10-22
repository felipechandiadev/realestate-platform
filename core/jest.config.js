const base = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
      },
    }],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^jose$': '<rootDir>/test/mocks/jose.mock.ts',
  },
};

module.exports = {
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  projects: [
    {
      ...base,
      displayName: 'unit',
      // Specs unitarios (mockeados, sin BD)
      testMatch: [
        '<rootDir>/src/**/*.spec.ts',
        '<rootDir>/database/**/*.spec.ts',
      ],
    },
    {
      ...base,
      displayName: 'integration',
      // Specs de integración: requieren core/.env.test y una BD de pruebas local
      testMatch: ['<rootDir>/test/**/*.spec.ts'],
      setupFiles: ['<rootDir>/test/setup/load-test-env.ts'],
      // Increase default timeout to accommodate DB synchronize during tests
      testTimeout: 20000,
    },
  ],
};
