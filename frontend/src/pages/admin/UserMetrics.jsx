import React, { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import Loader from "../../components/Layout/Loader";
// import "./UserMetrics.css"; // Optional: For styling

const UserMetrics = ({ userId }) => {
  const [userMetrics, setUserMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/user/${userId}/metrics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user metrics");
        }

        const data = await response.json();
        setUserMetrics(data.metrics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, [userId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const calculateBMI = (weight, height) => {
    // BMI formula: weight (kg) / (height (m) * height (m))
    return (weight / ((height / 100) * (height / 100))).toFixed(2);
  };

  return (
    <div className="user-metrics">
      <h2>User Metrics</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
            <th>Height (cm)</th>
            <th>BMI</th>
            <th>Improvement</th>
          </tr>
        </thead>
        <tbody>
          {userMetrics.map((metric, index) => {
            const bmi = calculateBMI(metric.weight, metric.height);
            const previousBMI =
              index > 0
                ? calculateBMI(userMetrics[index - 1].weight, userMetrics[index - 1].height)
                : null;
            const improvement = previousBMI ? (previousBMI - bmi).toFixed(2) : "N/A";

            return (
              <tr key={metric._id}>
                <td>{new Date(metric.created_at).toLocaleDateString()}</td>
                <td>{metric.weight}</td>
                <td>{metric.height}</td>
                <td>{bmi}</td>
                <td
                  style={{
                    color:
                      improvement === "N/A"
                        ? "black"
                        : improvement > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {improvement}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserMetrics;