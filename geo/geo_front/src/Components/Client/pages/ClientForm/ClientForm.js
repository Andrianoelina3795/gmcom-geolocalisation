import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './ClientForm.css';
import { FaPrint, FaCamera, FaSearch } from 'react-icons/fa';
import ClientFormPrint from '../ClientFormPrint/ClientFormPrint';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ClientForm = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token') || '';
  const userId = user?.id;

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const initialForm = {
    id_client: user?.pseudo || '',
    type_travaux: '',
    type: '',
    date: '',
    ac: user?.name || '',
    contact_ac: user?.contact_ac || '',
    activite: '',
    type_client: '',
    photo: null,
    nom_client: '',
    type_identification: '',
    CIN_client: '',
    date_CIN: '',
    lieu_CIN: '',
    duplicata: '',
    date_naissance: '',
    lieu_naissance: '',
    adresse: '',
    fokontany: '',
    commune: '',
    province: '',
    statut_logement: '',
    statut_logement_autre: '',
    nombre_usagers: '',
    source_revenus: '',
    source_revenus_autre: '',
    contact_client: '',
    toilette: '',
    source_eau: '',
    produit: '',
    montant: '',
    raison_refus: '',
    paiement_mode: [],
    reference_paiement: '',
    montant_par_mois: '',
    date_paiement: '',
    consentement: false,
    toilette_fosse: '',
    toilette_plateforme: '',
    toilette_source_eau: '',
    toilette_aucune: '',
    puit_simple: '',
    puit_motorise: '',
    puit_autre: '',
    puit_aucune: '',
    relance: false,
    date_relance: '',
    client_id: ''
  };

  const [form, setForm] = useState(initialForm);
  const [typesCount, setTypesCount] = useState(0);
  const [produits, setProduits] = useState([]);
  const [produitsFiltres, setProduitsFiltres] = useState([]);
  const [montant, setMontant] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [clientData, setClientData] = useState(null);
  const [showPrintData, setShowPrintData] = useState(false);

  // Mapping des types de travaux vers les catégories de produits
  const mappingTravauxProduits = {
    'KB': 'assainissement',
    'RN': 'adduction_eau_potable',
    'VB': 'construction'
  };

  // Fonction de recherche des prospects/follow up
  const searchClients = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/clients/search?q=${encodeURIComponent(searchTerm)}&ac=${user.name}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSearchResults(response.data);
      setShowSearchResults(true);

    } catch (error) {
      console.error('Erreur recherche:', error);

      // Message d'erreur plus précis
      if (error.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'Route non trouvée',
          text: 'La fonction de recherche nécessite une mise à jour du backend. Contactez l\'administrateur.',
        });
      } else {
        Swal.fire('Erreur', 'Impossible de rechercher les clients', 'error');
      }
    }
  };
  // Charger les données d'un client existant
  const loadClientData = (client) => {
    setForm({
      ...initialForm,
      ...client,
      type: 'Client',
      date: new Date().toISOString().split('T')[0],
      client_id: client.id
    });
    setIsEditingExisting(true);
    setShowSearchResults(false);
    setSearchTerm('');
    Swal.fire({
      toast: true,
      icon: 'succes',
      title: 'Succès',
      text: 'Client chargé. Vous pouvez maintenant le transformer en Client.',
    });
  };

  // Démarre la caméra si activée
  useEffect(() => {
    if (cameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        })
        .catch((err) => {
          console.error('Erreur caméra :', err);
          alert("Impossible d'accéder à la caméra");
        });
    } else {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    }
  }, [cameraOn]);

  //Capture la photo de la vidéo
  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/png');
    setForm((prev) => ({ ...prev, photo: base64 }));
    setCameraOn(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si le type de travaux change, réinitialiser le produit
    if (name === 'type_travaux') {
      setForm({
        ...form,
        [name]: value,
        produit: '', // Réinitialiser la sélection du produit
        montant: '' // Réinitialiser le montant
      });
    } else {
      setForm({
        ...form,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // NOUVEAU: Filtrer les produits quand le type de travaux change - VERSION CORRIGÉE
  useEffect(() => {
    console.log('Début du filtrage des produits');
    console.log('Type travaux sélectionné:', form.type_travaux);
    console.log('Total produits chargés:', produits.length);
    console.log('Produits disponibles:', produits);

    if (form.type_travaux && produits.length > 0) {
      const categorie = mappingTravauxProduits[form.type_travaux];
      console.log('Catégorie recherchée:', categorie);

      // TEST: Afficher la structure de chaque produit pour debugger
      produits.forEach((produit, index) => {
        console.log(`Produit ${index}:`, {
          id: produit.id,
          nom: produit.nom_produit,
          type: produit.type,
          categorie: produit.categorie,
          type_produit: produit.type_produit,
          montant: produit.montant_produit
        });
      });

      // FILTRAGE PLUS PERMISSIF - Testez différentes stratégies
      const produitsFiltres = produits.filter(produit => {
        // Test 1: Vérifier si le produit a un champ 'type' correspondant
        if (produit.type && produit.type.toLowerCase().includes(categorie)) {
          console.log('Produit trouvé par TYPE:', produit.nom_produit);
          return true;
        }

        // Test 2: Vérifier si le produit a un champ 'categorie' correspondant
        if (produit.categorie && produit.categorie.toLowerCase().includes(categorie)) {
          console.log('Produit trouvé par CATEGORIE:', produit.nom_produit);
          return true;
        }

        // Test 3: Vérifier si le produit a un champ 'type_produit' correspondant
        if (produit.type_produit && produit.type_produit.toLowerCase().includes(categorie)) {
          console.log('Produit trouvé par TYPE_PRODUIT:', produit.nom_produit);
          return true;
        }

        // Test 4: Vérifier si le nom du produit contient la catégorie
        if (produit.nom_produit && produit.nom_produit.toLowerCase().includes(categorie)) {
          console.log('Produit trouvé par NOM:', produit.nom_produit);
          return true;
        }

        console.log('Produit non correspondant:', produit.nom_produit);
        return false;
      });

      console.log('Produits filtrés trouvés:', produitsFiltres.length, produitsFiltres);
      setProduitsFiltres(produitsFiltres);
    } else {
      console.log('Aucun filtrage - type travaux non sélectionné ou produits vides');
      setProduitsFiltres([]);
    }
  }, [form.type_travaux, produits]);

  const togglePaiementMode = (value) => {
    const current = form.paiement_mode;
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    setForm({ ...form, paiement_mode: updated });
  };

  const isProspect = form.type === 'Prospect';

  // Soumission du formulaire (CREATE ou UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envoyer les données à l'API
      let response;

      if (isEditingExisting && form.client_id) {
        response = await axios.put(
          `http://localhost:8000/api/clients/${form.client_id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        response = await axios.post('http://localhost:8000/api/clients', form, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setForm(initialForm); // Réinitialisation
      }

      // SOLUTION: Utiliser LES DONNÉES DU FORMULAIRE pour l'impression
      // Car elles sont complètes et à jour
      setClientData({
        // Données principales
        id_client: form.id_client,
        type: form.type,
        activite: form.activite,
        date: form.date,
        ac: form.ac,
        contact_ac: form.contact_ac,
        type_client: form.type_client,
        nom_client: form.nom_client,
        adresse: form.adresse,
        fokontany: form.fokontany,
        commune: form.commune,
        province: form.province,
        statut_logement: form.statut_logement,
        nombre_usagers: form.nombre_usagers,
        source_revenus: form.source_revenus,
        source_revenus_autre: form.source_revenus_autre,
        contact_client: form.contact_client,

        // Photo
        photo: form.photo,

        // Champs d'identification
        type_identification: form.type_identification,
        CIN_client: form.CIN_client,
        date_CIN: form.date_CIN,
        lieu_CIN: form.lieu_CIN,
        duplicata: form.duplicata,
        date_naissance: form.date_naissance,
        lieu_naissance: form.lieu_naissance,

        // Décision
        type_decision: form.type_decision,
        produit: form.produit,
        montant: form.montant,
        raison_refus: form.raison_refus,

        // Paiement
        paiement_mode: form.paiement_mode,
        reference_paiement: form.reference_paiement,
        montant_par_mois: form.montant_par_mois,

        // Relance
        relance: form.relance,
        date_relance: form.date_relance,

        // Consentement
        consentement: form.consentement
      });

      console.log('Données enregistrées avec succès');

      //afficher l'impression
      setShowPrintData(true);

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Succès!',
        text: isEditingExisting ? 'Client transformé avec succès!' : 'Client enregistré avec succès!'
      });

    } catch (error) {
      console.error('Erreur:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Erreur !',
        text: 'Une erreur s\'est produite lors de l\'enregistrement.',
      });
    }
  };

  useEffect(() => {
    console.log('form.type_travaux sélectionné : ', form.type_travaux);
    console.log('Ito n token magnadala anah eto io : ', token);
    if (form.type_travaux) {
      axios
        .get(`http://localhost:8000/api/clients/count/${form.type_travaux}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        .then((res) => {
          const count = res.data.count + 1;
          setTypesCount(count);
          const generatedId = `${user.pseudo || 'USER'}-${count}-${form.type_travaux}`;
          setForm((prevForm) => ({
            ...prevForm,
            id_client: generatedId,
          }));
        })
        .catch((error) => {
          console.error('Erreur lors du comptage des clients :', error);
        });
    }
  }, [form.type_travaux]);

  useEffect(() => {
    const generateClientID = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `CL${timestamp}${random}`;
    };
    setForm(prev => ({ ...prev, client_id: generateClientID() }));
  }, []);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        console.log('🔄 Chargement des produits...');
        const response = await axios.get('http://localhost:8000/api/produits/dataChart', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const data = response.data;
        console.log('Données brutes des produits:', data);

        let produitsData = [];
        if (Array.isArray(data)) {
          produitsData = data;
        } else if (Array.isArray(data.produits)) {
          produitsData = data.produits;
        } else if (data.data && Array.isArray(data.data)) {
          produitsData = data.data;
        } else {
          console.error("Format de réponse inattendu :", data);
          produitsData = [];
        }

        console.log('Produits chargés:', produitsData.length, produitsData);
        setProduits(produitsData);
      } catch (error) {
        console.error("Erreur de chargement des produits :", error);
        setProduits([]);
      }
    };
    fetchProduits();
  }, [token]);

  useEffect(() => {
    const produit = produits.find(p => p.nom_produit === form.produit);
    if (produit) {
      setMontant(produit.montant_produit);
      setForm(prev => ({ ...prev, montant: produit.montant_produit }));
    } else {
      setMontant('');
      setForm(prev => ({ ...prev, montant: '' }));
    }
  }, [form.produit, produits]);

  // TEST: Afficher tous les produits si aucun filtre ne fonctionne
  const produitsAffiches = produitsFiltres.length > 0 ? produitsFiltres : produits;

  return (
    <>
      <div className='header-clientForm'>
      <div className="client-form-container my-5">
        <div className="client-form-card">

          {/* Barre de recherche - CACHÉE par défaut, AFFICHÉE seulement si Relance cochée */}
          {(form.type === 'Prospect' || form.type === 'Follow_up') && form.relance && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-info text-white">
                    <FaSearch className="me-2" />
                    Rechercher un Prospect/Follow Up existant pour relance
                  </div>
                  <div className="card-body" style={{ minwidth: '100%' }}>
                    <div className="search-bar-container">
                      <div className="search-input-group">
                        <input
                          type="text"
                          className="search-input"
                          placeholder="Rechercher par nom, contact, CIN..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchClients()}
                        />
                        <button className="btn btn-primary" type="button"
                          onClick={searchClients}>
                          <FaSearch />
                        </button>
                      </div>
                    </div>

                    {/* Résultats de recherche */}
                    {showSearchResults && (
                      <div className="mt-3">
                        <h6>Résultats de recherche :</h6>
                        {searchResults.length > 0 ? (
                          <div className="list-group">
                            {searchResults.map(client => (
                              <button
                                key={client.id}
                                type="button"
                                className="list-group-item list-group-item-action"
                                onClick={() => loadClientData(client)}
                              >
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>{client.nom_client}</strong>
                                    <span className="badge bg-secondary ms-2">{client.type}</span>
                                  </div>
                                  <div>
                                    <small className="text-muted">
                                      {client.contact_client} • {client.CIN_client}
                                    </small>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">Aucun résultat trouvé</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Indicateur de mode */}
          {isEditingExisting && (
            <div className="alert alert-info">
              <strong>Mode édition :</strong> Vous êtes en train de transformer un prospect/follow up en Client.
            </div>
          )}

          {/* En-tête avec logo et titre */}
          <div className="d-flex client-form-header border rounded p-3 mb-4 bg-light">
            <img
              src="/logo.jpg"
              alt="Logo gauche"
              className="img-fluid client-form-logo"
            />
            <h3
              className="client-form-title">
              {isEditingExisting ? 'Transformation en Client' : 'Formulaire d\'informations client'}
            </h3>
            <img
              src="/logo.jpg"
              alt="Logo droite"
              className="img-fluid client-form-logo"
            />
          </div>

          {/* Formulaire principal */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* ID Client */}
              <div className="col-md-3">
                <label>ID Client</label>
                <input
                  className="form form-control"
                  type="text"
                  name="id_client"
                  placeholder="ID Client"
                  value={form.id_client}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              <div className="col-md-3">
                <label>Type travaux</label>
                <select
                  className="form form-select"
                  name="type_travaux"
                  value={form.type_travaux}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Selectionner --</option>
                  <option value="KB">KB</option>
                  <option value="RN">RN</option>
                  <option value="VB">VB</option>
                </select>
              </div>

              <div className="col-md-3">
                <label>Date:</label>
                <input
                  className="form form-control"
                  type="date" name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label>Type</label>
                <select className="form form-select" name="type" value={form.type} onChange={handleChange} required>
                  <option value="">-- Selectionner --</option>
                  <option value="Client">Client</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Follow_up">Follow Up</option>
                </select>
              </div>

              <div className="col-md-3">
                <label>Activité</label>
                <select className="form form-select" name="activite" value={form.activite} onChange={handleChange}>
                  <option value="">--Sélectionner--</option>
                  <option value="Présentation">Présentation</option>
                  <option value="Tamtam/Salon">Tamtam/Salon</option>
                  <option value="Foire">Foire</option>
                </select>
              </div>

              <div className="col-md-3">
                <label>Agent Commercial</label>
                <input
                  className="form form-control"
                  type="text"
                  name="ac"
                  placeholder="AC"
                  value={form.ac}
                  onChange={handleChange}
                  readOnly />
              </div>

              <div className="col-md-3">
                <label>Contact AC</label>
                <input
                  className="form form-control"
                  type="tel"
                  name="contact_ac"
                  value={form.contact_ac}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              {/* Checkbox RELANCE et Date de relance pour Prospect et Follow Up */}
              {(form.type === 'Prospect' || form.type === 'Follow_up') && (
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="relance"
                      checked={form.relance}
                      onChange={handleChange}
                      id="relanceCheckbox"
                    />
                    <label className="form-check-label" htmlFor="relanceCheckbox">
                      Relance
                    </label>
                  </div>

                  {form.relance && (
                    <div className="mt-2">
                      <label>Date de relance</label>
                      <input
                        type="date"
                        className="form form-control"
                        name="date_relance"
                        value={form.date_relance || ''}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Informations personnelles */}
              <div className="col-12"><hr /><h5 className="client-form-section-title">Informations personnelles</h5></div>

              {/* Zone de capture photo */}
              {!isProspect && (
                <div className="camera-box my-3">
                  {cameraOn ? (
                    <>
                      <video ref={videoRef} className="video" />
                      <button type="button" onClick={takePhoto} className='btn btn-success mt-2' style={{ width: '25%' }}>
                        Capturer la photo
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setCameraOn(true)} className='btn btn-primary me-2'>
                      <FaCamera />
                    </button>
                  )}
                  {/* Aperçu photo */}
                  {form.photo && (
                    <div className="photo-preview">
                      <img src={form.photo} alt="Photo client" className='photo-id' />
                    </div>
                  )}
                </div>
              )}

              <div className="col-md-4">
                <label>Type du Client</label>
                <select className="form form-select" name="type_client" value={form.type_client} onChange={handleChange}>
                  <option value="">--Sélectionner--</option>
                  <option value="Ménage">Ménage</option>
                  <option value="Ecole">Ecole</option>
                  <option value="Association/ONG">Association/ONG</option>
                  <option value="Entreprise">Entreprise</option>
                  <option value="Centre de santé">Centre de santé</option>
                  <option value="Eglise">Eglise</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Gargotte/Restaurant">Gargote/Restaurant</option>
                  <option value="Bureau administratif(commune/fokontany)">Bureau administratif(Commune/Fokontany)</option>
                </select>
              </div>

              <div className="col-md-4">
                <label>Nom Client</label>
                <input
                  className="form form-control"
                  type="text" name="nom_client"
                  placeholder="Nom du client"
                  value={form.nom_client}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Type identification : CIN ou Naissance */}
              <div className="col-md-4">
                <label>Type d'identification</label>
                <select
                  className="form form-select"
                  name="type_identification"
                  value={form.type_identification}
                  onChange={handleChange}
                >
                  <option value="">--Sélectionner--</option>
                  <option value="cin">Carte d'identité (CIN)</option>
                  <option value="naissance">Date et lieu de naissance</option>
                </select>
              </div>

              {/* Si CIN sélectionné */}
              {form.type_identification === 'cin' && (
                <>
                  <div className="col-md-4">
                    <label>CIN</label>
                    <input
                      className="form form-control"
                      type="number"
                      name="CIN_client"
                      placeholder="Numéro CIN"
                      value={form.CIN_client}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Date de délivrance</label>
                    <input
                      className="form form-control"
                      type="date"
                      name="date_CIN"
                      placeholder="Date de délivrance"
                      value={form.date_CIN}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Lieu de délivrance</label>
                    <input
                      className="form form-control"
                      type="text" name="lieu_CIN"
                      placeholder="Lieu de délivrance"
                      value={form.lieu_CIN}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Duplicata</label>
                    <input
                      className="form form-control"
                      type="text"
                      name="duplicata"
                      placeholder="Duplicata"
                      value={form.duplicata}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Si Naissance sélectionné */}
              {form.type_identification === 'naissance' && (
                <>
                  <div className="col-md-4">
                    <label>Date de Naissance</label>
                    <input
                      className="form form-control"
                      type="date"
                      name="date_naissance"
                      placeholder="Date de naissance"
                      value={form.date_naissance}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Lieu de Naissance</label>
                    <input
                      className="form form-control"
                      type="text"
                      name="lieu_naissance"
                      placeholder="Lieu de naissance"
                      value={form.lieu_naissance}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="col-md-4">
                <label>Adresse</label>
                <input
                  className="form form-control"
                  type="text"
                  name="adresse"
                  placeholder="Adresse"
                  value={form.adresse}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Quartier (Fokontany)</label>
                <input
                  className="form form-control"
                  type="text"
                  name="fokontany"
                  placeholder="Fokontany"
                  value={form.fokontany}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Commune</label>
                <input
                  className="form form-control"
                  type="text"
                  name="commune"
                  placeholder="Commune"
                  value={form.commune}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Province</label>
                <select className="form form-select" name="province" value={form.province} onChange={handleChange}>
                  <option value="">--Sélectionner--</option>
                  <option value="Antananarivo">Antananarivo</option>
                  <option value="Fianarantsoa">Fianarantsoa</option>
                  <option value="Toamasina">Toamasina</option>
                  <option value="Antsiranana">Antsiranana</option>
                  <option value="Toliara">Toliara</option>
                </select>
              </div>

              <div className="col-md-4">
                <label>Statut du logement</label>
                <select className="form form-select" name="statut_logement" value={form.statut_logement} onChange={handleChange}>
                  <option value="">--Sélectionner--</option>
                  <option value="Locataire">Locataire</option>
                  <option value="Propriétaire">Propriétaire</option>
                </select>
              </div>

              <div className="col-md-4">
                <label>Autre statut du logement</label>
                <input
                  className="form form-control"
                  type="text"
                  name="statut_logement_autre"
                  placeholder="Autre statut logement"
                  value={form.statut_logement_autre}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Nombre d'usagers (Toillete/Villa)</label>
                <input
                  className="form form-control"
                  type="number" name="nombre_usagers"
                  placeholder="Nombre d'usagers(toilette/villa)"
                  value={form.nombre_usagers}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Source de révenus</label>
                <select className="form form-select" name="source_revenus" value={form.source_revenus} onChange={handleChange}>
                  <option value="">--Sélectionner--</option>
                  <option value="Salarié(e) fonctionnaire">Salarié(e) fonctionnaire</option>
                  <option value="Pensionnaire">Pensionnaire</option>
                  <option value="Prestataire de service">Prestataire de service</option>
                  <option value="Propietaire de maison louée">Propriétaire de maison louée</option>
                </select>
              </div>

              <div className="col-md-4">
                <label>Autre source de révenus</label>
                <input
                  className="form form-control"
                  type="text" name="source_revenus_autre"
                  placeholder="Autre source de revenu"
                  value={form.source_revenus_autre}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Contact du Client</label>
                <input
                  className="form form-control"
                  type="tel" name="contact_client"
                  placeholder="Contact du client"
                  value={form.contact_client}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Assainissement et Eau */}
              <div className="col-12"><hr /><h5 className="client-form-section-title">Assainissement et eau</h5></div>

              <div className="table-container">
                <table className="sanitary-table">
                  <tbody>
                    <tr>
                      <th rowSpan="2">Toilette</th>
                      <th>Fosse</th>
                      <th>Plate-forme</th>
                      <th>Source d'eau</th>
                      <th>Aucune</th>
                    </tr>
                    <tr>
                      <td>
                        <select
                          className="form form-select"
                          name="toilette_fosse"
                          value={form.toilette_fosse}
                          onChange={handleChange}
                        >
                          <option value="">-- Selectionner --</option>
                          <option value="Fosse perdu">Fosse perdu</option>
                          <option value="Fosse septique">Fosse septique</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="form form-select"
                          name="toilette_plateforme"
                          value={form.toilette_plateforme}
                          onChange={handleChange}
                        >
                          <option value="">-- Selectionner --</option>
                          <option value="Bois">Bois</option>
                          <option value="Béton">Béton</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="form form-select"
                          name="toilette_source_eau"
                          value={form.toilette_source_eau}
                          onChange={handleChange}
                        >
                          <option value="">-- Selectionner --</option>
                          <option value="Borne fontaine">Borne fontaine</option>
                          <option value="Jirama">Jirama</option>
                          <option value="Puis">Puis</option>
                        </select>
                      </td>
                      <td>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="toilette_aucune"
                          checked={form.toilette_aucune}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th rowSpan="2">Puit/Forage</th>
                      <th>Simple</th>
                      <th>Motorisé</th>
                      <th>Autre</th>
                      <th>Aucune</th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="puit_simple"
                          checked={form.puit_simple}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="puit_motorise"
                          checked={form.puit_motorise}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="puit_autre"
                          checked={form.puit_autre}
                          onChange={handleChange}
                        />
                      </td>
                      <td style={{ padding: 25, marginBottom: 30 }}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="puit_aucune"
                          checked={form.puit_aucune}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Décision du client */}
              <div className="col-12"><hr /><h5 className="client-form-section-title">Décision du client (Achat?)</h5></div>
              <div className="col-md-6">
                <select
                  className="form form-select"
                  name="type_decision"
                  value={form.type_decision}
                  onChange={handleChange}
                >
                  <option value="">--Sélectionner selon la décision du client--</option>
                  <option value="oui">OUI</option>
                  <option value="non">NON</option>
                </select>
              </div>

              {/* Si décision OUI et pas prospect */}
              {form.type_decision === 'oui' && !isProspect && (
                <>
                  <div className="col-md-6">
                    <select
                      name="produit"
                      value={form.produit}
                      onChange={handleChange}
                      className="form form-select"
                      disabled={!form.type_travaux || produitsAffiches.length === 0}
                    >
                      <option value="">
                        {!form.type_travaux
                          ? "Sélectionnez d'abord le type de travaux"
                          : produitsAffiches.length === 0
                            ? "Aucun produit disponible"
                            : "-- Choisir un produit --"
                        }
                      </option>
                      {produitsAffiches.map(produit => (
                        <option key={produit.id} value={produit.nom_produit}>
                          {produit.nom_produit} - {produit.montant_produit?.toLocaleString()} Ar
                        </option>
                      ))}
                    </select>
                    {form.type_travaux && (
                      <small className="text-muted">
                        {produitsFiltres.length > 0
                          ? `Produits ${mappingTravauxProduits[form.type_travaux]} disponibles: ${produitsFiltres.length}`
                          : `Tous les produits disponibles: ${produitsAffiches.length}`
                        }
                      </small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <input type="text" className='form form-control' name="montant" value={montant ? `${montant} Ar` : ''} readOnly />
                  </div>
                </>
              )}

              {/* Si décision NON (toujours visible même en prospect) */}
              {form.type_decision === 'non' && (
                <div className="col-md-6">
                  <input className="form form-control" type="text" name="raison_refus" placeholder="NON(La raison à Préciser)" value={form.raison_refus} onChange={handleChange} />
                </div>
              )}

              {!isProspect && (
                <>
                  {/* Paiement */}
                  <div className="col-12"><hr /></div>

                  {/* Cases à cocher pour les modes de paiement */}
                  <div className="col-md-12">
                    <label className="form-label d-block">Modes de paiement :</label>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="especes"
                        checked={form.paiement_mode.includes('especes')}
                        onChange={() => togglePaiementMode('especes')}
                      />
                      <label className="form-check-label" htmlFor="especes">Espèces</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="mobile_banking"
                        checked={form.paiement_mode.includes('mobile_banking')}
                        onChange={() => togglePaiementMode('mobile_banking')}
                      />
                      <label className="form-check-label" htmlFor="mobile_banking">Mobile Banking</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="virement_bancaire"
                        checked={form.paiement_mode.includes('virement_bancaire')}
                        onChange={() => togglePaiementMode('virement_bancaire')}
                      />
                      <label className="form-check-label" htmlFor="virement_bancaire">Virement bancaire</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="facilite_paiement"
                        checked={form.paiement_mode.includes('facilite_paiement')}
                        onChange={() => togglePaiementMode('facilite_paiement')}
                      />
                      <label className="form-check-label" htmlFor="facilite_paiement">Facilité de paiement</label>
                    </div>
                  </div>

                  {form.paiement_mode.includes('especes') && (
                    <div className="col-md-6">
                      <input
                        className="form form-control"
                        type="number"
                        name="montant"
                        placeholder="Montant (espèces)"
                        value={form.montant}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  {(form.paiement_mode.includes('mobile_banking') || form.paiement_mode.includes('virement_bancaire')) && (
                    <>
                      <div className="col-md-6">
                        <input
                          className="form form-control"
                          type="number"
                          name="montant"
                          placeholder="Montant (mobile/virement)"
                          value={form.montant}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          className="form form-control"
                          type="text"
                          name="reference_paiement"
                          placeholder="Référence"
                          value={form.reference_paiement}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}

                  {form.paiement_mode.includes('facilite_paiement') && (
                    <div className="col-md-4">
                      <input
                        className="form form-control"
                        type="number"
                        name="montant_par_mois"
                        placeholder="Montant par mois"
                        value={form.montant_par_mois}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Checkbox de consentement */}
              <div className="col-12 form-check mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="consentement"
                  checked={form.consentement}
                  onChange={handleChange}
                />
                <label className="form-check-label">
                  J'accepte que mes données soient utilisées par GMCOM
                </label>
              </div>

              {/*Boutons : soumettre & imprimer */}
              <div className="col-12 mt-3 d-flex gap-3 justify-content-start flex-wrap">
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <FaPrint color='white' style={{ marginRight: '8px' }} />
                  {isEditingExisting ? 'Transformer en Client' : 'Soumettre & Imprimer'}
                </button>
              </div>
            </div>
          </form>

          {/* Canvas caché pour capturer image */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Partie imprimable */}
          <ClientFormPrint clientData={clientData} showPrintData={showPrintData} />

        </div>
      </div>
    </div >
    </>
  );
};

export default ClientForm;
