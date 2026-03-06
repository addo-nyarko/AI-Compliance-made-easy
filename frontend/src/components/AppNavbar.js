    // In frontend/src/components/AppNavbar.js
    import React from 'react';
    import { Navbar, Nav, Container, Button } from 'react-bootstrap';
    import { LinkContainer } from 'react-router-bootstrap';

    function AppNavbar() {
      return (
        <Navbar bg="light" variant="light" expand="lg" className="border-bottom">
          <Container>
            <LinkContainer to="/">
              <Navbar.Brand><strong>KODEX</strong> Compliance</Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <LinkContainer to="/scan">
                  <Nav.Link>Run Scan</Nav.Link>
                </LinkContainer>
                <Nav.Link href="#example">Example</Nav.Link>
              </Nav>
              <Nav>
                <Button variant="outline-secondary" className="me-2">Sign in</Button>
                <LinkContainer to="/scan">
                  <Button variant="primary">Start Scan</Button>
                </LinkContainer>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
    }
    export default AppNavbar;
