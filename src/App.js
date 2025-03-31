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

function App() {
  useEffect(() => {
    document.title = "Examining the Interaction Effect of Language and Racial Categorization on Emotion Perception";
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/XfN4pu0g3lSGXCbwqW4U" element={<T1Form />} />
        <Route path="/h9BVtFjY5EpI3s2Jj1eA" element={<T2Form />} />
        <Route path="/DNf1XbrdcE5vgxiEmv13" element={<T3Form />} />
        <Route path="/lcSkgVKARcdUIRUw25j9" element={<T4Form />} />
        <Route path="/time-up" element={<TimeUp />} />
        <Route path="/7q7fbmQylOjPCmnJzFO5" element={<RForm />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
