import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0, marginRight: '6px', display: 'inline-block' }}></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
