// src/components/ui/StarRating.jsx
const StarRating = ({ rating, size = 'small', interactive = false, onChange }) => {
  // Runden Sie das Rating auf eine halbe Sterne
  const roundedRating = Math.round(rating * 2) / 2;
  
  // Erstellen Sie ein Array von 5 Sternen
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFilled = roundedRating >= starValue;
    const isHalfFilled = roundedRating === index + 0.5;
    
    return { value: starValue, isFilled, isHalfFilled };
  });
  
  // Bestimmen Sie die Größe der Sterne
  const starSizeClass = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  }[size] || 'h-4 w-4';
  
  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };
  
  const handleKeyDown = (e, value) => {
    if (interactive && onChange && e.key === 'Enter') {
      onChange(value);
    }
  };
  
  return (
    <div className="flex">
      {stars.map((star, index) => (
        <span
          key={index}
          onClick={() => handleClick(star.value)}
          onKeyDown={(e) => handleKeyDown(e, star.value)}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          className={interactive ? 'cursor-pointer' : undefined}
        >
          {star.isHalfFilled ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`${starSizeClass} text-yellow-400`}
            >
              <defs>
                <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
                fill="url(#halfStar)"
              />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`${starSizeClass} ${star.isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
};

export default StarRating;