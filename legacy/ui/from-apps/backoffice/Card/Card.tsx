import React from "react";

interface CardProps {
  height?: string | number; // e.g. '20rem' or 320
  children?: React.ReactNode;
  className?: string;
  ["data-test-id"]?: string;
}

const Card: React.FC<CardProps> = ({
  height,
  children,
  className = '',
  ...props
}) => {
  const dataTestId = props["data-test-id"];
  return (
    <div
      className={`bg-background rounded-lg border p-4 ${className}`}
      style={{ 
        ...(height && { height }),
        borderColor: 'var(--color-border)',
        borderWidth: '1px'
      }}
      data-test-id={dataTestId || 'card-root'}
    >
      {children}
    </div>
  );
};

export default Card;
