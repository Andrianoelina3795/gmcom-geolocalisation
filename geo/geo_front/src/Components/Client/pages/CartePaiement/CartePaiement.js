import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CartePaiement.css';
import Swal from 'sweetalert2';

const CartePaiement = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [paiements, setPaiements] = useState([]);
    const [nouveauPaiement, setNouveauPaiement] = useState('');
    const [clientEtape, setClientEtape] = useState({});
    const [visiteData, setVisiteData] = useState(null);
    const [annonce, setAnnonce] = useState({ message: '', couleur: '' });
    const [loading, setLoading] = useState(false);

    const [commandeTravauxDate, setCommandeTravauxDate] = useState('');
    const [travauxDebutDate, setTravauxDebutDate] = useState('');
    const [travauxFinDate, setTravauxFinDate] = useState('');
    const [receptionDate, setReceptionDate] = useState('');

    const initialForm = {
        date: new Date().toISOString().split('T')[0],
        nom_client: '',
        adresse: '',
        contact_client: '',
        ac: user?.name || '',
        contact_ac: user?.contact_ac || '',
        id_client: '',
        produit: '',
        montant: '',
    };
    const [form, setForm] = useState(initialForm);

    const api = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: { Authorization: `Bearer ${token}` },
    });

    // Charger clients
    useEffect(() => {
        api.get('/clients/by-user')
            .then(res => {
                const clientsData = res.data.clients || [];
                setClients(clientsData);
                setFilteredClients(clientsData);
            })
            .catch(err => console.error('Erreur chargement clients:', err));
    }, [token]);

    // Filtrer les clients selon la recherche
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredClients(clients);
        } else {
            const filtered = clients.filter(client => 
                client.nom_client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.id_client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.contact_client?.includes(searchTerm) ||
                client.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        }
    }, [searchTerm, clients]);

    // Méthode pour récupérer les visites
    const fetchVisiteData = async (clientId) => {
        if (!clientId) return null;
        try {
            const res = await api.get(`/visites/client/${clientId}`);
            console.log('Réponse visite API:', res.data);
            return res.data.visite || res.data || null;
        } catch (err) {
            console.log('Aucune visite trouvée pour ce client:', err.response?.data || err.message);
            return null;
        }
    };

    // Méthode alternative si l'API visites n'existe pas
    const fetchVisiteDataAlternative = async (clientId) => {
        if (!clientId) return null;
        try {
            const routes = [
                `/visites/client/${clientId}`,
                `/clients/${clientId}/visite`,
                `/visites?client_id=${clientId}`
            ];

            for (const route of routes) {
                try {
                    const res = await api.get(route);
                    console.log(`Route ${route} réponse:`, res.data);
                    if (res.data && (res.data.visite || res.data.length > 0)) {
                        return res.data.visite || res.data[0] || res.data;
                    }
                } catch (err) {
                    console.log(`Route ${route} échouée:`, err.message);
                }
            }
            return null;
        } catch (err) {
            console.error('Toutes les routes visite ont échoué:', err);
            return null;
        }
    };

    // Rafraîchir toutes les données client
    const refreshClientData = async (clientId) => {
        if (!clientId) return;
        setLoading(true);
        try {
            const [resPaiements, resEtape, visiteData] = await Promise.all([
                api.get(`/clients/${clientId}/paiements`),
                api.get(`/clients/${clientId}/etapes`),
                fetchVisiteDataAlternative(clientId)
            ]);
            
            setPaiements(resPaiements.data.paiements || []);
            setClientEtape(resEtape.data || {});
            setVisiteData(visiteData);

            setCommandeTravauxDate(resEtape.data?.commande_travaux || '');
            setTravauxDebutDate(resEtape.data?.travaux_debut || '');
            setTravauxFinDate(resEtape.data?.travaux_fin || '');
            setReceptionDate(resEtape.data?.reception_travaux || '');

        } catch (err) {
            console.error('Erreur chargement données client', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = async (e) => {
        const clientId = e.target.value;
        setSelectedClientId(clientId);
        setNouveauPaiement('');
        setAnnonce({ message: '', couleur: '' });
        setVisiteData(null);
        setSearchTerm('');

        if (!clientId) {
            setForm(initialForm);
            return;
        }

        const client = clients.find(c => c.id === parseInt(clientId, 10));
        if (client) {
            setForm({
                ...initialForm,
                nom_client: client.nom_client || '',
                adresse: client.adresse || '',
                contact_client: client.contact_client || '',
                id_client: client.id_client || '',
                produit: client.produit || '',
                montant: client.montant || '',
            });
        }

        await refreshClientData(clientId);
    };

    // Gestion de la recherche
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (selectedClientId) {
            setSelectedClientId('');
            setForm(initialForm);
            setPaiements([]);
            setClientEtape({});
            setVisiteData(null);
            setAnnonce({ message: '', couleur: '' });
        }
    };

    // Sélection rapide depuis les résultats de recherche
    const handleQuickSelect = (client) => {
        setSelectedClientId(client.id.toString());
        setSearchTerm('');
        
        setForm({
            ...initialForm,
            nom_client: client.nom_client || '',
            adresse: client.adresse || '',
            contact_client: client.contact_client || '',
            id_client: client.id_client || '',
            produit: client.produit || '',
            montant: client.montant || '',
        });

        refreshClientData(client.id);
    };

    // Ajouter paiement
    const handleAddPaiement = async (e) => {
        e.preventDefault();
        if (!nouveauPaiement || !selectedClientId) {
            Swal.fire({
                toast: true,
                icon: 'error',
                title: 'Erreur',
                text: 'Veuillez saisir un montant',
            });
            return;
        }

        try {
            await api.post('/paiements', {
                client_id: selectedClientId,
                montant: parseFloat(nouveauPaiement),
            });

            setNouveauPaiement('');
            await refreshClientData(selectedClientId);
            Swal.fire({
                toast: true,
                title: 'Succès',
                icon: 'success',
                text: 'Paiement enregistré avec succès',
            });

        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.error || 'Erreur lors de l\'ajout du paiement';

            Swal.fire({
                toast: true,
                icon: 'error',
                title: 'Erreur',
                text: 'Paiement refusé',
            });
        }
    };

    const totalPaye = paiements.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
    const reste = form.montant ? (parseFloat(form.montant) || 0) - totalPaye : 0;

    // Détection de la visite validée
    const isVisiteValidee = visiteData !== null && 
                           visiteData !== undefined && 
                           Object.keys(visiteData).length > 0 &&
                           (visiteData.id || visiteData.client_id || visiteData.date_visite);

    // Gestion des annonces
    useEffect(() => {
        if (!form.nom_client) {
            setAnnonce({ message: '', couleur: '' });
            return;
        }

        if (!isVisiteValidee && paiements.length > 0) {
            setAnnonce({
                message: 'Premier dépôt fait. Un superviseur doit effectuer la visite',
                couleur: 'alert-info',
            });
        } else if (isVisiteValidee) {
            if (reste > 0) {
                setAnnonce({
                    message: ` Paiement en cours - Reste ${reste.toLocaleString()} Ar à payer`,
                    couleur: 'alert-warning',
                });
            } else if (clientEtape?.travaux_fin) {
                setAnnonce({
                    message: ` Travaux terminés - Réception le ${clientEtape.reception_travaux || 'à définir'}`,
                    couleur: 'alert-success',
                });
            } else if (clientEtape?.travaux_debut) {
                setAnnonce({
                    message: ` Travaux en cours (depuis le ${clientEtape.travaux_debut})`,
                    couleur: 'alert-primary',
                });
            } else if (clientEtape?.commande_travaux) {
                setAnnonce({
                    message: ` Commande travaux effectuée le ${clientEtape.commande_travaux}`,
                    couleur: 'alert-info',
                });
            } else if (reste <= 0) {
                setAnnonce({
                    message: ' Paiement complet - Prêt pour la commande travaux',
                    couleur: 'alert-success',
                });
            }
        } else {
            setAnnonce({ message: '', couleur: '' });
        }
    }, [reste, clientEtape, form.nom_client, paiements, visiteData, isVisiteValidee]);

    return (
        <div className="header-zone mt-3">
            <div className="zone-page">
                <div className="zone-form-box text-center mb-2">
                    <div className="d-flex client-form-header border rounded p-3 mb-4 bg-light justify-content-between align-items-center">
                        <img src="/logo.jpg" alt="Logo gauche" className="img-fluid client-form-logo" />
                        <h3 className="client-title">Carte de Paiement</h3>
                        <img src="/logo2.jpg" alt="Logo droite" className="img-fluid client-form-logo" />
                    </div>

                    {loading && (
                        <div className="alert alert-info text-center">
                            <div className="spinner-grow text-primary me-2"></div>
                            Chargement des données...
                        </div>
                    )}

                    <form onSubmit={handleAddPaiement}>
                        <div className="row g-1 text-start">
                            {/* Champs infos client */}
                            <div className="col-md-6">
                                <label>- Date</label>
                                <input type="date" className="form form-control"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Champ de recherche */}
                            <div className="col-md-6">
                                <label>- Rechercher un client</label>
                                <input 
                                    type="text" 
                                    className="form form-control"
                                    placeholder="Nom, ID, contact ou adresse..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    disabled={loading}
                                />
                                
                                {/* Résultats de recherche en temps réel */}
                                {searchTerm && filteredClients.length > 0 && (
                                    <div className="search-results mt-2">
                                        <div className="list-group">
                                            {filteredClients.slice(0, 5).map(client => (
                                                <button
                                                    key={client.id}
                                                    type="button"
                                                    className="list-group-item list-group-item-action text-start"
                                                    onClick={() => handleQuickSelect(client)}
                                                >
                                                    <div className="fw-bold">{client.nom_client}</div>
                                                    <small className="text-muted">
                                                        ID: {client.id_client} | 
                                                        Contact: {client.contact_client} |
                                                        {client.adresse && ` Adresse: ${client.adresse}`}
                                                    </small>
                                                </button>
                                            ))}
                                        </div>
                                        {filteredClients.length > 5 && (
                                            <small className="text-muted">
                                                ... et {filteredClients.length - 5} autres résultats
                                            </small>
                                        )}
                                    </div>
                                )}
                                
                                {searchTerm && filteredClients.length === 0 && (
                                    <div className="alert alert-warning mt-2 mb-0">
                                        Aucun client trouvé pour "{searchTerm}"
                                    </div>
                                )}
                            </div>

                            <div className="col-md-6">
                                <label>- Choisir un client</label>
                                <select className="form form-select"
                                    onChange={handleClientChange}
                                    value={selectedClientId}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {filteredClients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.nom_client}
                                        </option>
                                    ))}
                                </select>
                                <div className="form-text">
                                    {filteredClients.length} client(s) trouvé(s)
                                    {searchTerm && ` pour "${searchTerm}"`}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label>- Adresse</label>
                                <input type="text" className="form form-control" value={form.adresse} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label>- Contact</label>
                                <input type="text" className="form form-control" value={form.contact_client} readOnly />
                            </div>

                            <div className="col-md-6">
                                <label>- Nom AC</label>
                                <input type="text" className="form form-control" value={form.ac} readOnly />
                            </div>
                            <div className="col-md-3">
                                <label>- Contact AC</label>
                                <input type="text" className="form form-control" value={form.contact_ac} readOnly />
                            </div>
                            <div className="col-md-3">
                                <label>- ID Client</label>
                                <input type="text" className="form form-control" value={form.id_client} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label>- Produit</label>
                                <input type="text" className="form form-control" value={form.produit} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label>- Montant complet</label>
                                <input type="text" className="form form-control" value={form.montant} readOnly />
                            </div>

                            {/* CHAMP CORRIGÉ : Afficher le paiement dès qu'il reste à payer */}
                            {reste > 0 && (
                                <div className="col-md-6">
                                    <label>- Nouveau paiement</label>
                                    <input 
                                        type="number" 
                                        className="form form-control"
                                        value={nouveauPaiement}
                                        onChange={e => setNouveauPaiement(e.target.value)}
                                        placeholder={`Montant (reste: ${reste.toLocaleString()} Ar)`}
                                        min="1"
                                        max={reste}
                                        disabled={loading}
                                    />
                                    {/* Messages contextuels */}
                                    {!isVisiteValidee && paiements.length === 0 && (
                                        <div className="form-text text-info">
                                            💰 Premier dépôt - La visite sera requise après ce paiement
                                        </div>
                                    )}
                                    {!isVisiteValidee && paiements.length > 0 && (
                                        <div className="form-text text-warning">
                                            ⚠️ Paiement supplémentaire - Visite en attente de validation
                                        </div>
                                    )}
                                    {isVisiteValidee && (
                                        <div className="form-text text-success">
                                            ✅ Visite validée - Paiement autorisé
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Annonce */}
                        {annonce.message && (
                            <div className={`alert mt-3 ${annonce.couleur}`}>
                                {annonce.message}
                            </div>
                        )}

                        <div className="mt-3 text-start">
                            {/* Afficher les étapes seulement si visite validée ET paiement complet */}
                            {isVisiteValidee && reste <= 0 && (
                                <>
                                    {/* Commande travaux */}
                                    {!clientEtape?.commande_travaux && (
                                        <div className="row g-2 align-items-end mt-3">
                                            <div className="col-md-4">
                                                <label>- Date prévisionnelle (commande travaux)</label>
                                                <input type="date" className="form form-control"
                                                    value={commandeTravauxDate}
                                                    onChange={e => setCommandeTravauxDate(e.target.value)}
                                                    min={form.date}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <button type="button" className="btn btn-success"
                                                    onClick={async () => {
                                                        await api.post('/clients/etapes', {
                                                            client_id: selectedClientId,
                                                            commande_travaux: commandeTravauxDate
                                                        });
                                                        refreshClientData(selectedClientId);
                                                    }}
                                                    disabled={!commandeTravauxDate}
                                                >
                                                     Enregistrer commande
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Début travaux */}
                                    {clientEtape?.commande_travaux && !clientEtape?.travaux_debut && (
                                        <div className="row g-2 align-items-end mt-3">
                                            <div className="col-md-4">
                                                <label>- Début des travaux</label>
                                                <input type="date" className="form form-control"
                                                    value={travauxDebutDate}
                                                    onChange={e => setTravauxDebutDate(e.target.value)}
                                                    min={clientEtape?.commande_travaux}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <button type="button" className="btn btn-primary"
                                                    onClick={async () => {
                                                        await api.post('/clients/etapes', {
                                                            client_id: selectedClientId,
                                                            travaux_debut: travauxDebutDate || new Date().toISOString().split('T')[0]
                                                        });
                                                        refreshClientData(selectedClientId);
                                                    }}
                                                    disabled={!travauxDebutDate}
                                                >
                                                    Démarrer travaux
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fin travaux */}
                                    {clientEtape?.travaux_debut && !clientEtape?.travaux_fin && (
                                        <div className="row g-2 align-items-end mt-3">
                                            <div className="col-md-4">
                                                <label>- Fin des travaux</label>
                                                <input type="date" className="form form-control"
                                                    value={travauxFinDate}
                                                    onChange={e => setTravauxFinDate(e.target.value)}
                                                    min={clientEtape?.travaux_debut}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label>- Réception (optionnel)</label>
                                                <input type="date" className="form form-control"
                                                    value={receptionDate}
                                                    onChange={e => setReceptionDate(e.target.value)}
                                                    min={travauxFinDate}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <button type="button" className="btn btn-dark"
                                                    onClick={async () => {
                                                        await api.post('/clients/etapes', {
                                                            client_id: selectedClientId,
                                                            travaux_fin: travauxFinDate,
                                                            reception_travaux: receptionDate || null
                                                        });
                                                        refreshClientData(selectedClientId);
                                                    }}
                                                    disabled={!travauxFinDate}
                                                >
                                                     Terminer travaux
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Tableau des paiements */}
                        <div className="table-responsive mt-3">
                            <table className="table table-striped table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>N°</th>
                                        <th>Dates</th>
                                        <th>Montants</th>
                                        <th>Reste à payer</th>
                                        <th>AC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paiements.map((p, i) => {
                                        const resteApres = (parseFloat(form.montant) || 0) - 
                                            paiements.slice(0, i + 1).reduce((sum, pay) => sum + (parseFloat(pay.montant) || 0), 0);
                                        return (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>{p.date}</td>
                                                <td>{parseFloat(p.montant).toLocaleString()} Ar</td>
                                                <td>{resteApres.toLocaleString()} Ar</td>
                                                <td>{form.ac}</td>
                                            </tr>
                                        );
                                    })}
                                    {paiements.length > 0 && (
                                        <tr className="table-info fw-bold">
                                            <td colSpan="2">TOTAL</td>
                                            <td>{totalPaye.toLocaleString()} Ar</td>
                                            <td className={reste > 0 ? 'text-danger' : 'text-success'}>
                                                {reste.toLocaleString()} Ar
                                            </td>
                                            <td></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* BOUTON CORRIGÉ : Valider dès qu'il y a un montant saisi et reste à payer */}
                        {reste > 0 && nouveauPaiement && (
                            <button type="submit" className="btn btn-primary mt-3">
                                Valider Paiement
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CartePaiement;

