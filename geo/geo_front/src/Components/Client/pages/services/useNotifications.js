import { useEffect, useState } from 'react';
import api from '../services/axios';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const res = await api.get('/notifications');
    setNotifications(res.data);
  };

  const markAsRead = async (id) => {
    await api.post(`/notifications/${id}/mark-as-read`);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, markAsRead, fetchNotifications };
}
