import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './UserList.css';
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

function UserList() {
    // Liste des utilisateurs
    const [users, setUsers] = useState([]);
    // Données de pagination (page actuelle, dernière page)
    const [pagination, setPagination] = useState({});
    // Indique si les données sont en cours de chargement
    const [loading, setLoading] = useState(true);
    // Page actuelle affichée
    const [page, setPage] = useState(1);
    // Texte du champ de recherche
    const [search, setSearch] = useState("");

    // useEffect pour charger les utilisateurs quand `page` ou `search` change
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true); // Active l’état de chargement
            try {
                const response = await axios.get(`http://localhost:8000/api/users?page=${page}&search=${search}`);
                setUsers(response.data.data); // Mise à jour de la liste
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
                await axios.delete(`http://localhost:8000/api/users/${id}`);
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Succès!',
                    text: 'L\'agent a été supprimé avec succès.',
                });
                // Supprime localement l'utilisateur supprimé
                setUsers(users.filter((item) => item.id !== id));
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
        <div className="user-container">
            <div className="user mt-3" style={{ maxWidth: 1250 }}>
                {/* <div className="card pt-4 rounded shadow" style={{ width: '100%', marginLeft: '2px' }}>*/}
                {/* En-tête de la carte avec le titre et le bouton d’ajout */}
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        <FaUser size={30} color='#6610f2' /> Liste des utilisateurs
                    </h1>
                    <Link to="/register"
                        className="btn btn-secondary rounded-circle d-flex align-items-center"
                        style={{ width: "40px", height: "40px", marginLeft: '50%' }}>
                        <FaPlus size={20} />
                    </Link>
                </div>

                <div className="card-body">
                    {/* Barre de recherche */}
                    <div className="mb-4 d-flex justify-content-end">
                    </div>
                    <div className="search-bar-container">
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
                                        <th>Photo</th>
                                        <th>Nom</th>
                                        <th>Pseudo</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Rôle</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map(user => (
                                            <tr className="text-center" key={user.id}>
                                                {/* Photo de l’utilisateur */}
                                                <td data-label="Photo">
                                                    {user.photo ? (
                                                        <img
                                                            src={`http://localhost:8000/storage/${user.photo}`}
                                                            alt={`Photo de ${user.name}`}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                borderRadius: '50%',
                                                            }}
                                                        />
                                                    ) : (
                                                        'Pas de photo'
                                                    )}
                                                </td>

                                                {/* Nom, Email, Rôle */}
                                                <td data-label="Nom">{user.name}</td>
                                                <td data-label="Pseudo">{user.pseudo}</td>
                                                <td data-label="Email">{user.email}</td>
                                                <td data-label="Contact">{user.contact_ac}</td>
                                                <td data-label="Rôle">{user.role}</td>

                                                {/* Actions : Modifier / Supprimer */}
                                                <td data-label="Actions" className="d-flex justify-content-center gap-3">
                                                    <Link to={`/admin/edit-user/${user.id}`} className="btn btn-primary">
                                                        <FaEdit size={15} />
                                                    </Link>
                                                    <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                                                        <FaTrash size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                Aucun utilisateur trouvé.
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

export default UserList;
