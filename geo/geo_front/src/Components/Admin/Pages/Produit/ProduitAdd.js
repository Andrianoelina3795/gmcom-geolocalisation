import React, { useState } from 'react';
import './ProduitAdd.css'; // Import du style personnalisé
import { FaBackspace } from 'react-icons/fa'; // Icône (non utilisé ici mais importé)
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProduitAdd.css'; 

const ProduitAdd = () => {
  // État du formulaire
  const [formData, setFormData] = useState({
    type_produit: '',
    nom_produit: '',
    montant_produit: ''
  });

  // Gestion des changements dans les champs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/produits', formData);
      alert(response.data.message);
      setFormData({ type_produit: '', nom_produit: '', montant_produit: '' }); // Réinitialisation
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const messages = Object.values(error.response.data.errors).flat().join('\n');
        alert("Erreur de validation :\n" + messages); 
      } else {
        alert("Une erreur est survenue.");
      }
    }
  };

  return (
    <div className='header-contact mt-5'>
      <div className="contact-page">
        <div className="contact-form-box">
          <h2 className="contact-title text-center">
            Formulaire d'ajout produit du GMCOM
          </h2>

          {/* Formulaire produit */}
          <form onSubmit={handleSubmit} className="contact-form mt-5">

            <label>Type produit (travaux)</label>
            <select
              className="form-select"
              name="type_produit"
              value={formData.type_produit}
              onChange={handleChange}
              required
            >
              <option value="">--Sélectionner--</option>
              <option value="Assainissement">Produit d'Assainissement</option>
              <option value="Adduction d'Eau potable">Produit d'Adduction d'Eau Potable</option>
              <option value="Construction des Villa Basses">Construction</option>
            </select>

            <input
              type="text"
              name="nom_produit"
              className='form-control'
              placeholder="Le nom du produit"
              value={formData.nom_produit}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="montant_produit"
              className='form-control'
              placeholder="Le prix du produit en Ariary"
              value={formData.montant_produit}
              onChange={handleChange}
              required
            />

            {/* Boutons */}
            <div className="d-grid gap-2 d-md-flex justify-content-center mt-5">
              <button type="submit" className="contact-btn" style={{ width: "60%" }}>
                Enregistrer
              </button>

              <Link to="/admin/list-produit" className="btn btn-outline-secondary">
                Retour
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProduitAdd;
