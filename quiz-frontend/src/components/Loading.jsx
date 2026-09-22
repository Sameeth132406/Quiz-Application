import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ fontWeight: '500' }}>{message}</p>
    </div>
  );
};

export default Loading;
