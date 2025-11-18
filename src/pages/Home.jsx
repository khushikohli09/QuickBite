// src/pages/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModel";
import SignupModal from "./SignupModel";
import "../styles/Home.css";

// Initialize Socket.IO
const socket = io("http://localhost:5000");

const Home = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch featured restaurants
  const fetchFeaturedRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/restaurants");
      // Only display featured restaurants
      const featured = res.data.filter((r) => r.isFeatured);
      setRestaurants(featured);
    } catch (err) {
      console.error(err);
      setError("Failed to load featured restaurants");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFeaturedRestaurants().finally(() => setLoading(false));

    // Socket.IO listeners
    socket.on("connect", () => console.log("✅ Socket.IO connected:", socket.id));
    socket.on("featured_restaurant_updated", fetchFeaturedRestaurants);
    socket.on("restaurant_deleted", (data) => {
      setRestaurants((prev) => prev.filter((r) => r.id !== data.restaurantId));
    });
    socket.on("disconnect", () => console.log("⚡ Socket.IO disconnected"));

    return () => {
      socket.off("connect");
      socket.off("featured_restaurant_updated");
      socket.off("restaurant_deleted");
      socket.off("disconnect");
    };
  }, []);

  if (loading) return <p>Loading featured restaurants...</p>;
  if (error) return <p>{error}</p>;

  const offers = [
    { id: 1, title: "Flat 50% Off on First Order", code: "WELCOME50" },
    { id: 2, title: "Free Delivery Above ₹299", code: "FREEDLVY" },
    { id: 3, title: "Buy 1 Get 1 Free on Pizza", code: "PIZZA1FREE" },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Delicious Food, Delivered Fast 🍔</h1>
          <p>Order from top restaurants near you and enjoy hot meals at your doorstep!</p>
          <div className="hero-buttons">
            <button
              className="explore-btn"
              onClick={() => navigate("/restaurants")}
            >
              Explore Restaurants
            </button>
          </div>
        </div>
      </div>

      {/* Featured Restaurants */}
      <section className="restaurant-section">
        <h2>Featured Restaurants</h2>
        <div className="restaurant-cards">
          {restaurants.length === 0 && <p>No featured restaurants currently.</p>}
          {restaurants.slice(0, 3).map((r) => (
            <div
              className="restaurant-card"
              key={r.id}
              onClick={() => navigate(`/restaurants/${r.id}`)}
              style={{ cursor: "pointer", transition: "transform 0.3s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {r.image && (
                <img
                  src={r.image}
                  alt={r.name}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h3 style={{ textAlign: "center", color: "#ff4b2b" }}>{r.name}</h3>
              <p style={{ textAlign: "center", margin: "5px 0" }}>{r.category}</p>
              <button
                style={{
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
                }}
              >
                View Items
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Offers Section */}
      <section className="offers-section">
        <h2>Special Offers</h2>
        <div className="offers-list">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <h3>{offer.title}</h3>
              <p>Use Code: <strong>{offer.code}</strong></p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2>What Our Customers Say ❤️</h2>
        <div className="testimonials">
          <div className="testimonial">
            <p>“QuickBite makes my weekends easier! Fast delivery and tasty food every time.”</p>
            <h4>- Aditi Sharma</h4>
          </div>
          <div className="testimonial">
            <p>“I love the offers! The app is smooth, and the food is always fresh.”</p>
            <h4>- Rahul Mehta</h4>
          </div>
          <div className="testimonial">
            <p>“So many options to choose from! Best delivery app in town.”</p>
            <h4>- Neha Gupta</h4>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Satisfy Your Cravings?</h2>
        <p>Download the QuickBite App or Order Online Now!</p>
        <button className="cta-btn">Get Started</button>
      </section>

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </div>
  );
};

export default Home;
