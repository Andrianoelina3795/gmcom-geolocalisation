import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch
} from "react-icons/fa";
import './CoordonneeList.css'; 

function CoordonneeList() {
  const [coordonnees, setCoordonnees] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchCoordonnees();
  }, [page, search]);

  const fetchCoordonnees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/coordonnees?page=${page}&search=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log(' Réponse API:', response.data); // Pour debug

      // Gestion plus robuste de la réponse paginée
      let coordonneesData = [];
      let paginationData = {
        currentPage: 1,
        lastPage: 1
      };

      if (Array.isArray(response.data)) {
        // Si la réponse est directement un tableau (non paginé)
        coordonneesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Structure paginée Laravel standard
        coordonneesData = response.data.data;
        paginationData = {
          currentPage: response.data.current_page || 1,
          lastPage: response.data.last_page || 1
        };
      } else {
        // Autre structure
        coordonneesData = response.data.coordonnees || response.data.items || [];
      }

      setCoordonnees(coordonneesData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Erreur lors de la récupération des coordonnées:', error);
      setCoordonnees([]); // Assurer que coordonnees est toujours un tableau
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageClick = (newPage) => {
    setPage(newPage);
  };

  // Fonction pour formater le quartier (sécurisée)
  const formatQuartier = (quartier) => {
    if (!quartier) return 'N/A';
    
    try {
      const trimmed = quartier.toString().trim();
      const parts = trimmed.split(' ');
      return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : trimmed;
    } catch (error) {
      return 'N/A';
    }
  };

  // Fonction pour formater la date (sécurisée)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch (error) {
      return 'Date invalide';
    }
  };

  const renderPagination = () => {
    const lastPage = pagination.lastPage || 1;
    
    // Limiter l'affichage des pages pour ne pas surcharger l'interface
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(lastPage, page + 2);
    
    const pages = [];
    
    // Bouton première page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="btn btn-outline-primary mx-1"
          onClick={() => handlePageClick(1)}
          disabled={loading}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="mx-1">...</span>);
      }
    }
    
    // Pages autour de la page courante
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn ${i === page ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
          onClick={() => handlePageClick(i)}
          disabled={loading}
        >
          {i}
        </button>
      );
    }
    
    // Bouton dernière page
    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        pages.push(<span key="ellipsis2" className="mx-1">...</span>);
      }
      pages.push(
        <button
          key={lastPage}
          className="btn btn-outline-primary mx-1"
          onClick={() => handlePageClick(lastPage)}
          disabled={loading}
        >
          {lastPage}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className="container mt-3" style={{ maxWidth:1250 }}>
      <h2 className="text-center mb-3 mt-3">Liste des Coordonnées</h2>
      <hr />

      <div className="search-bar-container">
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un quartier, une commune, etc..."
            value={search}
            onChange={handleSearchChange}
          />
          <div className="search-icon" aria-label="Rechercher">
            <FaSearch />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive client-table-scroll">
            <table className="table table-bordered table-striped table-hover full-width-table">
              <thead className="table-dark">
                <tr>
                  <th>Nom</th>
                  <th>Longitude</th>
                  <th>Latitude</th>
                  <th>Quartier</th>
                  <th>Commune</th>
                  <th>District</th>
                  <th>Région</th>
                  <th>Province</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {coordonnees.length > 0 ? (
                  coordonnees.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontSize: 12 }}>{c.user_name || 'N/A'}</td>
                      <td style={{ fontSize: 12 }}>{c.longitude || 'N/A'}</td>
                      <td style={{ fontSize: 12 }}>{c.latitude || 'N/A'}</td>
                      <td style={{ fontSize: 12 }}>{formatQuartier(c.quartier)}</td>
                      <td style={{ fontSize: 12 }}>{c.commune || 'N/A'}</td>
                      <td style={{ fontSize: 12 }}>{c.district || 'N/A'}</td>
                      <td style={{ fontSize: 12 }}>{c.region || 'N/A'}</td>
                      <td style={{ fontSize: 12 }}>{c.province || 'N/A'}</td>
                      <td style={{ fontSize: 12 }}>{formatDate(c.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Aucune Coordonnée trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination seulement s'il y a plus d'une page */}
          {(pagination.lastPage > 1) && (
            <div className="flex gap-2 mt-3 d-flex justify-content-center align-items-center">
              <button
                className="btn btn-secondary"
                onClick={() => setPage(page - 1)}
                disabled={loading || page === 1}
                aria-label="Page précédente"
              >
                <FaChevronLeft />
              </button>

              {renderPagination()}

              <button
                className="btn btn-secondary"
                onClick={() => setPage(page + 1)}
                disabled={loading || page === pagination.lastPage}
                aria-label="Page suivante"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CoordonneeList;
