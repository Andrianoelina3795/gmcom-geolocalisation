import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    FaSave,
    FaTimes,
    FaMoneyBillWave,
    FaUser,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaInfoCircle
} from "react-icons/fa";
import Swal from "sweetalert2";

function EditPaiement() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [paiement, setPaiement] = useState({
        montant: '',
        date: ''
    });
    const [clientInfo, setClientInfo] = useState(null);
    const [errors, setErrors] = useState({});

    // Charger UNIQUEMENT le paiement spécifique
    useEffect(() => {
        const fetchPaiement = async () => {
            setLoading(true);
            try {
                // Charger le paiement spécifique
                const paiementResponse = await axios.get(`http://localhost:8000/api/paiements/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (paiementResponse.data.success) {
                    const paiementData = paiementResponse.data.data;
                    setPaiement({
                        montant: paiementData.montant,
                        date: paiementData.date || paiementData.created_at?.split('T')[0]
                    });
                    
                    // Charger les infos du client associé
                    await loadClientInfo(paiementData.client_id);
                } else {
                    throw new Error('Paiement non trouvé');
                }

            } catch (error) {
                console.error('Erreur chargement données:', error);
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de charger les données du paiement.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/admin/paiements');
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPaiement();
    }, [id, token, navigate]);

    // Charger les informations du client associé
    const loadClientInfo = async (clientId) => {
        try {
            const clientResponse = await axios.get(`http://localhost:8000/api/clients/${clientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (clientResponse.data.success) {
                setClientInfo(clientResponse.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement infos client:', error);
        }
    };

    // Gérer les changements des champs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaiement(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Effacer l'erreur du champ quand l'utilisateur modifie
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Calculer le montant maximum autorisé pour CE paiement
    const getMaxAmount = () => {
        if (!clientInfo) return null;
        
        const totalPaye = clientInfo.paiements?.reduce((sum, p) => sum + parseFloat(p.montant), 0) || 0;
        const montantActuel = parseFloat(paiement.montant) || 0;
        const totalSansCePaiement = totalPaye - montantActuel;
        const maxAutorise = parseFloat(clientInfo.montant) - totalSansCePaiement;
        
        return Math.max(0, maxAutorise);
    };

    // Valider le formulaire
    const validateForm = () => {
        const newErrors = {};
        const maxAmount = getMaxAmount();

        if (!paiement.montant || parseFloat(paiement.montant) <= 0) {
            newErrors.montant = 'Le montant doit être supérieur à 0';
        } else if (parseFloat(paiement.montant) < 1) {
            newErrors.montant = 'Le montant minimum est de 1 Ar';
        } else if (maxAmount !== null && parseFloat(paiement.montant) > maxAmount) {
            newErrors.montant = `Le montant ne peut pas dépasser ${maxAmount.toLocaleString()} Ar`;
        }

        if (!paiement.date) {
            newErrors.date = 'La date est obligatoire';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            Swal.fire({
                toast: true,
                icon: 'warning',
                title: 'Formulaire incomplet',
                text: 'Veuillez corriger les erreurs dans le formulaire.',
                confirmButtonText: 'OK'
            });
            return;
        }

        setSaving(true);
        try {
            // Envoyer seulement les champs modifiables (montant et date)
            const dataToSend = {
                montant: paiement.montant,
                date: paiement.date
            };

            const response = await axios.put(`http://localhost:8000/api/paiements/${id}`, dataToSend, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Succès!',
                    text: response.data.message || 'Le paiement a été modifié avec succès.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Redirection directe vers la liste après succès
                    navigate('/admin/list-paiements');
                });
            } else {
                throw new Error(response.data.message);
            }

        } catch (error) {
            console.error('Erreur modification:', error);
            
            let errorMessage = 'Une erreur s\'est produite lors de la modification.';
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                const firstError = Object.values(validationErrors)[0][0];
                errorMessage = firstError;
            }

            Swal.fire({
                toast: true,
                icon: 'error',
                title: 'Erreur',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
        } finally {
            setSaving(false);
        }
    };

    // Afficher les informations de limite pour CE paiement
    const renderLimitInfo = () => {
        if (!clientInfo) return null;
        
        const totalPaye = clientInfo.paiements?.reduce((sum, p) => sum + parseFloat(p.montant), 0) || 0;
        const montantActuel = parseFloat(paiement.montant) || 0;
        const totalSansCePaiement = totalPaye - montantActuel;
        const resteAPayer = parseFloat(clientInfo.montant) - totalSansCePaiement;
        const maxAutorise = getMaxAmount();

        return (
            <div className="alert alert-info">
                <FaInfoCircle className="me-2" />
                <strong>Informations du paiement :</strong>
                <div className="row mt-2">
                    <div className="col-md-6">
                        <strong>Client:</strong> {clientInfo.nom_client}
                    </div>
                    <div className="col-md-6">
                        <strong>ID Client:</strong> {clientInfo.id}
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col-md-6">
                        <strong>Montant total:</strong> {parseFloat(clientInfo.montant).toLocaleString()} Ar
                    </div>
                    <div className="col-md-6">
                        <strong>Total payé:</strong> {totalPaye.toLocaleString()} Ar
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col-md-6">
                        <strong>Reste à payer:</strong> {resteAPayer.toLocaleString()} Ar
                    </div>
                    <div className="col-md-6">
                        <strong>Maximum autorisé:</strong> <span className="text-primary">{maxAutorise.toLocaleString()} Ar</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Chargement...</span>
                                </div>
                                <p className="mt-3">Chargement du paiement #{id}...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-2">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    Modifier le Paiement #{id}
                                </h4>
                                {/*
                                <Link to="/admin/paiements" className="btn btn-light btn-sm">
                                    <FaTimes className="me-1" />
                                    Retour à la liste
                                </Link>
                                */}
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Informations du client (lecture seule) */}
                            {clientInfo && (
                                <div className="alert alert-secondary">
                                    <FaUser className="me-2" />
                                    <strong>Client:</strong> {clientInfo.nom_client} 
                                    <span className="ms-2">|</span>
                                    <strong className="ms-2">ID:</strong> {clientInfo.id}
                                    <span className="ms-2">|</span>
                                    <strong className="ms-2">Montant total:</strong> {parseFloat(clientInfo.montant).toLocaleString()} Ar
                                </div>
                            )}

                            {/* Informations de limite */}
                            {renderLimitInfo()}

                            <form onSubmit={handleSubmit}>
                                {/* Champ Montant */}
                                <div className="mb-3">
                                    <label htmlFor="montant" className="form-label">
                                        Montant (Ar):
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            id="montant"
                                            name="montant"
                                            className={`form-control ${errors.montant ? 'is-invalid' : ''}`}
                                            value={paiement.montant}
                                            onChange={handleChange}
                                            disabled={saving}
                                            step="0.01"
                                            min="1"
                                            max={getMaxAmount() || ''}
                                            placeholder="Ex: 30000"
                                        />
                                    </div>
                                    {errors.montant && (
                                        <div className="invalid-feedback">
                                            {errors.montant}
                                        </div>
                                    )}
                                    <div className="form-text">
                                        Maximum autorisé: {getMaxAmount() ? `${getMaxAmount().toLocaleString()} Ar` : 'Chargement...'}
                                    </div>
                                </div>

                                {/* Champ Date */}
                                <div className="mb-4">
                                    <label htmlFor="date" className="form-label">
                                        Date du paiement:
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                                        value={paiement.date}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                    {errors.date && (
                                        <div className="invalid-feedback">
                                            {errors.date}
                                        </div>
                                    )}
                                </div>

                                {/* Boutons d'action */}
                                <div className="d-flex justify-content-between">
                                    <Link to="/admin/list-paiements" className="btn btn-danger">
                                        <FaTimes className="me-2" />
                                        Annuler
                                    </Link>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Enregistrement...</span>
                                                </div>
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                            <FaSave className="me-2" />
                                                Enregistrer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditPaiement;