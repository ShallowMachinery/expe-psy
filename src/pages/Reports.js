import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/"); // Redirect to login if not authenticated
      } else {
        setUser(currentUser);
        fetchReports();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchReports = async () => {
    // TODO: Fetch reports from Firestore
    setReports([
      { id: 1, title: "Report 1", date: "2025-03-14" },
      { id: 2, title: "Report 2", date: "2025-03-13" },
    ]);
  };

  return (
    <div className="reports-container">
      <nav className="navbar">
        <h1>Reports</h1>
        <button onClick={() => getAuth().signOut()}>Logout</button>
      </nav>

      <div className="reports-list">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="report-card">
              <h2>{report.title}</h2>
              <p>Date: {report.date}</p>
            </div>
          ))
        ) : (
          <p>No reports available.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
