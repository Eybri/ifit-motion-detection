import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../../components/Layout/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "../../../utils/auth";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    id: null, // For editing purposes
  });

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/categories/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories. Please try again.");
      setLoading(false);
    }
  };

  // Create or Update Category
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
        // Update existing category
        await axios.put(
          `http://localhost:5000/api/categories/${id}`,
          { name, description },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Category updated successfully!");
      } else {
        // Create new category
        await axios.post(
          "http://localhost:5000/api/categories/",
          { name, description },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Category created successfully!");
      }

      // Reset form and refresh categories
      setCategoryForm({ name: "", description: "", id: null });
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.");
    }
  };

  // Delete Category
  const deleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This will also delete all related videos."
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete the category. Please try again.");
    }
  };

  // Set form data for editing
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
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Category Management</h2>

      {/* Category Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>{categoryForm.id ? "Edit Category" : "Create Category"}</h4>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                className="form-control"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              {categoryForm.id ? "Update" : "Create"}
            </button>
            {categoryForm.id && (
              <button
                type="button"
                className="btn btn-secondary mt-2 ml-2"
                onClick={() => setCategoryForm({ name: "", description: "", id: null })}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <Loader />
      ) : (
        <div>
          {/* Categories Table */}
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>
                    <td>{category.name}</td>
                    <td>{category.description || "N/A"}</td>
                    <td>{new Date(category.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm mr-2"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteCategory(category.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
