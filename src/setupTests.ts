import '@testing-library/jest-dom'

window.matchMedia = window.matchMedia || function() {
  return {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    matches: false,
  }
}
