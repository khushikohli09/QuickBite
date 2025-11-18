// src/pages/OrderSuccess.jsx
import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../Socket";
import { UserContext } from "../context/UserContext";
import "../styles/OrderSuccess.css";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { userName = "User", total = 0, orderId = "" } = state || {};

  const [orderStatus, setOrderStatus] = useState("Pending");
  const [notification, setNotification] = useState("");

  // Fetch current status from backend on page load
  useEffect(() => {
    if (!user?.id || !orderId) return;

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.status) setOrderStatus(data.status);
      } catch (err) {
        console.error("Failed to fetch order status:", err);
      }
    };

    fetchOrderStatus();

    // Socket connection
    if (!socket.connected) socket.connect();
    socket.emit("register", { userId: user.id, role: "USER" });

    // Vendor confirmed
    const handleOrderConfirmed = (order) => {
      if (order.orderId === orderId) {
        setOrderStatus("Confirmed");
        setNotification(`✅ Order #${order.orderId} confirmed by vendor`);
      }
    };

    // Vendor ready to deliver
    const handleOrderReady = (update) => {
      if (update.orderId === orderId) {
        setOrderStatus("Ready to Deliver");
        setNotification(`🎉 Order #${update.orderId} is ready to deliver!`);
      }
    };

    socket.on("order-created", handleOrderConfirmed);
    socket.on("order-ready", handleOrderReady);

    return () => {
      socket.off("order-created", handleOrderConfirmed);
      socket.off("order-ready", handleOrderReady);
    };
  }, [user, orderId]);

  return (
    <div className="success-page">
      <h1>🎉 Order Successful!</h1>
      <p>
        Thank you, <strong>{userName}</strong>! Your order #{orderId} was placed successfully.
      </p>
      <p>Total Amount Paid: ₹{total}</p>

      <h2>Current Status: {orderStatus}</h2>

      {notification && (
        <div className="ready-notification">
          {notification}
        </div>
      )}

      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}
