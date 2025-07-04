// src/components/ui/StarRating.jsx

const StarRating = ({
  rating,
  size = "small",
  interactive = false,
  onChange,
}) => {
  // Round rating to nearest half star
  const roundedRating = Math.round(rating * 2) / 2;

  // Create array of 5 stars
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFilled = roundedRating >= starValue;
    const isHalfFilled = roundedRating === index + 0.5;

    return { value: starValue, isFilled, isHalfFilled };
  });

  // Determine star size class
  const getStarSizeClass = () => {
    switch (size) {
      case "large":
        return null;
      case "medium":
        return null;
      case "small":
      default:
        return null;
    }
  };

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleKeyDown = (e, value) => {
    if (interactive && onChange && e.key === "Enter") {
      onChange(value);
    }
  };

  return (
    <div>
      {stars.map((star, index) => (
        <span
          key={index}
          onClick={() => handleClick(star.value)}
          onKeyDown={(e) => handleKeyDown(e, star.value)}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          className={`
            ${getStarSizeClass()} 
            ${interactive ? null : ""}
            ${star.isHalfFilled ? null : star.isFilled ? null : null}
          `}
          aria-label={`${star.value} star${star.value !== 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
