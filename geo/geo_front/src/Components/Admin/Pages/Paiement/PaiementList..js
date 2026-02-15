import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './PaiementList.css';
import {
    FaEdit,
    FaTrash,
    FaUser,
    FaPlus,
    FaSearch,
    FaChevronRight,
    FaChevronLeft,
    FaBox
} from "react-icons/fa";
import Swal from "sweetalert2";

function PaiementList() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const [paiements, setPaiements] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    // Charger les paiements
    useEffect(() => {
        const fetchPaiements = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/api/paiements?page=${page}&search=${search}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    }
                });
                
                setPaiements(response.data.data);
                setPagination({
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page,
                    total: response.data.total
                });
            } catch (error) {
                console.error('Erreur chargement paiements:', error);
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de charger les paiements.',
                    confirmButtonText: 'OK'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPaiements();
    }, [page, search, token]);

    // Supprimer un paiement
    const handleDelete = async (id) => {
        const confirmation = await Swal.fire({
            toast: true,
            title: 'Confirmer la suppression',
            text: "Cette action est irréversible, voulez-vous continuer?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
        });

        if (confirmation.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8000/api/paiements/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Le paiement a été supprimé avec succès.',
                });
                
                // Recharger les données
                setPaiements(paiements.filter((item) => item.id !== id));
            } catch (error) {
                console.error('Erreur suppression:', error);
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Erreur !',
                    text: 'Une erreur s\'est produite lors de la suppression.',
                });
            }
        }
    };

    // Gère la recherche
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    // Pagination
    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.lastPage, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`btn ${i === pagination.currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                    onClick={() => setPage(i)}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    // Formater la date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="prod-container">
            <div className="prod mt-3" style={{ maxWidth: 1250 }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        Liste des paiements GMCOM
                    </h1>
                    <div className="text-muted">
                        Total: {pagination.total || 0} paiement(s)
                    </div>
                </div>

                <div className="card-body">
                    {/* Barre de recherche */}
                    <div className="search-bar-container mt-3">
                        <div className="search-input-group">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Rechercher par ID client, nom client ou produit..."
                                value={search}
                                onChange={handleSearchChange}
                            />
                            <div className="search-icon">
                                <FaSearch />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-grow text-primary text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-2">Chargement des paiements...</p>
                        </div>
                    ) : (
                        <>
                            {/* Tableau des paiements */}
                            <table className="table table-striped table-bordered mt-3">
                                <thead className="table-dark">
                                    <tr className="text-center">
                                        <th>ID Paiement</th>
                                        <th>Client/ID</th>
                                        <th>Produit</th>
                                        <th>Date</th>
                                        <th>Montant</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paiements.length > 0 ? (
                                        paiements.map(paiement => (
                                            <tr className="text-center" key={paiement.id}>
                                                <td data-label="ID">#{paiement.id}</td>
                                                <td data-label="Client">
                                                    <div>
                                                        <strong>{paiement.client?.nom_client || 'N/A'}</strong>
                                                    </div>
                                                    <small className="text-muted">ID: {paiement.client_id}</small>
                                                </td>
                                                <td data-label="Produit">
                                                    {paiement.client?.produit ? (
                                                        <div>
                                                            <strong>{paiement.client.produit}</strong>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">Non spécifié</span>
                                                    )}
                                                </td>
                                                <td data-label="Date">{formatDate(paiement.created_at)}</td>
                                                <td data-label="Montant" className="fw-bold text-success">
                                                    {parseFloat(paiement.montant).toLocaleString()} Ar
                                                </td>
                                                <td data-label="Actions" className="d-flex justify-content-center gap-2">
                                                    <Link 
                                                        to={`/admin/edit-paiement/${paiement.id}`} 
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        <FaEdit size={14} />
                                                    </Link>
                                                    <button 
                                                        className="btn btn-danger btn-sm" 
                                                        onClick={() => handleDelete(paiement.id)}
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <div className="text-muted">
                                                    <FaUser size={32} className="mb-2" />
                                                    <br />
                                                    Aucun paiement trouvé.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {pagination.lastPage > 1 && (
                                <div className="flex justify-content-center align-items-center mt-3 gap-2">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        <FaChevronLeft />
                                    </button>

                                    {renderPagination()}

                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === pagination.lastPage}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaiementList;