/* === PASTE THIS ENTIRE CODE BLOCK INTO frontend/src/App.js === */

import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// We are only importing components that we know exist.
import Scan from './pages/Scan';
import ProjectDetail from './pages/ProjectDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* The missing AppNavbar component has been removed. */}
        <main>
          <Routes>
            {/* The Scan component will now be the main page. */}
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
