import React, { useEffect, useState } from "react";
import api from "../api/api";
import RestaurantCard from "../components/RestaurantCard";

export default function AllRestaurants() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get("/restaurants");
        setRestaurants(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRestaurants();
  }, []);

  if (restaurants.length === 0) return <p>Loading restaurants...</p>;

  return (
    <div style={{ maxWidth: "1200px", margin: "50px auto", padding: "20px", fontFamily: "'Poppins', sans-serif", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.2rem", color: "#ff416c", marginBottom: "30px", fontWeight: "700" }}>All Restaurants</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", justifyItems: "center" }}>
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
