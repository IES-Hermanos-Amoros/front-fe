import React from "react";

const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="rating-stars">
      {/* Estrellas llenas */}
      {Array.from({ length: fullStars }, (_, i) => (
        <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
      ))}
      {/* Media estrella si es necesario */}
      {hasHalfStar && <i className="bi bi-star-half text-warning"></i>}
      {/* Estrellas vacías */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <i key={`empty-${i}`} className="bi bi-star text-muted"></i>
      ))}
    </div>
  );
};

export default RatingStars;
