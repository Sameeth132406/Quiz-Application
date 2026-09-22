import React from 'react';
import Button from './Button';

const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => {
  return (
    <div className="error-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
