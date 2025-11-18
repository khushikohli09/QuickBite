// src/pages/Restaurant.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import MenuItemCard from "../components/MenuItemCard";
import { CartContext } from "../context/CartContext"; // assuming you have this
import "../styles/Restaurant.css";

export default function Restaurant() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useContext(CartContext); // get addToCart function
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await api.get(`/restaurants/${id}`);
        setRestaurant(res.data);
        setMenuItems(res.data.menuItems || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!restaurant) return <p>Restaurant not found</p>;

  const handleAddToCart = (item) => {
    addToCart(item); // add item to cart
    alert(`${item.name} added to cart!`);
  };

  const handleCheckout = (item) => {
    addToCart(item); // optionally add to cart first
    navigate("/checkout"); // redirect to checkout page
  };

  return (
    <div className="restaurants-list">
      {restaurant.image && (
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="restaurant-image"
        />
      )}
      <h2 className="restaurant-name">{restaurant.name}</h2>
      <p className="restaurant-category">{restaurant.category}</p>

      <h3>Menu Items</h3>
      <div className="menu-items-grid">
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              menuItem={item}
              isUserView={true}
              onAddToCart={handleAddToCart}
              onCheckout={handleCheckout}
            />
          ))
        ) : (
          <p>No menu items available</p>
        )}
      </div>
    </div>
  );
}
