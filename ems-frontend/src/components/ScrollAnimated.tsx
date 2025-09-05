import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface ScrollAnimatedProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
}

const ScrollAnimated: React.FC<ScrollAnimatedProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}) => {
  const { elementRef, isVisible } = useScrollAnimation(threshold);

  const getAnimationClass = () => {
    if (!isVisible) return 'scroll-animate';
    
    const baseClass = 'scroll-animate visible';
    const directionClass = `animate-${direction}`;
    return `${baseClass} ${directionClass}`;
  };

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClass()} ${className}`}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimated; 