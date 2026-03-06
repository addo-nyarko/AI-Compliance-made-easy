// In frontend/src/App.js
// FINAL VERSION - This code matches your project structure.

import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing the pages that exist in your project
import Landing from './pages/Landing'; // Using your Landing page as the homepage
import Scan from './pages/Scan';
import ProjectDetail from './pages/ProjectDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* No AppNavbar, as it does not exist in your project */}
        <main>
          <Routes>
            {/* The root path "/" now correctly loads your Landing component */}
            <Route path="/" element={<Landing />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
