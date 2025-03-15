import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [formCounts, setFormCounts] = useState({ T1: 0, T2: 0, T3: 0, T4: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }

      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        let isAdmin = false;
        let adminName;

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.email === currentUser.email) {
            isAdmin = true;
            adminName = `${userData.firstName} ${userData.lastName}`;
          }
        });

        if (!isAdmin) {
          await signOut(auth);
          navigate("/");
          return;
        }

        setUser({ ...currentUser, name: adminName });

        const analyticsRef = doc(db, "analytics", "formCount");
        const analyticsSnap = await getDoc(analyticsRef);

        if (analyticsSnap.exists()) {
          setFormCounts(analyticsSnap.data());
        }

      } catch (error) {
        console.error("Error checking admin access:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate("/");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <nav className="navbar">
        <h1 className="welcome">{user.name}</h1>
        <h1 className="title">Reports</h1>
        <div className="logout-container">
        <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <FaSignOutAlt className="logout-icon" /> Logout
          </button>
        </div>
      </nav>

      <div className="reports-container">
        <div className="card" id="forms-status">
          <h2 className="card-title">Forms</h2>
          <table className="forms-table">
            <thead>
              <tr>
                <th>Treatment Level</th>
                <th>Treatment Description</th>
                <th>Count</th>
                <th>Link</th>
                <th>Generate Report</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Treatment Level 1</td>
                <td>Free-Labeling (Local)</td>
                <td>{formCounts.T1 || 0}</td>
                <td><a href="/fyhczhbuwq">Go to the form</a></td>
                <td style={{ color: "gray" }}>Coming soon</td>
              </tr>
              <tr>
                <td>Treatment Level 2</td>
                <td>Free-Labeling (Foreign)</td>
                <td>{formCounts.T2 || 0}</td>
                <td><a href="/rqyckfzpjn">Go to the form</a></td>
                <td style={{ color: "gray" }}>Coming soon</td>
              </tr>
              <tr>
                <td>Treatment Level 3</td>
                <td>Discrete Labeling (Local)</td>
                <td>{formCounts.T3 || 0}</td>
                <td><a href="/mwzspvqvva">Go to the form</a></td>
                <td style={{ color: "gray" }}>Coming soon</td>
              </tr>
              <tr>
                <td>Treatment Level 4</td>
                <td>Discrete Labeling (Foreign)</td>
                <td>{formCounts.T4 || 0}</td>
                <td><a href="/lgrpyjbylo">Go to the form</a></td>
                <td style={{ color: "gray" }}>Coming soon</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bottom-navbar">
        <button onClick={() => scrollToSection("forms-table")}>
          <FaClipboardList />
          Forms
        </button>
        <button className="logout-btn-navbar" onClick={() => setShowLogoutModal(true)}>
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Reports;