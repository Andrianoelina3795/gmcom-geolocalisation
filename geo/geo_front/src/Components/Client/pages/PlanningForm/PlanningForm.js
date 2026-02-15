import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './PlanningForm.css';

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const activites = ['P', 'V', 'T'];
const labels = {
    P: 'Présentation',
    V: 'Vente',
    T: 'Travaux',
};

const PlanningForm = () => {
    const [planning, setPlanning] = useState({
        Lundi: { P: 0, V: 0, T: 0 },
        Mardi: { P: 0, V: 0, T: 0 },
        Mercredi: { P: 0, V: 0, T: 0 },
        Jeudi: { P: 0, V: 0, T: 0 },
        Vendredi: { P: 0, V: 0, T: 0 },
    });
    const [loading, setLoading] = useState(false);
    const [existingPlanning, setExistingPlanning] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token') || '';

    useEffect(() => {
        const fetchUserPlanning = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/planning/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.exists) {
                    setPlanning(response.data.semaine);
                    setExistingPlanning(true);
                }
            } catch (error) {
                console.error('Erreur chargement planning:', error);
            }
        };

        fetchUserPlanning();
    }, [token]);

    const handleChange = (jour, activite, value) => {
        setPlanning({
            ...planning,
            [jour]: {
                ...planning[jour],
                [activite]: parseInt(value, 10) || 0,
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                'http://localhost:8000/api/plannings',
                { semaine: planning },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: res.data.message || 'Planning enregistré avec succès !',
                showConfirmButton: false,
                timer: 2500,
            });

            setTimeout(() => {
                navigate('/planning-list');
            }, 1000);

        } catch (error) {
            console.error(error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Erreur lors de l\'enregistrement du planning',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (activite) => {
        return Object.values(planning).reduce((sum, jour) => sum + (jour[activite] || 0), 0);
    };

    const calculateJourTotal = (jour) => {
        return planning[jour].P + planning[jour].V + planning[jour].T;
    };

    const calculateGrandTotal = () => {
        return Object.values(planning).reduce((total, jour) => {
            return total + jour.P + jour.V + jour.T;
        }, 0);
    };

    return (
        <>
            <div className='header-planningForm'>
                <div className="planning-container mt-5">
                    <div className="card">
                        <div className="card-header text-center">
                            <h2 className="title mb-0">
                                {existingPlanning ? 'Modifier mon planning' : 'Créer mon planning'} - Semaine suivante
                            </h2>
                        </div>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="responsive-table-container">
                                    <table className="table table-bordered text-center planning-table">
                                        <thead className="table-header">
                                            <tr>
                                                <th className="bg-light">Activités / Jours</th>
                                                {jours.map((jour) => (
                                                    <th key={jour}>{jour}</th>
                                                ))}
                                                <th className="bg-light">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activites.map((activite) => (
                                                <tr key={activite}>
                                                    <td className="activity-label">{labels[activite]}</td>
                                                    {jours.map((jour) => (
                                                        <td key={`${jour}-${activite}`}>
                                                            <input
                                                                type="number"
                                                                className="form-control text-center"
                                                                min="0"
                                                                value={planning[jour][activite]}
                                                                onChange={(e) =>
                                                                    handleChange(jour, activite, e.target.value)
                                                                }
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="total-cell">
                                                        <strong>{calculateTotal(activite)}</strong>
                                                    </td>
                                                </tr>
                                            ))}

                                            <tr className="table-info">
                                                <td className="activity-label"><strong>Total/Jour</strong></td>
                                                {jours.map((jour) => (
                                                    <td key={`total-${jour}`} className="total-cell">
                                                        <strong>{calculateJourTotal(jour)}</strong>
                                                    </td>
                                                ))}
                                                <td className="total-cell">
                                                    <strong>{calculateGrandTotal()}</strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        style={{ width: '69%', padding: 8 }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            'Enregistrer le planning'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/planning-list')}
                                        style={{ width: '30%' }}
                                    >
                                        ← Retour à la liste
                                    </button>


                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlanningForm;
