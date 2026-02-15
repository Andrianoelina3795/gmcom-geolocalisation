// src/components/ClientEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ClientEdit.css'; // Import du CSS personnalisé

const ClientEdit = () => {
  const { id } = useParams(); // ID du client à modifier
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // État du formulaire
  const [form, setForm] = useState({
    id_client: '',
    nom_client: '',
    contact: '',
    adresse: '',
    type_client: '',
    // Ajoute d’autres champs si nécessaire
  });

  // Chargement des données du client
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .then((response) => {
        setForm(response.data);
      })
      .catch((error) => {
        console.error(error);
        alert('Erreur lors du chargement des données');
      });
  }, [id, token]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8000/api/clients/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .then(() => {
        alert('Client mis à jour avec succès !');
        navigate('/clients');
      })
      .catch((error) => {
        console.error(error);
        alert('Erreur lors de la mise à jour');
      });
  };

  return (
    <div className="client-edit-container">
      <h3 className="client-edit-title">Modifier le client</h3>
      <form onSubmit={handleSubmit} className="row g-3 mt-3">
        <div className="col-md-6">
          <label className="form-label client-edit-label">ID Client</label>
          <input
            type="text"
            className="form-control client-edit-input"
            name="id_client"
            value={form.id_client}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="col-md-6">
          <label className="form-label client-edit-label">Nom</label>
          <input
            type="text"
            className="form-control client-edit-input"
            name="nom_client"
            value={form.nom_client}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label client-edit-label">Contact</label>
          <input
            type="text"
            className="form-control client-edit-input"
            name="contact"
            value={form.contact}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label client-edit-label">Adresse</label>
          <input
            type="text"
            className="form-control client-edit-input"
            name="adresse"
            value={form.adresse}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label client-edit-label">Type de client</label>
          <input
            type="text"
            className="form-control client-edit-input"
            name="type_client"
            value={form.type_client}
            onChange={handleChange}
          />
        </div>

        {/* Ajoute ici d'autres champs si nécessaires */}

        <div className="col-12 mt-3">
          <button type="submit" className="client-edit-button w-100">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientEdit;
