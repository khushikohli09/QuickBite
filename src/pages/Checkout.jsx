// src/pages/Checkout.jsx
import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { CartContext } from "../context/CartContext";
import api from "../api/api";
import { socket } from "../Socket";
import "../styles/Checkout.css";

export default function Checkout() {
  const { state } = useLocation();
  const { orderItem } = state || {};
  const { user } = useContext(UserContext);
  const { cartItems, clearCart } = useContext(CartContext);

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [orderStatus, setOrderStatus] = useState(""); // For live status

  const navigate = useNavigate();

  // Initialize items
  useEffect(() => {
    if (orderItem) setItems([{ ...orderItem, quantity: 1 }]);
    else setItems(cartItems);
  }, [orderItem, cartItems]);

  // Socket listener for vendor confirmation & status updates
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("register", { userId: user.id, role: "USER" });

    const handleOrderConfirmed = (order) => {
      setIsLoading(false);
      clearCart();
      setOrderStatus("Confirmed");
      navigate("/order-success", {
        state: {
          userName: user.name || "User",
          orderId: order.orderId,
          total: order.total,
        },
      });
    };

    const handleOrderStatusUpdated = (update) => {
      setOrderStatus(update.status);
      setStatus(`Order #${update.orderId} is now ${update.status}`);
    };

    // NEW: Handle Ready to Deliver
    const handleOrderReady = (update) => {
      setOrderStatus("Ready to Deliver");
      setStatus(`Order #${update.orderId} is Ready to Deliver!`);
      alert(`Your order #${update.orderId} is Ready to Deliver!`);
    };

    socket.on("order-created", handleOrderConfirmed);
    socket.on("order-status-updated", handleOrderStatusUpdated);
    socket.on("order-ready", handleOrderReady);

    return () => {
      socket.off("order-created", handleOrderConfirmed);
      socket.off("order-status-updated", handleOrderStatusUpdated);
      socket.off("order-ready", handleOrderReady);
    };
  }, [user, clearCart, navigate]);

  const handleInputChange = (e) => {
    setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const placeOrder = async () => {
    if (!items.length) return setStatus("No items to order");
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address)
      return setStatus("Please fill in all delivery details");
    if (!validatePhone(deliveryInfo.phone))
      return setStatus("Phone number must be 10 digits");

    try {
      const orderData = {
        userId: user.id,
        restaurantId: items[0].restaurantId,
        items: items.map((i) => ({
          menuItemId: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
        deliveryInfo,
        paymentMethod,
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      };

      const res = await api.post("/orders/confirm", orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const orderId = res.data.orderId;

      socket.emit("place-order", {
        orderId,
        restaurantId: items[0].restaurantId,
        items,
        userId: user.id,
        total: orderData.total,
      });

      setIsLoading(true);
      setStatus("Order placed! Waiting for vendor confirmation...");
    } catch (err) {
      console.error("Failed to place order:", err);
      setStatus(err.response?.data?.error || "Failed to place order.");
      setIsLoading(false);
    }
  };

  if (!items.length) return <p>No items selected for checkout.</p>;

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            {item.image && <img src={item.image} alt={item.name} />}
            <div className="cart-item-info">
              <h2>{item.name}</h2>
              <p>Quantity: {item.quantity}</p>
              <p>
                Price: ₹{item.price} × {item.quantity} = ₹
                {item.price * item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2>Total: ₹{totalAmount}</h2>

      <h3>Delivery Details</h3>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={deliveryInfo.name}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        value={deliveryInfo.phone}
        onChange={handleInputChange}
      />
      <textarea
        name="address"
        placeholder="Delivery Address"
        value={deliveryInfo.address}
        onChange={handleInputChange}
      ></textarea>

      <h3>Payment Method</h3>
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="Cash">Cash on Delivery</option>
        <option value="Card">Card Payment</option>
      </select>

      <button onClick={placeOrder} disabled={isLoading}>
        {isLoading ? "Placing Order..." : "Place Order"}
      </button>

      {status && (
        <p
          className={`status ${
            status.toLowerCase().includes("success") ? "success" : "error"
          }`}
        >
          {status}
        </p>
      )}

      {orderStatus && (
        <p className="status" style={{ color: "#ff416c", fontWeight: "600" }}>
          Current Status: {orderStatus}
        </p>
      )}
    </div>
  );
}
