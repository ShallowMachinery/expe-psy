import { useState, useEffect } from "react";
import './App.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import TimeUp from "./pages/TimeUp";
import T1Form from "./forms/t1";
import T2Form from "./forms/t2";
import T3Form from "./forms/t3";
import T4Form from "./forms/t4";
import RForm from "./forms/rForm";
import NotFound from "./pages/notFound";
import Response from "./pages/reports/response";
import alreadySubmitted from "./pages/alreadySubmitted";
import { dotSpinner } from 'ldrs';

dotSpinner.register();

function App() {
  const [haveSubmitted, setHaveSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const submitted = localStorage.getItem("submitted") !== null;
    setHaveSubmitted(submitted);
  }, []);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.title = "Examining the Interaction Effect of Language and Racial Categorization on Emotion Perception";
  }, []);

  if (loading) {
    return <div className="loading-spinner">
      <l-dot-spinner size="70" speed="0.7" color="black" />
      <p>Loading...</p>
    </div >;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/reports"
          element={
            isAuthenticated ? <Reports /> : <Navigate to="/" />
          }
        />
        {/* Form closed
        <Route path="/XfN4pu0g3lSGXCbwqW4U" element={<T1Form />} />
        <Route path="/h9BVtFjY5EpI3s2Jj1eA" element={<T2Form />} />
        <Route path="/DNf1XbrdcE5vgxiEmv13" element={<T3Form />} />
        <Route path="/lcSkgVKARcdUIRUw25j9" element={<T4Form />} />
        <Route path="/time-up" element={<TimeUp />} />
        <Route path="/7q7fbmQylOjPCmnJzFO5" element={<RForm />} />
        <Route path="/already-submitted" element={haveSubmitted ? <alreadySubmitted /> : <NotFound />} />
        */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
