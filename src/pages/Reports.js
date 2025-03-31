import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FaClipboardList, FaSignOutAlt, FaUsers, FaChartPie } from "react-icons/fa";
import { dotSpinner } from 'ldrs';
import "./reports.css";
import Forms from "./reports/forms";
import Respondents from "./reports/respondents";
import Analytics from "./reports/analytics";

dotSpinner.register();

const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1190);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [formCounts, setFormCounts] = useState({ T1: 0, T2: 0, T3: 0, T4: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [respondents, setRespondents] = useState([]);

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

        const respondentsRef = doc(db, "analytics", "respondents");
        const respondentsSnap = await getDoc(respondentsRef);

        if (respondentsSnap.exists()) {
          const respondentsData = respondentsSnap.data().list || {};
          const formattedRespondents = Object.entries(respondentsData).map(([id, details]) => ({
            id,
            name: details.name,
            course: details.course,
            yearLevel: details.yearLevel,
            section: details.section,
            treatmentLevel: details.treatmentLevel,
            status: details.status
          }));
          setRespondents(formattedRespondents);
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

  const getTreatmentText = (treatmentLevel) => {
    switch (treatmentLevel) {
      case "T1": return "Treatment Level 1 (Free-Labeling - Local/In-group)";
      case "T2": return "Treatment Level 2 (Free-Labeling - Local/Out-group)";
      case "T3": return "Treatment Level 3 (Discrete Emotion - Foreign/In-group)";
      case "T4": return "Treatment Level 4 (Discrete Emotion - Foreign/Out-group)";
      default: return "N/A";
    }
  };

  if (loading) return <>
    <nav className="navbar">
      <h1 className="welcome"></h1>
      <h1 className="title">Reports</h1>
      <div className="logout-container">
        <button className="logout-btn" disabled>
          <FaSignOutAlt className="logout-icon" /> Logout
        </button>
      </div>
    </nav>
    <div className="loading-spinner">
      <l-dot-spinner size="70" speed="0.7" color="black" />
      <p>Loading...</p>
    </div >
  </>;

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
        <Forms formCounts={formCounts} respondents={respondents} useScreenSize={useScreenSize} />
        <Respondents respondents={respondents} setRespondents={setRespondents} getTreatmentText={getTreatmentText} useScreenSize={useScreenSize} />
        <Analytics useScreenSize={useScreenSize} />
      </div>

      <div className="bottom-navbar">
        <button onClick={() => scrollToSection("forms-card")}>
          <FaClipboardList />
          Forms
        </button>
        <button onClick={() => scrollToSection("respondents-card")}>
          <FaUsers />
          Respondents
        </button>
        <button onClick={() => scrollToSection("responses-card")}>
          <FaChartPie />
          Responses
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