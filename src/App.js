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
import ExperimentDone from "./pages/experimentDone";
import { dotSpinner } from 'ldrs';

dotSpinner.register();

function App() {
  const [haveSubmitted, setHaveSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [experimentDone, setExperimentDone] = useState(false);
  const [notAvailable, setNotAvailable] = useState(false);

  useEffect(() => {
    if (Date.now() > new Date("2025-04-24").getTime()) {
      setExperimentDone(true);
    }
  }, []);

  useEffect(() => {
    const submitted = localStorage.getItem("submitted") !== null;
    setHaveSubmitted(submitted);
  }, []);

  useEffect(() => {
    if (Date.now() > new Date("2025-06-01").getTime()) {
      setNotAvailable(true);
      return
    }

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
        {!notAvailable ?
          <>
            <Route path="/" element={<Home experimentDone={experimentDone} />} />
            <Route
              path="/reports"
              element={
                isAuthenticated ? <Reports experimentDone={experimentDone} /> : <Navigate to="/" />
              }
            />
            <Route path="/XfN4pu0g3lSGXCbwqW4U" element={experimentDone ? <ExperimentDone /> : <T1Form />} />
            <Route path="/h9BVtFjY5EpI3s2Jj1eA" element={experimentDone ? <ExperimentDone /> : <T2Form />} />
            <Route path="/DNf1XbrdcE5vgxiEmv13" element={experimentDone ? <ExperimentDone /> : <T3Form />} />
            <Route path="/lcSkgVKARcdUIRUw25j9" element={experimentDone ? <ExperimentDone /> : <T4Form />} />
            <Route path="/time-up" element={experimentDone ? <ExperimentDone /> : <TimeUp />} />
            <Route path="/7q7fbmQylOjPCmnJzFO5" element={experimentDone ? <ExperimentDone /> : <RForm />} />
            <Route path="/already-submitted" element={experimentDone ? <ExperimentDone /> : (haveSubmitted ? <alreadySubmitted /> : <NotFound />)} />
            <Route path="*" element={<NotFound />} />
          </> :
          <Route path="*" element={<ExperimentDone />} />
        }

      </Routes>
    </Router>
  );
}

export default App;
