import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HiOutlineChatAlt2 } from 'react-icons/hi';

const MessageBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/messages/unread-count', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        setUnreadCount(response.data.unread_count);
      } catch (error) {
        console.error('Erreur lors de la récupération des messages non lus:', error.response || error);
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <div className="relative cursor-pointer">
      <HiOutlineChatAlt2 size={24} color="skyblue" className="hover:scale-110 transition-transform duration-200" />
      {/*<span>Messages non lus :</span>*/}
      <span style={{
        background: 'red',
        color: 'white',
        borderRadius: '20%',
        padding: '3px 6px',
        marginLeft: '10px'
      }}>
        {unreadCount}
      </span>
    </div>
  );
};

export default MessageBadge;
