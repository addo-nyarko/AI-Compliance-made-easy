/* === In frontend/src/pages/Scan.js === */

import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Modal, Form, Spinner, Card, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import './Scan.css';

function Scan() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [formLoading, setFormLoading] = useState(true);
    const [formError, setFormError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState('');
    const [conversationState, setConversationState] = useState(null);
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const chatBodyRef = useRef(null);

    useEffect(() => {
        setFormLoading(true);
        axios.get('https://ai-compliance-made-easy.onrender.com/api/questions')
            .then(response => {
                setQuestions(response.data);
                const initialAnswers = {};
                response.data.forEach(q => { initialAnswers[q.id] = ''; });
                setAnswers(initialAnswers);
                setFormError(''); // Clear previous errors on success
            })
            .catch(err => {
                setFormError('Failed to load questions. The backend may be starting up. Please try again in a moment.');
            })
            .finally(() => {
                setFormLoading(false);
            });
    }, []);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [conversationState]);

    const handleAnswerChange = (questionId, answer) => setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    const handleStartConversation = async () => {
        setShowModal(true);
        setChatLoading(true);
        setChatError('');
        setIsComplete(false);
        setConversationState(null);

        try {
            const response = await axios.post('https://ai-compliance-made-easy.onrender.com/api/conversation', {
                messages: [], answered_questions: [], current_question_index: 0
            });
            setConversationState(response.data.updated_state);
        } catch (err) {
            setChatError('Failed to start the conversation. The backend may be starting up. Please check your connection or try again later.');
        } finally {
            setChatLoading(false);
        }
    };

    const handleSendMessage = async e => {
        e.preventDefault();
        if (!currentUserMessage.trim()) return;

        setChatLoading(true);
        setChatError('');
        const stateToSend = { ...conversationState, messages: [...conversationState.messages, { role: 'user', content: currentUserMessage }]};
        setCurrentUserMessage('');

        try {
            const response = await axios.post('https://ai-compliance-made-easy.onrender.com/api/conversation', stateToSend);
            setConversationState(response.data.updated_state);
            if (response.data.is_complete) setIsComplete(true);
        } catch (err) {
            setChatError('Error communicating with the assistant. Please try sending your message again.');
        } finally {
            setChatLoading(false);
        }
    };
    
    const handleCloseChat = () => setShowModal(false);

    return (
        <Container className="my-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <Tabs defaultActiveKey="chat" id="scan-options-tabs" className="mb-3" fill>
                        <Tab eventKey="chat" title="Chat with AI Assistant">
                            <div className="text-center p-4">
                                <h3>Don't Understand the Technical Jargon?</h3>
                                <p>Let our AI assistant guide you through the assessment with a simple conversation.</p>
                                <Button variant="primary" size="lg" onClick={handleStartConversation}>
                                    Start Conversational Assessment
                                </Button>
                            </div>
                        </Tab>
                        <Tab eventKey="manual" title="Manual Questionnaire">
                            <div className="p-3">
                                {formLoading && <div className="text-center"><Spinner animation="border" /><span> Loading questions...</span></div>}
                                {formError && <Alert variant="danger">{formError}</Alert>}
                                {questions.length > 0 && (
                                    <Form>
                                        {questions.map((q, index) => (
                                            <Card key={q.id} className="mb-3">
                                                <Card.Body>
                                                    <Card.Title as="h6">{index + 1}. {q.question}</Card.Title>
                                                    <Form.Group>
                                                        {q.options.map(opt => (
                                                            <Form.Check key={opt} type="radio" id={`q-${q.id}-${opt}`} label={opt} name={`q-${q.id}`} value={opt} onChange={e => handleAnswerChange(q.id, e.target.value)} checked={answers[q.id] === opt} />
                                                        ))}
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </Form>
                                )}
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>

            {/* Chatbot Modal */}
            <Modal show={showModal} onHide={handleCloseChat} size="lg" backdrop="static">
                <Modal.Header closeButton={!chatLoading}>
                    <Modal.Title>Compliance Companion</Modal.Title>
                </Modal.Header>
                <Modal.Body className="chat-body" ref={chatBodyRef}>
                    {chatError && <Alert variant="danger">{chatError}</Alert>}
                    {!conversationState && chatLoading && (
                        <div className="text-center p-5"><Spinner animation="border" /><span> Starting conversation...</span></div>
                    )}
                    {conversationState && conversationState.messages.map((msg, i) => (
                        <div key={i} className={`message-container ${msg.role}`}><div className="message-bubble">{msg.content}</div></div>
                    ))}
                    {conversationState && chatLoading && (
                        <div className="message-container assistant"><div className="message-bubble"><Spinner as="span" animation="grow" size="sm" /> Thinking...</div></div>
                    )}
                    {isComplete && <Alert variant="success" className="mt-3">Assessment complete! You may now close this window.</Alert>}
                </Modal.Body>
                {!isComplete && (
                    <Modal.Footer>
                        <Form onSubmit={handleSendMessage} className="w-100">
                            <Form.Control type="text" placeholder="Type your answer..." value={currentUserMessage} onChange={e => setCurrentUserMessage(e.target.value)} disabled={chatLoading || !conversationState} />
                        </Form>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
}

export default Scan;
