/* === In frontend/src/components/AppNavbar.js === */
// This is the corrected version that will not crash.

import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // We use Link directly from the main router

function AppNavbar() {
  return (
    <Navbar bg="light" variant="light" expand="lg" className="border-bottom">
      <Container>
        {/* This now uses the standard 'as' prop which is safe */}
        <Navbar.Brand as={Link} to="/"><strong>KODEX</strong> Compliance</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/scan">Run Scan</Nav.Link>
            <Nav.Link href="#example">Example</Nav.Link>
          </Nav>
          <Nav>
            <Button variant="outline-secondary" className="me-2">Sign in</Button>
            <Button as={Link} to="/scan" variant="primary">Start Scan</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
