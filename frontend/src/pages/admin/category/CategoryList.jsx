import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../../components/Layout/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "../../../utils/auth";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Import Google Font
const fontFamily = "'Poppins', sans-serif";

const styles = {
  container: {
    padding: "24px",
    paddingTop: "80px", // Added padding to prevent overlap with header
    backgroundColor: "#EEEEEE", // Light background for the layout
    minHeight: "100vh",
    fontFamily: fontFamily, // Apply Google Font
  },
  header: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#FFFFFF", // White text for contrast
    textAlign: "center",
    letterSpacing: "0.5px",
    background: "linear-gradient(90deg, #3B1E54, #9B7EBD)", // Gradient background
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  card: {
    padding: "24px",
    backgroundColor: "#FFFFFF", // White card background
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: "1px solid #D4BEE4", // Light purple border
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
    fontFamily: fontFamily, // Apply Google Font
  },
  inputFocus: {
    borderColor: "#9B7EBD", // Darker purple on focus
  },
  buttonPrimary: {
    backgroundColor: "#9B7EBD", // Purple button
    color: "#FFFFFF", // White text
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s ease",
    marginRight: "12px",
    fontFamily: fontFamily, // Apply Google Font
  },
  buttonPrimaryHover: {
    backgroundColor: "#3B1E54", // Darker purple on hover
  },
  buttonSecondary: {
    backgroundColor: "#D4BEE4", // Light purple button
    color: "#3B1E54", // Dark text
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s ease",
    fontFamily: fontFamily, // Apply Google Font
  },
  buttonSecondaryHover: {
    backgroundColor: "#9B7EBD", // Purple on hover
    color: "#FFFFFF", // White text on hover
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    fontFamily: fontFamily, // Apply Google Font
  },
  th: {
    backgroundColor: "#3B1E54", // Dark purple header
    color: "#FFFFFF", // White text
    padding: "16px",
    textAlign: "left",
    fontWeight: "600",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #D4BEE4", // Light purple border
    color: "#333", // Dark text
  },
  rowHover: {
    backgroundColor: "#F5F5F5", // Light gray on hover
  },
  actionButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    marginRight: "8px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    border: "none",
    fontWeight: "500",
    fontFamily: fontFamily, // Apply Google Font
  },
  editButton: {
    backgroundColor: "#9B7EBD", // Purple button
    color: "#FFFFFF", // White text
  },
  editButtonHover: {
    backgroundColor: "#3B1E54", // Darker purple on hover
  },
  deleteButton: {
    backgroundColor: "#A94A4A", // Red button
    color: "#FFFFFF", // White text
  },
  deleteButtonHover: {
    backgroundColor: "#D32F2F", // Darker red on hover
  },
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    id: null,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/categories/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch categories. Please try again.");
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { name, description, id } = categoryForm;

    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      const token = getToken();
      if (id) {
        await axios.put(
          `http://localhost:5000/api/categories/${id}`,
          { name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Category updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/categories/",
          { name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Category created successfully!");
      }

      setCategoryForm({ name: "", description: "", id: null });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to save category. Please try again.");
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = getToken();
        await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete the category. Please try again.");
      }
    }
  };

  const handleEdit = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      id: category.id,
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={styles.container}>
      {/* Add Google Font Link */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <h2 style={styles.header}>Category Management</h2>

      {/* Form */}
      <div style={styles.card}>
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Category Name"
            value={categoryForm.name}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = "#9B7EBD")}
            onBlur={(e) => (e.target.style.borderColor = "#D4BEE4")}
          />
          <textarea
            placeholder="Description"
            value={categoryForm.description}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, description: e.target.value })
            }
            rows="3"
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = "#9B7EBD")}
            onBlur={(e) => (e.target.style.borderColor = "#D4BEE4")}
          />
          <button
            type="submit"
            style={styles.buttonPrimary}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#3B1E54")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#9B7EBD")}
          >
            {categoryForm.id ? "Update" : "Create"}
          </button>
          {categoryForm.id && (
            <button
              type="button"
              style={styles.buttonSecondary}
              onClick={() => setCategoryForm({ name: "", description: "", id: null })}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#9B7EBD")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#D4BEE4")}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <Loader />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id} style={styles.rowHover}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{category.name}</td>
                <td style={styles.td}>{category.description || "N/A"}</td>
                <td style={styles.td}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <IconButton
                      style={{ ...styles.actionButton, ...styles.editButton }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#3B1E54")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#9B7EBD")}
                      onClick={() => handleEdit(category)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#D32F2F")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#A94A4A")}
                      onClick={() => deleteCategory(category.id)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryList;