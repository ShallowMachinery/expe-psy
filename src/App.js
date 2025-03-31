import { useEffect } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import TimeUp from "./pages/TimeUp";
import T1Form from "./forms/t1";
import T2Form from "./forms/t2";
import T3Form from "./forms/t3";
import T4Form from "./forms/t4";
import RForm from "./forms/rForm";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  useEffect(() => {
    document.title = "Examining the Interaction Effect of Language and Racial Categorization on Emotion Perception";
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/fyhczhbuwq" element={<T1Form />} />
        <Route path="/rqyckfzpjn" element={<T2Form />} />
        <Route path="/mwzspvqvva" element={<T3Form />} />
        <Route path="/lgrpyjbylo" element={<T4Form />} />
        <Route path="/time-up" element={<TimeUp />} />
        <Route path="/form" element={<RForm />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
