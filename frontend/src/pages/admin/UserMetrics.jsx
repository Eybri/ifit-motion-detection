import React, { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import Loader from "../../components/Layout/Loader";

const UserMetrics = ({ userId }) => {
  const [userMetrics, setUserMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/leaderboard?user_id=${userId}&fetch_all=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user metrics");
        }

        const data = await response.json();
        setUserMetrics(data);
      } catch (error) {
        console.error("Error fetching user metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, [userId]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h2>User Metrics</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Weight (kg)</th>
            <th>Height (cm)</th>
            <th>BMI</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {userMetrics.map((metric, index) => {
            const bmi = (metric.weight / ((metric.height / 100) ** 2)).toFixed(2);
            return (
              <tr key={index}>
                <td>{metric.name}</td>
                <td>{metric.email}</td>
                <td>{metric.weight}</td>
                <td>{metric.height}</td>
                <td>{bmi}</td>
                <td>{new Date(metric.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserMetrics;