    // In frontend/src/App.js
    import React from 'react';
    import { HashRouter as Router, Route, Routes } from 'react-router-dom';
    import 'bootstrap/dist/css/bootstrap.min.css';

    import AppNavbar from './components/AppNavbar'; // Restoring your Navbar
    import Landing from './pages/Landing';
    import Scan from './pages/Scan';
    import ProjectDetail from './pages/ProjectDetail';
    import './App.css';

    function App() {
      return (
        <Router>
          <div className="App">
            <AppNavbar /> {/* Your Navbar is back */}
            <main className="mt-4">
              <Routes>
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
