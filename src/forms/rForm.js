import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { dotSpinner } from 'ldrs';

dotSpinner.register();

const RForm = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState("");

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
      const formCountRef = doc(db, "analytics", "formCount");
      const formCountSnap = await getDoc(formCountRef);

      if (formCountSnap.exists()) {
        const formCounts = formCountSnap.data();
        const forms = [];

        if (formCounts.T1 < 32) forms.push("/XfN4pu0g3lSGXCbwqW4U");
        if (formCounts.T2 < 32) forms.push("/h9BVtFjY5EpI3s2Jj1eA");
        if (formCounts.T3 < 32) forms.push("/DNf1XbrdcE5vgxiEmv13");
        if (formCounts.T4 < 32) forms.push("/lcSkgVKARcdUIRUw25j9");

        if (forms.length > 0) {
          const randomForm = forms[Math.floor(Math.random() * forms.length)];
          navigate(randomForm);
        } else {
          console.error("All forms have reached the limit of 32.");
          navigate("/");
        }
      } else {
        console.error("Form count data does not exist in Firebase.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching form counts:", error);
      navigate("/");
    }
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