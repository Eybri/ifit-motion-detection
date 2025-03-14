import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../../components/Layout/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "../../../utils/auth";

// Import Google Font
const fontFamily = "'Poppins', sans-serif";

const styles = {
  container: {
    padding: "24px",
    paddingTop: "80px", // Added padding to prevent overlap with header
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: fontFamily, // Apply Google Font
  },
  header: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#2c3e50",
    textAlign: "center",
    letterSpacing: "0.5px",
  },
  card: {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
    fontFamily: fontFamily, // Apply Google Font
  },
  inputFocus: {
    borderColor: "#4CAF50",
  },
  buttonPrimary: {
    backgroundColor: "#4CAF50",
    color: "#fff",
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
    backgroundColor: "#45a049",
  },
  buttonSecondary: {
    backgroundColor: "#f0f0f0",
    color: "#333",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s ease",
    fontFamily: fontFamily, // Apply Google Font
  },
  buttonSecondaryHover: {
    backgroundColor: "#e0e0e0",
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
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "16px",
    textAlign: "left",
    fontWeight: "600",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #eee",
    color: "#555",
  },
  rowHover: {
    backgroundColor: "#f9f9f9",
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
    backgroundColor: "#ffc107",
    color: "#fff",
  },
  editButtonHover: {
    backgroundColor: "#e0a800",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "#fff",
  },
  deleteButtonHover: {
    backgroundColor: "#d32f2f",
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
            onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
          <textarea
            placeholder="Description"
            value={categoryForm.description}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, description: e.target.value })
            }
            rows="3"
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
          <button
            type="submit"
            style={styles.buttonPrimary}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
          >
            {categoryForm.id ? "Update" : "Create"}
          </button>
          {categoryForm.id && (
            <button
              type="button"
              style={styles.buttonSecondary}
              onClick={() => setCategoryForm({ name: "", description: "", id: null })}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
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
                  <button
                    style={{ ...styles.actionButton, ...styles.editButton }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#e0a800")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#ffc107")}
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#d32f2f")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
                    onClick={() => deleteCategory(category.id)}
                  >
                    Delete
                  </button>
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