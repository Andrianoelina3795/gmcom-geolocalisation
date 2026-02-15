import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './ProduitList.css';
import {
    FaEdit,
    FaTrash,
    FaUser,
    FaPlus,
    FaSearch,
    FaChevronRight,
    FaChevronLeft
} from "react-icons/fa";
import Swal from "sweetalert2";

function ProduitList() {
    // Liste des produits
    const [produits, setProduits] = useState([]);
    // Données de pagination (page actuelle, dernière page)
    const [pagination, setPagination] = useState({});
    // Indique si les données sont en cours de chargement
    const [loading, setLoading] = useState(true);
    // Page actuelle affichée
    const [page, setPage] = useState(1);
    // Texte du champ de recherche
    const [search, setSearch] = useState("");

    // useEffect pour charger les produits quand `page` ou `search` change
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true); // Active l’état de chargement
            try {
                const response = await axios.get(`http://localhost:8000/api/produits?page=${page}&search=${search}`);
                setProduits(response.data.data); // Mise à jour de la liste
                setPagination({
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page
                });
            } catch (error) {
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de charger les données.',
                    confirmButtonText: 'OK'
                });
            } finally {
                setLoading(false); // Désactive le chargement, même en cas d'erreur
            }
        };

        fetchUsers();
    }, [page, search]);

    // Fonction pour supprimer un utilisateur
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
                await axios.delete(`http://localhost:8000/api/produits/${id}`);
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Succès!',
                    text: 'L\'agent a été supprimé avec succès.',
                });
                // Supprime localement l'utilisateur supprimé
                setProduits(produits.filter((item) => item.id !== id));
            } catch (error) {
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Erreur !',
                    text: 'Une erreur s\'est produite lors de la suppression.',
                });
            }
        }
    };

    // Gère la recherche (mise à jour du champ)
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Repart de la première page
    };

    // Gère le changement de page
    const handlePageClick = (newPage) => {
        setPage(newPage);
    };

    // Génère dynamiquement les boutons de pagination
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.lastPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`btn ${i === pagination.currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                    onClick={() => handlePageClick(i)}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="prod-container">
            <div className="prod mt-3" style={{ maxWidth: 1250 }}>
                { /* <div className="card pt-4 rounded shadow" style={{ width: '100%', marginLeft: '2px' }}>*/}
                {/* En-tête de la carte avec le titre et le bouton d’ajout */}
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        Liste des produits ou service du GMCOM
                    </h2>
                    <Link to="/admin/ajout-produit"
                        className="btn btn-secondary rounded-circle d-flex align-items-center"
                        style={{ width: "40px", height: "40px", marginLeft: '50%' }}>
                        <FaPlus size={20} />
                    </Link>
                </div>

                <div className="card-body">
                    {/* Barre de recherche */}

                    <div className="search-bar-container mt-3">
                        <div className="search-input-group">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={handleSearchChange}
                            />
                            <div className="search-icon" aria-label="Rechercher">
                                <FaSearch />
                            </div>
                        </div>
                    </div>

                    {/* Affiche le message de chargement */}
                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-grow text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tableau des utilisateurs */}
                            <table className="table table-striped table-bordered">
                                <thead className="table-dark">
                                    <tr className="text-center">
                                        {/*<th>Numéro</th>*/}
                                        <th>Type produit</th>
                                        <th>Nom produit</th>
                                        <th>Montant produit</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produits.length > 0 ? (
                                        produits.map(p => (
                                            <tr className="text-center" key={p.id}>
                                                {/* id, type_produit, nom_produit, montant_produit */}
                                                {/*<td data-label="id">#{p.id}</td>*/}
                                                <td data-label="type_produit">{p.type_produit}</td>
                                                <td data-label="nom_produit">{p.nom_produit}</td>
                                                <td data-label="montant_produit">{p.montant_produit} Ar</td>

                                                {/* Actions : Modifier / Supprimer */}
                                                <td data-label="Actions" className="d-flex justify-content-center gap-3">
                                                    <Link to={`/admin/edit-produit/${p.id}`} className="btn btn-primary">
                                                        <FaEdit size={14} />
                                                    </Link>
                                                    <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                Aucun produit trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination : flèches et numéros */}
                            <div className="flex gap-2 mt-3 d-flex justify-content-center">
                                {/* Page précédente */}
                                <button
                                    className="flex gap-1 px-3 py-1 border rounded"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    <FaChevronLeft />
                                </button>

                                {/* Numéros de page */}
                                {renderPagination()}

                                {/* Page suivante */}
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === pagination.lastPage}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </>
                    )}
                </div>
                {/*</div>*/}
            </div>
        </div>
    );
}

export default ProduitList;
