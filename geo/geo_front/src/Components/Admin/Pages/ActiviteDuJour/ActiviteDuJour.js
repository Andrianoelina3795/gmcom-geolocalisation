import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ActiviteDuJour.css'; // si tu veux styliser

const ActiviteDuJour = () => {
  const [data, setData] = useState({
    produits: [],
    agents: [],
    coordonnees: [],
    clients: [],
  });

  useEffect(() => {
    axios.get('http://localhost:8000/api/getTodayActivities')
      .then(res => setData(res.data))
      .catch(() => console.log("Erreur lors du chargement des données"));
  }, []);

  return (
    <div className="activite-container">
      <h3 className='mt-3'>Résumé des activités d’aujourd’hui</h3> <hr className='mt-3'/>

      <section className='mt-3'>
        <h5>- Produits ajoutés:</h5>
        {data.produits.length > 0 ? (
          <ul>{data.produits.map(prod => <li key={prod.id}>{prod.nom_produit}, {prod.montant_produit} Ar</li>)}</ul>
        ) : <p>Aucun produit ajouté.</p>}
      </section>

      <section>
        <h5>- Agents créés:</h5>
        {data.agents.length > 0 ? (
          <ul>{data.agents.map(agent => <li key={agent.id}>{agent.name}</li>)}</ul>
        ) : <p>Aucun agent créé.</p>}
      </section>

      <section>
        <h5>- Coordonnées ajoutées:</h5>
        {data.coordonnees.length > 0 ? (
          <ul>{data.coordonnees.map(coord => <li key={coord.id}>{coord.user_name} envoies ({coord.latitude}, {coord.longitude}) le {coord.created_at} </li>)}</ul>
        ) : <p>Aucune coordonnée ajoutée.</p>}
      </section>

      <section>
        <h5>- Clients enregistrés:</h5>
        {data.clients.length > 0 ? (
          <ul>{data.clients.map(client => <li key={client.id}>{client.nom_client}</li>)}</ul>
        ) : <p>Aucun client enregistré.</p>}
      </section>
    </div>
  );
};

export default ActiviteDuJour;
