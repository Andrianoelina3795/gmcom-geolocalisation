import React from 'react';
import useNotification from '../services/useNotification';

const NotificationList = () => {
  const { notifications, markAsRead } = useNotification();

  return (
    <ul>
      {notifications.map((notif) => (
        <li key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.data.message}
          {notif.read_at ? '' : ' (Non lue)'}
        </li>
      ))}
    </ul>
  );
};

export default NotificationList;
