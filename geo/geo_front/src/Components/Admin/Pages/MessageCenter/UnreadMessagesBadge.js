
import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Badge global affiché dans le header pour montrer le nombre de messages non lus.
 */
const UnreadMessagesBadge = () => {
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchTotalUnread = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users-with-unread');
      const total = res.data.reduce((sum, u) => sum + u.unread, 0);
      setTotalUnread(total);
    } catch (err) {
      console.error('Erreur badge global:', err);
    }
  };

  useEffect(() => {
    fetchTotalUnread();
    const interval = setInterval(fetchTotalUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <a href="/messagerie" className="relative inline-block">
        <span className="material-icons text-gray-700 text-2xl">mail</span>
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">
            {totalUnread}
          </span>
        )}
      </a>
    </div>
  );
};

export default UnreadMessagesBadge;
