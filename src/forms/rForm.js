import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, orderBy, runTransaction, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { dotSpinner } from 'ldrs';

dotSpinner.register();

const RForm = () => {
  const [haveSubmitted, setHaveSubmitted] = useState(false);
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState("");

  useEffect(() => {
    const submitted = localStorage.getItem("submitted") !== null;
    setHaveSubmitted(submitted);
  }, []);

  useEffect(() => {
    const updateImagePath = () => {
      setImagePath(window.innerWidth > 768 ? "/images/splash/desktop.png" : "/images/splash/mobile.png");
    };

    updateImagePath();
    window.addEventListener("resize", updateImagePath);

    return () => window.removeEventListener("resize", updateImagePath);
  }, []);

  useEffect(() => {
    if (showSplash) {
      document.body.style.backgroundColor = "#feebdd";
    } else {
      document.body.style.backgroundColor = "#f4f4f4";
    }

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [showSplash]);

  const fetchFormCountsAndNavigate = async () => {
    setLoading(true);
    try {
      const respondentsRef = doc(db, "analytics", "respondents");
      const respondentsSnap = await getDoc(respondentsRef);
      const formCountRef = doc(db, "analytics", "formCount");
      const formCountSnap = await getDoc(formCountRef);

      if (!formCountSnap.exists()) {
        throw new Error("Form count data does not exist in Firebase.");
      }

      const formCounts = formCountSnap.data();

      let treatmentCounts = {};
      if (respondentsSnap.exists()) {
        const respondentsData = respondentsSnap.data().list || {};
        const rawRespondents = Object.entries(respondentsData).map(([id, details]) => ({
          id,
          name: details.name,
          course: details.course,
          yearLevel: details.yearLevel,
          section: details.section,
          treatmentLevel: details.treatmentLevel,
          status: details.status,
        }));

        treatmentCounts = rawRespondents.reduce((acc, respondent) => {
          if (respondent.treatmentLevel) {
            acc[respondent.treatmentLevel] = (acc[respondent.treatmentLevel] || 0) + 1;
          }
          return acc;
        }, {});
      }

      const forms = [
        { id: "/h9BVtFjY5EpI3s2Jj1eA", type: "T2", count: treatmentCounts.T2 || 0 },
        { id: "/DNf1XbrdcE5vgxiEmv13", type: "T3", count: treatmentCounts.T3 || 0 },
        { id: "/lcSkgVKARcdUIRUw25j9", type: "T4", count: treatmentCounts.T4 || 0 },
      ].filter((form) => formCounts[form.type] < 32);
  
      if (forms.length === 0) {
        console.error("No available forms to assign.");
        navigate("/");
        return;
      }

      const lastAssignedRef = doc(db, "analytics", "lastAssignedForm");
      const lastAssignedSnap = await getDoc(lastAssignedRef);
      let lastAssignedType = lastAssignedSnap.exists() ? lastAssignedSnap.data().type : null;
      
      const formOrder = forms.map((form) => form.type);
      const lastIndex = formOrder.indexOf(lastAssignedType);
      const nextIndex = (lastIndex + 1) % formOrder.length;
      const nextFormType = formOrder[nextIndex];

      const selectedForm = forms.find((form) => form.type === nextFormType);

      if (selectedForm) {
        await setDoc(lastAssignedRef, { type: nextFormType });
        const sessionId = `session_${Date.now()}`;
        const platform = navigator.userAgentData?.platform || navigator.userAgent;
  
        const notificationsRef = doc(db, "analytics", "notifications");
        await setDoc(
          notificationsRef,
          {
            [sessionId]: {
              message: `Started answering ${selectedForm.type}`,
              timestamp: new Date().toISOString(),
              name: null,
              browser: navigator.userAgent,
              platform: platform,
            },
          },
          { merge: true }
        );
  
        navigate(selectedForm.id, {
          state: {
            sessionId: sessionId,
          },
        });
      } else {
        console.error("No available forms to assign.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching form counts:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (haveSubmitted) {
    return (
      <div className="parent-form-container">
        <div className="container">
          <h2 style={{ marginBottom: "0" }}>Sorry!</h2>
          <p style={{ textAlign: "center", marginBottom: "10px" }}>You have already submitted your response. Thank you for participating!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="splash-container">
      {showSplash ? (
        <div className="splash-screen">
          <img src={imagePath} alt="Splash" className="splash-image" />
          <button
            className="get-started-btn"
            onClick={() => { setShowSplash(false); fetchFormCountsAndNavigate(); }}
          >
            Get started
          </button>
        </div>
      ) : (
        <div className="loading-spinner">
          <l-dot-spinner size="70" speed="0.7" color="black" />
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default RForm;