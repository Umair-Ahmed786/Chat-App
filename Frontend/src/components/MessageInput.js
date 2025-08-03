import { useState, useEffect, useRef } from 'react';

export default function MessageInput({ 
  onSendMessage, 
  currentPrivateChat,
  onTyping 
}) {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    // Notify others when typing
    if (message) {
      onTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else {
      onTyping(false);
    }

    return () => clearTimeout(typingTimeoutRef.current);
  }, [message, onTyping]);

  return (
    <div className="message-input-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={currentPrivateChat 
          ? `Message ${currentPrivateChat.username}...` 
          : "Message everyone..."
        }
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}