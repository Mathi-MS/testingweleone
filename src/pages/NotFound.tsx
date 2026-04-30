import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center bg-white rounded-lg shadow-lg p-6">
        <div className="pb-4">
          <div className="mx-auto w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-primary-500 font-satoshi">404</span>
          </div>
          <h1 className="text-xl text-secondary-900 font-semibold">Page Not Found</h1>
        </div>
        <div className="space-y-4">
          <p className="text-secondary-600 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="primary" onClick={handleGoHome} className="flex-1">
              Go Home
            </Button>
            <Button variant="outline" onClick={handleGoBack} className="flex-1">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;