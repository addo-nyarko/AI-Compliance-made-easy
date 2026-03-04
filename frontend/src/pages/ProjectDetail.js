/* === PASTE THIS ENTIRE CODE BLOCK INTO frontend/src/pages/ProjectDetail.js === */

import React, { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';

function ProjectDetail() {
  const { id } = useParams(); // Assumes you get project ID from the URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. The 'loadData' function is now wrapped in useCallback.
  // This tells React that the function itself won't change unless its own
  // dependencies (like the 'id' from the URL) change.
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Using an example API endpoint structure
      const response = await axios.get(`https://ai-compliance-made-easy.onrender.com/api/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      setError('Failed to load project details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]); // The 'id' is a dependency of this function

  // 2. The 'useEffect' hook now correctly includes 'loadData' in its dependency array.
  // This satisfies the React rule and ensures the effect re-runs if the 'id' changes.
  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Project not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h2">{project.title || 'Project Details'}</Card.Header>
        <Card.Body>
          <Card.Text>
            {project.description || 'No description available.'}
          </Card.Text>
          {/* Add more project details here as needed */}
          <Button as={Link} to="/projects" variant="primary">Back to Projects</Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ProjectDetail;
