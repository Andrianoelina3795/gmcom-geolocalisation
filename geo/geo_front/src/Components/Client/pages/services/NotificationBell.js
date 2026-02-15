import React from 'react';
import useNotifications from '../services/useNotifications';

function NotificationBell() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div style={{ position: 'relative' }}>
      <button>
        🔔
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '0.3rem',
            fontSize: '0.8rem'
          }}>
            {notifications.length}
          </span>
        )}
      </button>
      <div style={{ position: 'absolute', top: '2rem', background: '#fff', border: '1px solid #ccc', width: '300px', zIndex: 99 }}>
        {notifications.map(notif => (
          <div key={notif.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <p><strong>{notif.data.sender_name}</strong> vous a envoyé un message :</p>
            <p>{notif.data.content}</p>
            <button onClick={() => markAsRead(notif.id)} style={{ fontSize: '0.8rem' }}>
              Marquer comme lu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationBell;
