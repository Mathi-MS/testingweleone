export const apolloClient = {
  query: jest.fn(() => Promise.resolve({ data: { getAllMicroLearns: [], getMicroLearnById: null, getSubCategories: [] } })),
  mutate: jest.fn(() => Promise.resolve({ data: {} })),
}
