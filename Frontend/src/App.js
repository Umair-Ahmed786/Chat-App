import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Modal, Button, Form, Container, Row, Col, 
  ListGroup, Badge, Alert, InputGroup, FormControl 
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('http://localhost:4000');

function App() {
  // State
  const [myId, setMyId] = useState('');
  const [username, setUsername] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [privateTo, setPrivateTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [tempUsername, setTempUsername] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Effects
  useEffect(() => {
    socket.on('init', ({ userId, defaultUsername, messageHistory }) => {
      setMyId(userId);
      setUsername(defaultUsername);
      setMessages(messageHistory);
    });

    socket.on('username-set', (confirmedUsername) => {
      setUsername(confirmedUsername);
      setShowUsernameModal(false);
    });

    socket.on('online-users', (users) => setOnlineUsers(users));
    socket.on('group-message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('private-message', (msg) => setMessages(prev => [...prev, msg]));

    socket.on('user-typing', (username) => 
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username])
    );

    socket.on('user-stopped-typing', (username) => 
      setTypingUsers(prev => prev.filter(u => u !== username))
    );

    return () => {
      socket.off('init');
      socket.off('username-set');
      socket.off('online-users');
      socket.off('group-message');
      socket.off('private-message');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handlers
  const handleTyping = () => {
    socket.emit('typing');
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit('stop-typing'), 2000);
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const messageData = {
      message: inputMessage,
      ...(privateTo && { to: privateTo.id })
    };

    privateTo 
      ? socket.emit('private-message', messageData)
      : socket.emit('group-message', inputMessage);
    
    setInputMessage('');
    socket.emit('stop-typing');
  };

  const handleSetUsername = () => {
    if (tempUsername.trim()) {
      socket.emit('set-username', tempUsername.trim());
    } else {
      setShowUsernameModal(false);
    }
  };

  const formatTime = (timestamp) => 
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Username Modal */}
      <Modal 
        show={showUsernameModal} 
        centered
        backdrop="static"
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        <Modal.Header style={{ borderBottom: 'none' }}>
          <Modal.Title>Welcome to Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter your username..."
            onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
            style={{ marginBottom: '1rem' }}
            autoFocus
          />
          <Button 
            variant="primary" 
            onClick={handleSetUsername}
            style={{ width: '100%' }}
          >
            Join Chat
          </Button>
        </Modal.Body>
      </Modal>

      {/* Chat Header */}
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col>
              <h4 style={{ margin: 0 }}>Chatty App</h4>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Badge bg="light" text="dark">
                {username || 'Guest'}
              </Badge>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Chat Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Online Users */}
        <div style={{
          width: '250px',
          backgroundColor: 'white',
          borderRight: '1px solid #dee2e6',
          overflowY: 'auto',
          padding: '1rem'
        }}>
          <h5 style={{ 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #eee'
          }}>
            Online ({onlineUsers.length})
          </h5>
          <ListGroup variant="flush">
            {onlineUsers.map(user => (
              <ListGroup.Item 
                key={user.id}
                action
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: privateTo?.id === user.id ? '#e9f7ef' : 'inherit',
                  borderLeft: privateTo?.id === user.id ? '3px solid #28a745' : 'none'
                }}
                onClick={() => setPrivateTo(user)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{user.username}</span>
                  {user.id === myId && <Badge bg="secondary">You</Badge>}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            backgroundColor: '#f9f9f9'
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '75%',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: msg.type === 'private' ? '#e3f2fd' : 'white',
                  border: msg.type === 'private' ? '1px solid #bbdefb' : '1px solid #ddd',
                  marginLeft: msg.from === myId ? 'auto' : '0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {msg.fromUsername}
                    {msg.type === 'private' && (
                      <span style={{ 
                        fontSize: '0.8rem',
                        color: '#666',
                        marginLeft: '0.5rem'
                      }}>
                        {msg.from === myId 
                          ? `→ ${onlineUsers.find(u => u.id === msg.to)?.username}`
                          : '→ You'}
                      </span>
                    )}
                  </span>
                  <span style={{ color: '#666' }}>{formatTime(msg.timestamp)}</span>
                </div>
                <div>{msg.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ 
            padding: '1rem',
            backgroundColor: 'white',
            borderTop: '1px solid #dee2e6'
          }}>
            {typingUsers.length > 0 && (
              <div style={{ 
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                color: '#666',
                fontStyle: 'italic'
              }}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {privateTo && (
              <Alert variant="light" style={{ 
                padding: '0.5rem',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Private to: <strong>{privateTo.username}</strong></span>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => setPrivateTo(null)}
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  ×
                </Button>
              </Alert>
            )}

            <InputGroup>
              <FormControl
                placeholder={privateTo ? `Message ${privateTo.username}...` : "Message everyone..."}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{ borderRight: 'none' }}
              />
              <Button 
                variant="primary" 
                onClick={sendMessage}
                style={{ borderLeft: 'none' }}
              >
                Send
              </Button>
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;