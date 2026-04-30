import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import type { ErrorPageProps } from '../types/utils';

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
  const navigate = useNavigate();
  const routeError = useRouteError() as Error;
  const displayError = error || routeError;

  const handleGoHome = () => {
    if (resetError) resetError();
    navigate('/');
  };

  const handleRefresh = () => {
    if (resetError) resetError();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center bg-white rounded-lg shadow-lg p-6">
        <div className="pb-4">
          <div className="mx-auto w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl text-secondary-900 font-semibold">Something went wrong</h1>
        </div>
        <div className="space-y-4">
          <p className="text-secondary-600 text-sm">
            {displayError?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="primary" onClick={handleRefresh} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;