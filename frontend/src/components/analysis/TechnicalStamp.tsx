import React from 'react';

export interface TechnicalStampProps {
  variant: 'CORE' | 'ADVANCED' | 'HIGH-YIELD';
  className?: string;
}

/**
 * TechnicalStamp Component
 *
 * A rotated stamp/badge component for chapter cards displaying
 * difficulty/importance levels: CORE, ADVANCED, or HIGH-YIELD.
 *
 * @example
 * <TechnicalStamp variant="CORE" />
 * <TechnicalStamp variant="ADVANCED" className="top-4 right-4" />
 * <TechnicalStamp variant="HIGH-YIELD" />
 */
export const TechnicalStamp: React.FC<TechnicalStampProps> = ({
  variant,
  className = '',
}) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'CORE':
        return 'stamp-core';
      case 'ADVANCED':
        return 'stamp-advanced';
      case 'HIGH-YIELD':
        return 'stamp-high-yield';
      default:
        return 'stamp-core';
    }
  };

  return (
    <span
      className={`technical-stamp ${getVariantClasses()} ${className}`}
      aria-label={`${variant} stamp`}
    >
      {variant}
    </span>
  );
};

export default TechnicalStamp;
