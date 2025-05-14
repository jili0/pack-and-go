// src/components/ui/Image.jsx
"use client";

import { useState } from 'react';
import NextImage from 'next/image';

const Image = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false,
  fill = false,
  ...rest 
}) => {
  const [error, setError] = useState(false);
  const placeholderSrc = '/images/placeholder.jpg';

  const handleError = () => {
    setError(true);
  };

  return (
    <NextImage
      src={error ? placeholderSrc : src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      onError={handleError}
      priority={priority}
      fill={fill}
      {...rest}
    />
  );
};

export default Image;