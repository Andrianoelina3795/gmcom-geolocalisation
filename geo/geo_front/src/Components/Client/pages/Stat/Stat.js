import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Assure-toi d'avoir installé axios
import './Stat.css';

const Stat = () => {
  const [stats, setStats] = useState({
    positions: 0,
    messages: 0,
    zone: 'Chargement...'
  });

  useEffect(() => {
    const token = localStorage.getItem('token'); // ou sessionStorage selon ton choix

    axios.get('http://localhost:8000/api/statis', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      const data = response.data;
      setStats({
        positions: data.positions,
        messages: data.unreadMessages,
        zone: data.lastZone
      });
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des stats :', error);
    });
  }, []);

  return (
    <div className="stats-section mt-4 mb-4">
      <div className="stat-card">
        <h4>Positions envoyées: {stats.positions}</h4>
      </div>
      <div className="stat-card">
        <h4>Messages non lus: {stats.messages}</h4>
      </div>
      <div className="stat-card">
        <h4>Dernière zone: {stats.zone}</h4>
      </div>
    </div>
  );
};

export default Stat;
