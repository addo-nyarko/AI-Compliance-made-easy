/* === PASTE THIS ENTIRE CODE BLOCK INTO frontend/src/pages/Scan.js === */

import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Spinner, ListGroup, Card, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './Scan.css'; // We'll create this CSS file next


function Scan() {
    // === State for Manual Form ===
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [formLoading, setFormLoading] = useState(true);
    const [formError, setFormError] = useState('');

    // === State for Chatbot ===
    const [showModal, setShowModal] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState('');
    const [conversationState, setConversationState] = useState(null);
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    // --- Fetch Questions for Manual Form ---
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('https://ai-compliance-made-easy.onrender.com/api/questions');
                setQuestions(response.data);
                // Initialize answers state
                const initialAnswers = {};
                response.data.forEach(q => {
                    initialAnswers[q.id] = '';
                });
                setAnswers(initialAnswers);
            } catch (err) {
                setFormError('Failed to load questions. Please refresh the page.');
                console.error(err);
            } finally {
                setFormLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    // --- Manual Form Logic ---
    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        // Here you would add the logic to process the 'answers' object
        alert('Manual form submitted! Results:\n' + JSON.stringify(answers, null, 2));
    };

    // --- Chatbot Logic ---
    const handleStartConversation = async () => {
        setShowModal(true);
        setChatLoading(true);
        setChatError('');
        setIsComplete(false);

        const initialState = { messages: [], answered_questions: [], current_question_index: 0 };

        try {
            const response = await axios.post('https://ai-compliance-made-easy.onrender.com/api/conversation', initialState);
            setConversationState(response.data.updated_state);
        } catch (err) {
            setChatError('Failed to start the conversation. Please try again.');
        } finally {
            setChatLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentUserMessage.trim()) return;

        setChatLoading(true);
        setChatError('');

        const updatedMessages = [...conversationState.messages, { role: 'user', content: currentUserMessage }];
        const stateToSend = { ...conversationState, messages: updatedMessages };
        
        setCurrentUserMessage('');

        try {
            const response = await axios.post('https://ai-compliance-made-easy.onrender.com/api/conversation', stateToSend);
            setConversationState(response.data.updated_state);
            if (response.data.is_complete) {
                setIsComplete(true);
            }
        } catch (err) {
            setChatError('There was an error communicating with the assistant. Please try sending your message again.');
        } finally {
            setChatLoading(false);
        }
    };

    const handleCloseChat = () => {
        setShowModal(false);
        // Optional: Reset chat state if you want it to be fresh every time
        // setConversationState(null);
        // setIsComplete(false);
    };

    // --- Main Component Render ---
    return (
        <Container className="my-5">
            <Row>
                {/* --- PATH B: CHATBOT --- */}
                <Col md={12} className="mb-4">
                    <Card className="shadow-sm text-center">
                        <Card.Body>
                            <Card.Title as="h2">Don't Understand the Questions?</Card.Title>
                            <Card.Text>
                                Let our AI assistant guide you through the assessment with a simple conversation.
                            </Card.Text>
                            <Button variant="primary" size="lg" onClick={handleStartConversation}>
                                Start Conversational Assessment
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* --- PATH A: MANUAL FORM --- */}
                <Col md={12}>
                     <Card className="shadow-sm">
                        <Card.Header as="h2" className="text-center">Or, Answer Manually</Card.Header>
                        <Card.Body>
                            {formLoading && <div className="text-center"><Spinner animation="border" /></div>}
                            {formError && <Alert variant="danger">{formError}</Alert>}
                            {!formLoading && !formError && (
                                <Form onSubmit={handleManualSubmit}>
                                    {questions.map((q, index) => (
                                        <Card key={q.id} className="mb-3">
                                            <Card.Body>
                                                <Card.Title>{index + 1}. {q.question}</Card.Title>
                                                <Form.Group>
                                                    {q.options.map(opt => (
                                                        <Form.Check
                                                            key={opt}
                                                            type="radio"
                                                            id={`q-${q.id}-opt-${opt}`}
                                                            label={opt}
                                                            name={`question-${q.id}`}
                                                            value={opt}
                                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                            checked={answers[q.id] === opt}
                                                        />
                                                    ))}
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    <div className="text-center">
                                       <Button variant="success" type="submit" size="lg">Submit Manual Answers</Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                     </Card>
                </Col>
            </Row>

            {/* --- Chatbot Modal --- */}
            <Modal show={showModal} onHide={handleCloseChat} size="lg" backdrop="static">
                <Modal.Header closeButton={!chatLoading}>
                    <Modal.Title>Compliance Companion</Modal.Title>
                </Modal.Header>
                <Modal.Body className="chat-body">
                    {chatError && <Alert variant="danger">{chatError}</Alert>}
                    
                    {isComplete && conversationState ? (
                        <Card className="text-start">
                            <Card.Header as="h4">Assessment Complete</Card.Header>
                            <Card.Body>
                                <Card.Text>Here are the results from your conversation:</Card.Text>
                                <ListGroup variant="flush">
                                    {conversationState.answered_questions.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                            <strong>{item.question_text}:</strong> {item.answer}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            {conversationState && conversationState.messages.map((msg, index) => (
                                <div key={index} className={`message-container ${msg.role}`}>
                                    <div className="message-bubble">{msg.content}</div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="message-container assistant">
                                    <div className="message-bubble">
                                        <Spinner as="span" animation="grow" size="sm" /> Thinking...
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                {!isComplete && (
                    <Modal.Footer>
                        <Form onSubmit={handleSendMessage} className="w-100">
                            <Form.Control
                                type="text"
                                placeholder="Type your answer here..."
                                value={currentUserMessage}
                                onChange={(e) => setCurrentUserMessage(e.target.value)}
                                disabled={chatLoading}
                            />
                        </Form>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
}

export default Scan;
