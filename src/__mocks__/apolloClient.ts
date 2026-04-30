export const gql = (strings: TemplateStringsArray) => strings.join('');

export const ApolloClient = jest.fn(() => ({
  query: jest.fn(() => Promise.resolve({ data: {} })),
  mutate: jest.fn(() => Promise.resolve({ data: {} })),
  watchQuery: jest.fn(() => ({
    subscribe: jest.fn(),
  })),
}));

export const InMemoryCache = jest.fn(() => ({}));

export const createHttpLink = jest.fn(() => ({
  request: jest.fn(),
}));

export const useQuery = jest.fn(() => ({
  loading: false,
  error: null,
  data: null,
}));

export const useMutation = jest.fn(() => [jest.fn()]);

export const ApolloProvider = ({ children }: any) => children;

export default {
  gql,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  useQuery,
  useMutation,
  ApolloProvider,
};
