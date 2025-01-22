const StarRating = ({ initialRating }) => {
    const maxStars = 5;
    const fullStars = Math.floor(initialRating);
    const hasHalfStar = initialRating % 1 !== 0;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <div>
        {fullStars &&
          [...Array(fullStars)]?.map((_, index) => (
            <i key={index} className="ri-star-fill"></i>
          ))}
        {hasHalfStar && <i className="ri-star-half-fill"></i>}
        {emptyStars &&
          [...Array(emptyStars)]?.map((_, index) => (
            <i key={index} className="ri-star-line"></i>
          ))}
      </div>
    );
  };
  
  export default StarRating;
  