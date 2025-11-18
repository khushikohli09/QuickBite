// src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";
import Cart from "../pages/Cart";
import { socket } from "../Socket";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { cartItems = [], clearCart } = useContext(CartContext);
  const { user, logout, notifications, setNotifications } = useContext(UserContext);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Vendor receives new orders
  const handleOrderReceived = useCallback(
    (order) => {
      setNotifications((prev) => [{ ...order, status: "Pending", isNew: true }, ...prev]);
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.orderId === order.orderId ? { ...n, isNew: false } : n
          )
        );
      }, 1500);
    },
    [setNotifications]
  );

  useEffect(() => {
    if (!user?.id) return;

    if (!socket.connected) socket.connect();
    socket.emit("register", { userId: user.id, role: user.role.toUpperCase() });

    if (user.role.toUpperCase() === "VENDOR") {
      socket.on("order-received", handleOrderReceived);
    }

    return () => {
      socket.off("order-received", handleOrderReceived);
    };
  }, [user, handleOrderReceived]);

  const confirmOrder = (order) => {
    socket.emit("update-order-status", {
      orderId: order.orderId,
      userId: order.userId,
      status: "Confirmed",
      total: order.total,
    });

    // Update status locally, but keep notification
    setNotifications((prev) =>
      prev.map((n) =>
        n.orderId === order.orderId ? { ...n, status: "Confirmed" } : n
      )
    );
  };

  const readyToDeliver = (order) => {
    socket.emit("update-order-status", {
      orderId: order.orderId,
      userId: order.userId,
      status: "Ready to Deliver",
      total: order.total,
    });

    // Remove notification after ready to deliver
    setNotifications((prev) => prev.filter((n) => n.orderId !== order.orderId));
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">QuickBite</Link>
        </div>

        {/* Center links */}
        <div className={`navbar-center ${isMobileMenuOpen ? "active" : ""}`}>
          <Link className="nav-link" to="/restaurants">Restaurants</Link>
          <Link className="nav-link" to="/about">About</Link>
          <Link className="nav-link" to="/contact">Contact</Link>
        </div>

        <div className="navbar-right">
          {!user ? (
            <>
              <Link to="/login">
                <button className="nav-btn login-btn">Login</button>
              </Link>
              <Link to="/signup">
                <button className="nav-btn signup-btn">Signup</button>
              </Link>
            </>
          ) : (
            <>
              {/* Cart for users */}
              {user.role.toUpperCase() !== "VENDOR" && (
                <div className="cart-icon-wrapper" onClick={toggleCart}>
                  <span className="cart-icon">🛒</span>
                  {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
                </div>
              )}

              {/* Notifications for vendors */}
              {user.role.toUpperCase() === "VENDOR" && (
                <div className="notification-wrapper">
                  <button
                    className="nav-btn notification-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    🔔 {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                  </button>

                  {showNotifications && (
                    <div className="notification-dropdown">
                      {notifications.length === 0 && <div className="notification-item">No new orders</div>}
                      <div className="notification-list">
                        {notifications.map((n) => (
                          <div
                            key={n.orderId}
                            className={`notification-item ${n.isNew ? "new-order" : ""}`}
                          >
                            <div>
                              <strong>Order #{n.orderId}</strong><br />
                              From User {n.userId} - ₹{n.total}<br />
                              Status: <strong>{n.status}</strong>
                            </div>
                            <div style={{ marginTop: "5px", display: "flex", gap: "5px" }}>
                              <button
                                className="confirm-btn"
                                onClick={() => confirmOrder(n)}
                                disabled={n.status === "Confirmed"}
                              >
                                {n.status === "Confirmed" ? "Confirmed" : "Confirm"}
                              </button>
                              <button className="ready-btn" onClick={() => readyToDeliver(n)}>
                                Ready to Deliver
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <span className="nav-user">Hello, {user.name}</span>
              <button
                className="nav-btn signup-btn"
                onClick={() => { logout(); navigate("/"); }}
              >
                Logout
              </button>
            </>
          )}

          {/* Hamburger for mobile */}
          <div className="hamburger" onClick={toggleMobileMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </nav>

      {/* User cart modal */}
      {user?.role.toUpperCase() !== "VENDOR" && (
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
