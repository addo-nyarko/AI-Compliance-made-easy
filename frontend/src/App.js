/* === PASTE THIS ENTIRE CODE BLOCK INTO frontend/src/App.js === */

import React from 'react';
// CORRECT: We are importing HashRouter and naming it Router
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your components and pages
import AppNavbar from './components/AppNavbar';
import Home from './pages/Home';
import Scan from './pages/Scan';
import ProjectDetail from './pages/ProjectDetail';
import './App.css';

function App() {
  return (
    // CORRECT: This <Router> now correctly refers to HashRouter
    <Router>
      <div className="App">
        <AppNavbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
