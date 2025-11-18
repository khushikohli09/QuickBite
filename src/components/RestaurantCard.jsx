import React from "react";
import { useNavigate } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  const cardStyles = {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "15px",
    margin: "10px",
    width: "250px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    backgroundColor: "#fff",
  };

  const imageStyles = {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "10px",
    
  };

  const buttonStyles = {
    marginTop: "10px",
    padding: "8px 20px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.3s ease",
  };

  return (
    <div
      style={cardStyles}
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {restaurant.image && <img src={restaurant.image} alt={restaurant.name} style={imageStyles} />}
      <h3 style={{ marginBottom: "5px", textAlign: "center", color: "#ff4b2b" }}>
        {restaurant.name}
      </h3>
      {restaurant.cuisines && <p style={{ margin: "2px 0" }}>Cuisines: {restaurant.cuisines}</p>}
      {restaurant.rating && <p style={{ margin: "2px 0" }}>Rating: ⭐ {restaurant.rating}</p>}

      <button
        style={buttonStyles}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        View Items
      </button>
    </div>
  );
}
