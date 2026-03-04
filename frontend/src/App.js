/* === PASTE THIS ENTIRE CODE BLOCK INTO frontend/src/App.js === */

import React from 'react';
// Correctly import HashRouter and other components
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your components and pages
import AppNavbar from './components/AppNavbar';
// REMOVED: No longer importing the missing 'Home' page
import Scan from './pages/Scan';
import ProjectDetail from './pages/ProjectDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AppNavbar />
        <main>
          <Routes>
            {/* CORRECT: The root path "/" now directly loads the Scan component */}
            <Route path="/" element={<Scan />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
