import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Renderer from "./pages/Renderer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/renderer" element={<Renderer />} />
      </Routes>
    </Router>
  );
};

export default App;
