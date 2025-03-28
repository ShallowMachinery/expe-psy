import { useEffect } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConsentForm from "./forms/consentForm";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import TimeUp from "./pages/TimeUp";

function App() {
  useEffect(() => {
    document.title = "Examining the Interaction Effect of Language and Racial Categorization on Emotion Perception";
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/fyhczhbuwq" element={<ConsentForm />} />
        <Route path="/rqyckfzpjn" element={<ConsentForm />} />
        <Route path="/mwzspvqvva" element={<ConsentForm />} />
        <Route path="/lgrpyjbylo" element={<ConsentForm />} />
        <Route path="/time-up" element={<TimeUp />} />
      </Routes>
    </Router>
  );
}

export default App;
