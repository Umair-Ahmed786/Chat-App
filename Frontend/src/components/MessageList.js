export default function MessageList({ messages, currentUserId }) {
    return (
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type} ${msg.from === currentUserId ? 'own-message' : ''}`}>
            <div className="message-header">
              <span className="sender">
                {msg.fromUsername}
                {msg.type === 'private' && (
                  <span className="private-label">
                    {msg.from === currentUserId ? ` → ${msg.toUsername}` : ' → You'}
                  </span>
                )}
              </span>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
      </div>
    );
  }