export default function UserList({ users, currentUserId, onSelectUser }) {
    return (
      <div className="online-users">
        <h3>Online Users ({users.length})</h3>
        <ul>
          {users.map(user => (
            <li
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={user.selected ? 'active' : ''}
            >
              {user.username} {user.id === currentUserId && '(You)'}
            </li>
          ))}
        </ul>
      </div>
    );
  }