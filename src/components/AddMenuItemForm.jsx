import React, { useState, useEffect } from "react";
import "../styles/AddMenuItemForm.css";

const AddMenuItemForm = ({ restaurantId, editItem, onMenuItemAdded, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setDescription(editItem.description || "");
      setPrice(editItem.price || "");
      setImage(editItem.image || "");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setImage("");
    }
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price) {
      alert("Please provide name and price");
      return;
    }

    setLoading(true);

    const method = editItem ? "PUT" : "POST";
    const url = editItem
      ? `http://localhost:5000/api/vendor/menu/${editItem.id}`
      : "http://localhost:5000/api/vendor/menu";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          name,
          description,
          price: parseFloat(price),
          image,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Return the updated or new menu item
        const updatedItem = data.menuItem || data.updated || data;
        onMenuItemAdded(updatedItem);

        // Clear form
        setName("");
        setDescription("");
        setPrice("");
        setImage("");
      } else {
        alert(data.error || "Failed to add/edit menu item");
      }
    } catch (err) {
      console.error("Error adding/editing menu item:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-menu-item-form">
      <h3>{editItem ? "Edit Menu Item" : "Add New Menu Item"}</h3>
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        step="0.01"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <div className="form-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editItem ? "Update Item" : "Add Item"}
        </button>
        {editItem && (
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddMenuItemForm;
