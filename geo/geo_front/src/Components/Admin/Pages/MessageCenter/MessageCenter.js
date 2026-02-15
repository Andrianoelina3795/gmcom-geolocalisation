import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../../Client/Header/Header';

const MessageCenter = ({ selectedUserId }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user?.id) {
        setCurrentUserId(user.id);
      }
    }
  }, []);

  // Charger les messages
  useEffect(() => {
    if (!currentUserId || !selectedUserId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Utilisateur non authentifié");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:8000/api/messages/${selectedUserId}?from=${currentUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
        setLoading(false);
        setError(null);
      } catch (error) {
        setError("Erreur lors du chargement des messages");
        setLoading(false);
      }
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, selectedUserId]);

  // Envoyer un nouveau message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Utilisateur non authentifié");
        return;
      }

      await axios.post(
        'http://localhost:8000/api/messages',
        {
          to: selectedUserId,
          content: newMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage('');

      // Recharge les messages après envoi
      const res = await axios.get(
        `http://localhost:8000/api/messages/${selectedUserId}?from=${currentUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data);
      setError(null);
    } catch (error) {
      setError("Erreur lors de l'envoi du message");
    }
  };

  if (loading) return <p>Chargement des messages...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className='mt-5'>
      <Header />
      <div className='container mt-5'>
        <h3>Messages avec l'utilisateur ID: {selectedUserId}</h3>
        <ul>
          {messages.length === 0 ? (
            <li>Aucun message trouvé.</li>
          ) : (
            messages.map((msg, index) => (
              <li key={index}>
                <strong>{msg.from === currentUserId ? 'Moi' : 'Lui'}:</strong> {msg.content}
              </li>
            ))
          )}
        </ul>

        <form onSubmit={handleSendMessage} className="mt-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrire un message..."
            rows={3}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageCenter;
