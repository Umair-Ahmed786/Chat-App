import { useState } from 'react';

export default function UserName({ onSetUsername }) {
  const [tempUsername, setTempUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetUsername(tempUsername.trim() || `User-${Math.floor(Math.random() * 1000)}`);
  };

  return (
    <div className="modal-overlay">
      <form className="username-modal" onSubmit={handleSubmit}>
        <h2>Choose Your Username</h2>
        <input
          type="text"
          value={tempUsername}
          onChange={(e) => setTempUsername(e.target.value)}
          placeholder="Enter username..."
          autoFocus
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
}