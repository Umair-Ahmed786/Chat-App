import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import UsernameModal from './UserName';
import UserList from './UserList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import '../Styles/ChatApp.css';

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [privateTo, setPrivateTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:4000');

    // Socket event handlers
    socketRef.current.on('init', (data) => {
      setUserId(data.userId);
      setUsername(data.defaultUsername);
      setMessages(data.messageHistory);
    });

    // ... other socket listeners (same as before)

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleSendMessage = (message) => {
    if (privateTo) {
      socketRef.current.emit('private-message', {
        to: privateTo.id,
        message
      });
    } else {
      socketRef.current.emit('group-message', message);
    }
  };

  return (
    <div className="chat-app">
      {!username ? (
        <UsernameModal onSetUsername={setUsername} />
      ) : (
        <>
          <div className="chat-header">
            <h1>Chat App</h1>
            <div className="user-info">
              <span>Logged in as: <strong>{username}</strong></span>
            </div>
          </div>

          <div className="chat-main">
            <UserList 
              users={onlineUsers.map(u => ({
                ...u,
                selected: privateTo?.id === u.id
              }))}
              currentUserId={userId}
              onSelectUser={setPrivateTo}
            />

            <div className="chat-content">
              <MessageList 
                messages={messages} 
                currentUserId={userId} 
              />
              
              <MessageInput
                onSendMessage={handleSendMessage}
                currentPrivateChat={privateTo}
                onTyping={(isTyping) => {
                  socketRef.current.emit(isTyping ? 'typing' : 'stop-typing');
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}