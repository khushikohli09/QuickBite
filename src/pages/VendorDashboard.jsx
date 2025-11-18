import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import AddRestaurantForm from "../components/AddRestaurantForm";
import AddMenuItemForm from "../components/AddMenuItemForm";
import MenuItemCard from "../components/MenuItemCard";
import api from "../api/api";
import "../styles/Vendor.css";
import "../styles/MenuItemCard.css";

const VendorDashboard = () => {
  const { user, loading } = useContext(UserContext);
  const [restaurant, setRestaurant] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [addingMenuItem, setAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  // Fetch vendor's restaurant
  useEffect(() => {
    if (!user) return;

    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const vendorId = user.id || user._id;
        const res = await api.get(`/vendor/dashboard?vendorId=${vendorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.restaurants?.length > 0) {
          const rest = res.data.restaurants[0];
          setRestaurant({ ...rest, menuItems: rest.menuItems || [] });
        } else {
          setRestaurant(null);
        }
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setRestaurant(null);
      } finally {
        setFetching(false);
      }
    };

    fetchRestaurant();
  }, [user]);

  // Add restaurant
  const handleAddRestaurant = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const vendorId = user.id || user._id;
      const res = await api.post(
        "/vendor/restaurant",
        { ...data, ownerId: vendorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.restaurant) {
        setRestaurant({ ...res.data.restaurant, menuItems: [] });
        alert("Restaurant added successfully! Now you can add menu items.");
      }
    } catch (err) {
      console.error("Error adding restaurant:", err);
      alert("Failed to add restaurant.");
    }
  };

  // Add/Edit Menu Item
  const handleMenuItemSubmit = async (itemData) => {
    try {
      const token = localStorage.getItem("token");
      const method = editingMenuItem ? "PUT" : "POST";
      const url = editingMenuItem
        ? `/vendor/menu/${editingMenuItem.id}`
        : `/vendor/menu`;

      const body = editingMenuItem
        ? { ...itemData }
        : { ...itemData, restaurantId: restaurant.id };

      const res = await api[method.toLowerCase()](url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newItem = res.data.menuItem || res.data.updated || itemData;

      if (editingMenuItem) {
        setRestaurant((prev) => ({
          ...prev,
          menuItems: prev.menuItems.map((i) =>
            i.id === editingMenuItem.id ? newItem : i
          ),
        }));
        setEditingMenuItem(null);
      } else {
        setRestaurant((prev) => ({
          ...prev,
          menuItems: [...prev.menuItems, newItem],
        }));
      }

      setAddingMenuItem(false);
      alert("Menu item saved successfully!");
    } catch (err) {
      console.error("Error saving menu item:", err);
      alert("Failed to save menu item.");
    }
  };

  // Edit menu item
  const handleEdit = (menuItem) => {
    setEditingMenuItem(menuItem);
    setAddingMenuItem(true);
  };

  // Delete menu item
  const handleDelete = async (menuItemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/vendor/menu/${menuItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRestaurant((prev) => ({
        ...prev,
        menuItems: prev.menuItems.filter((i) => i.id !== menuItemId),
      }));
      alert("Menu item deleted!");
    } catch (err) {
      console.error("Error deleting menu item:", err);
      alert("Failed to delete menu item.");
    }
  };

  if (!user) return <div>Please log in as vendor</div>;
  if (user.role?.toUpperCase() !== "VENDOR")
    return <div>Access denied. Only vendors can view this page.</div>;
  if (loading || fetching) return <div>Loading Vendor Dashboard...</div>;

  return (
    <div className="vendor-dashboard">
      <h1>Owner Dashboard</h1>

      {!restaurant && <AddRestaurantForm onRestaurantAdded={handleAddRestaurant} />}

      {restaurant && (
        <div className="restaurant-info">
          {restaurant.image && <img src={restaurant.image} alt={restaurant.name} />}
          <h2>{restaurant.name}</h2>
          <p className="category">{restaurant.category}</p>
          <p>Checkout Time: {restaurant.checkoutTime || "N/A"} mins</p>

          {/* Add/Edit Menu Item Button */}
          {!addingMenuItem && !editingMenuItem && (
            <button
              className="add-more-btn"
              onClick={() => setAddingMenuItem(true)}
            >
              Add Menu Item
            </button>
          )}

          {/* Add/Edit Menu Item Form */}
          {addingMenuItem && (
            <AddMenuItemForm
              restaurantId={restaurant.id}
              editItem={editingMenuItem}
              onMenuItemAdded={handleMenuItemSubmit}
              onCancel={() => {
                setAddingMenuItem(false);
                setEditingMenuItem(null);
              }}
            />
          )}

          {/* Menu Items */}
          <div className="menu-items-grid">
            {restaurant.menuItems?.length > 0 ? (
              restaurant.menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  menuItem={item}
                  isUserView={false}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p>No menu items yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
