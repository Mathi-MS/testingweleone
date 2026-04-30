
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}
