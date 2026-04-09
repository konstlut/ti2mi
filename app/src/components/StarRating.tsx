interface StarRatingProps {
  stars: number;
  maxStars?: number;
}

export default function StarRating({ stars, maxStars = 3 }: StarRatingProps) {
  return (
    <div className="star-rating" aria-label={`${stars} of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span key={i} className={`star ${i < stars ? 'star--filled' : 'star--empty'}`}>
          {i < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}
