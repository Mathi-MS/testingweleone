// Mock environment variables
process.env.VITE_REST_ENDPOINT = 'https://app.wele.in';
process.env.VITE_GRAPHQL_ENDPOINT = 'https://app.wele.in/graphql';

// Mock import.meta for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_REST_ENDPOINT: 'https://app.wele.in',
        VITE_GRAPHQL_ENDPOINT: 'https://app.wele.in/graphql',
      }
    }
  },
  writable: true,
  configurable: true
});
