import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './ClientList.css';
import { FaEdit, FaSearch, FaTrash, FaChevronRight, FaChevronLeft, FaFilter, FaFileExport, FaChartBar } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  // États pour la recherche et pagination
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [typeTravaux, setTypeTravaux] = useState("");
  const [clientStatus, setClientStatus] = useState("");
  const [exporting, setExporting] = useState(false);

  // Fonction pour gérer les erreurs d'authentification
  const handleAuthError = useCallback(() => {
    Swal.fire({
      icon: 'warning',
      title: 'Session expirée',
      text: 'Votre session a expiré. Veuillez vous reconnecter.',
      confirmButtonText: 'Se reconnecter'
    }).then(() => {
      localStorage.removeItem('token');
      navigate('/login');
    });
  }, [navigate]);

  // Récupérer la liste des agents (AC)
  const fetchAgents = useCallback(async () => {
    if (!token) {
      handleAuthError();
      return;
    }

    setLoadingAgents(true);
    try {
      const response = await axios.get('http://localhost:8000/api/agents', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Normaliser les données des agents
      const agentsData = response.data.agents || response.data;
      const normalizedAgents = agentsData.map(agent => {
        if (typeof agent === 'string') {
          return { id: agent, name: agent };
        }
        return {
          id: agent.id || agent.name,
          name: agent.name || agent.pseudo || agent.email || 'Agent inconnu'
        };
      });
      
      setAgents(normalizedAgents);
    } catch (error) {
      console.error('Erreur chargement agents:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        fetchAgentsFromClients();
      }
    } finally {
      setLoadingAgents(false);
    }
  }, [token, handleAuthError]);

  // Fallback: Récupérer les agents depuis la liste des clients
  const fetchAgentsFromClients = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/clients?page=1&per_page=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const uniqueAgents = [...new Set(response.data.data
        .filter(client => client.ac)
        .map(client => client.ac)
      )].map((acName, index) => ({
        id: acName,
        name: acName
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      setAgents(uniqueAgents);
    } catch (error) {
      console.error('Erreur récupération agents depuis clients:', error);
    }
  }, [token]);

  // Récupérer les statistiques
  const fetchStats = useCallback(async () => {
    if (!token) return;

    setLoadingStats(true);
    try {
      const response = await axios.get('http://localhost:8000/api/clients/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      // Si l'endpoint n'existe pas, on calcule les stats localement
      calculateLocalStats();
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  // Calcul des stats locales en fallback
  const calculateLocalStats = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/clients?per_page=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const allClients = response.data.data;
      const typeTravauxCount = {};
      const agentCount = {};

      allClients.forEach(client => {
        if (client.type_travaux) {
          typeTravauxCount[client.type_travaux] = (typeTravauxCount[client.type_travaux] || 0) + 1;
        }
        if (client.ac) {
          agentCount[client.ac] = (agentCount[client.ac] || 0) + 1;
        }
      });

      const stats = {
        total: allClients.length,
        clients: allClients.filter(c => c.type === 'Client').length,
        prospects: allClients.filter(c => c.type === 'Prospect').length,
        follow_ups: allClients.filter(c => c.type === 'Follow_up').length,
        by_type_travaux: Object.keys(typeTravauxCount).map(key => ({
          type_travaux: key,
          count: typeTravauxCount[key]
        })),
        by_agent: Object.keys(agentCount).map(key => ({
          ac: key,
          count: agentCount[key]
        }))
      };

      setStats(stats);
    } catch (error) {
      console.error('Erreur calcul stats locales:', error);
    }
  }, [token]);

  // Récupérer les clients avec filtres
  const fetchClients = useCallback(async (currentPage = page) => {
    if (!token) {
      handleAuthError();
      return;
    }

    setLoading(true);
    try {
      let url = `http://localhost:8000/api/clients?page=${currentPage}&per_page=5`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      if (selectedAgent) {
        url += `&ac=${encodeURIComponent(selectedAgent)}`;
      }

      if (typeTravaux) {
        url += `&type_travaux=${encodeURIComponent(typeTravaux)}`;
      }

      if (clientStatus) {
        url += `&type=${encodeURIComponent(clientStatus)}`;
      }

      console.log('URL appelée:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      setClients(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
        perPage: response.data.per_page
      });
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      
      if (error.response?.status === 401) {
        handleAuthError();
        return;
      }
      
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Impossible de charger les données.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  }, [token, search, selectedAgent, typeTravaux, clientStatus, page, handleAuthError]);

  // useEffect pour charger les données initiales
  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, [fetchAgents, fetchStats]);

  // useEffect pour charger les clients avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [search, selectedAgent, typeTravaux, clientStatus, fetchClients]);

  // Gère la recherche avec debounce
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setSearch(e.target.value);
    setPage(1);
  };

  // Gère la sélection d'un agent
  const handleAgentChange = (e) => {
    setSelectedAgent(e.target.value);
    setPage(1);
  };

  // Gère le changement de type de travaux
  const handleTypeTravauxChange = (e) => {
    setTypeTravaux(e.target.value);
    setPage(1);
  };

  // Gère le changement de statut
  const handleClientStatusChange = (e) => {
    setClientStatus(e.target.value);
    setPage(1);
  };

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setSearch("");
    setSearchInput("");
    setSelectedAgent("");
    setTypeTravaux("");
    setClientStatus("");
    setPage(1);
  };

  // Export des données
  const handleExport = async () => {
    if (!token) {
      handleAuthError();
      return;
    }

    setExporting(true);
    try {
      const response = await axios.get('http://localhost:8000/api/clients/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob'
      });
      
      // Créer un blob URL pour le téléchargement
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Récupérer le filename depuis les headers ou utiliser un nom par défaut
      const contentDisposition = response.headers['content-disposition'];
      let filename = `clients_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Export réussi',
        text: 'Les données ont été exportées avec succès.',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Erreur export:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Erreur export',
        text: error.response?.data?.message || 'Impossible d\'exporter les données.',
        confirmButtonText: 'OK'
      });
    } finally {
      setExporting(false);
    }
  };

  // Génère dynamiquement les boutons de pagination
  const renderPagination = () => {
    if (!pagination.lastPage || pagination.lastPage <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.lastPage, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="btn btn-outline-primary mx-1"
          onClick={() => setPage(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="mx-1">...</span>);
      }
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

    if (endPage < pagination.lastPage) {
      if (endPage < pagination.lastPage - 1) {
        pages.push(<span key="ellipsis2" className="mx-1">...</span>);
      }
      pages.push(
        <button
          key={pagination.lastPage}
          className="btn btn-outline-primary mx-1"
          onClick={() => setPage(pagination.lastPage)}
        >
          {pagination.lastPage}
        </button>
      );
    }

    return pages;
  };

  // Suppression d'un client
  const handleDelete = async (id) => {
    if (!token) {
      handleAuthError();
      return;
    }

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
        await axios.delete(`http://localhost:8000/api/clients/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        // Recharger les données et statistiques
        fetchClients();
        fetchStats();

        Swal.fire({
          toast: true,
          icon: 'success',
          title: 'Succès!',
          text: 'Client supprimé avec succès.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        if (error.response?.status === 401) {
          handleAuthError();
          return;
        }

        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'Erreur !',
          text: error.response?.data?.message || "Une erreur s'est produite lors de la suppression.",
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = search || selectedAgent || typeTravaux || clientStatus;

  return (
    <div className="client-list-container container mt-3" style={{ maxWidth: 1250 }}>
      <h2 className="text-center mb-3 mt-3">Liste des Clients/Prospect/FollowUp</h2>
      <hr />

      {/* Barre d'actions principale */}
      <div className="action-bar mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Recherche</label>
            <div className="search-input-group">
              <input
                type="text"
                className="search-input"
                placeholder="Tapez votre recherche ici..."
                value={searchInput}
                onChange={handleSearchChange}
              />
              <div className="search-icon">
                <FaSearch />
              </div>
            </div>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" />
              Filtres {hasActiveFilters && ''}
            </button>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-outline-info w-100"
              onClick={() => setShowStats(!showStats)}
            >
              <FaChartBar className="me-1" />
              Stats
            </button>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-success w-100"
              onClick={handleExport}
              disabled={exporting}
            >
              <FaFileExport className="me-1" />
              {exporting ? 'Export...' : 'Exporter'}
            </button>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-outline-danger w-100"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Filtres avancés*/}
        {showFilters && (
          <div className="advanced-filters mt-3 p-3 border rounded bg-light">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Agent Commercial</label>
                <select 
                  className="form-select" 
                  value={selectedAgent} 
                  onChange={handleAgentChange}
                >
                  <option value="">Tous les agents</option>
                  {loadingAgents ? (
                    <option disabled>Chargement des agents...</option>
                  ) : (
                    agents.map((agent) => (
                      <option key={agent.id} value={agent.name}>
                        {agent.name} {/*  Affiche le nom, pas l'objet */}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Type de travaux</label>
                <select 
                  className="form-select" 
                  value={typeTravaux} 
                  onChange={handleTypeTravauxChange}
                >
                  <option value="">Tous les types</option>
                  <option value="KB">KB</option>
                  <option value="RN">RN</option>
                  <option value="VB">VB</option>
                </select>
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Statut</label>
                <select 
                  className="form-select" 
                  value={clientStatus} 
                  onChange={handleClientStatusChange}
                >
                  <option value="">Tous les statuts</option>
                  <option value="Client">Client</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Follow_up">Follow up</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        {showStats && (
          <div className="stats-panel mt-3 p-3 border rounded bg-light">
            <h5 className="mb-3">📊 Statistiques des Clients</h5>
            {loadingStats ? (
              <div className="text-center">
                <div className="spinner-grow text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <span className="ms-2">Chargement des statistiques...</span>
              </div>
            ) : stats ? (
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="card text-white bg-primary">
                    <div className="card-body text-center">
                      <h4>{stats.total}</h4>
                      <small>Total Clients</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-white bg-success">
                    <div className="card-body text-center">
                      <h4>{stats.clients}</h4>
                      <small>Clients</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-white bg-secondary">
                    <div className="card-body text-center">
                      <h4>{stats.prospects}</h4>
                      <small>Prospects</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-white bg-info">
                    <div className="card-body text-center">
                      <h4>{stats.follow_ups}</h4>
                      <small>Follow-ups</small>
                    </div>
                  </div>
                </div>
                
                {/* Statistiques par type de travaux */}
                {stats.by_type_travaux && stats.by_type_travaux.length > 0 && (
                  <div className="col-12 mt-3">
                    <h6>Répartition par type de travaux:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {stats.by_type_travaux.map((item, index) => (
                        <span key={index} className="badge bg-warning text-dark">
                          {item.type_travaux}: {item.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted">
                Impossible de charger les statistiques
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicateurs de filtres actifs */}
      {hasActiveFilters && (
        <div className="alert alert-info mb-3">
          <strong>{pagination.total || clients.length}</strong> client(s) trouvé(s)
          {selectedAgent && ` pour l'agent: ${selectedAgent}`}
          {typeTravaux && ` | Type travaux: ${typeTravaux}`}
          {clientStatus && ` | Statut: ${clientStatus}`}
          {search && ` | Recherche: "${search}"`}
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement des clients...</p>
        </div>
      ) : (
        <>
          {/* Tableau des clients */}
          <div className="table-responsive client-table-scroll">
            <table className="table table-bordered table-striped table-hover full-width-table">
              <thead className="table-dark">
                <tr>
                  <th>Photo</th>
                  <th>ID Client</th>
                  <th>Type</th>
                  <th>Activité</th>
                  <th>Type Travaux</th>
                  
                  <th>Type client</th>
                  <th>Nom client</th>
                  <th>Contact  Client</th>
                  <th>Adresse</th>
                  <th>Fokontany</th>
                  <th>Commune</th>
                  <th>Province</th>
                  <th>Date création</th>
                  <th>AC</th>
                  <th>Contact AC</th>
                  
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="text-center py-4">
                      <div className="text-muted">
                        <FaSearch size={32} className="mb-2" />
                        <p>Aucun client trouvé</p>
                        {hasActiveFilters && (
                          <small>Essayez de modifier vos critères de filtrage</small>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        {client.photo ? (
                          <img
                            src={`http://localhost:8000/storage/${client.photo}`}
                            alt={`Photo de ${client.nom_client}`}
                            className="client-photo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="no-photo-placeholder">
                            <span>Pas de photo</span>
                          </div>
                        )}
                      </td>
                      <td><strong>#{client.id_client}</strong></td>
                      <td>
                        <span className={`badge ${
                          client.type === 'Client' ? 'bg-success' : 
                          client.type === 'Prospect' ? 'bg-secondary' : 'bg-info'
                        }`}>
                          {client.type || 'N/A'}
                        </span>
                      </td>
                      <td>{client.activite || 'N/A'}</td>
                      <td>{client.type_travaux || 'N/A'}</td>
                      
                      <td>{client.type_client || 'N/A'}</td>
                      <td><strong>{client.nom_client || 'N/A'}</strong></td>
                       <td>
                        {client.contact_client ? (
                          <a href={`tel:${client.contact_client}`} className="text-decoration-none">
                            {client.contact_client}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>{client.adresse || 'N/A'}</td>
                      <td>{client.fokontany || 'N/A'}</td>
                      <td>{client.commune || 'N/A'}</td>
                      <td>{client.province || 'N/A'}</td>
                      <td>{formatDate(client.created_at)}</td>
                      <td>
                        <span>{client.ac || 'N/A'}</span>
                      </td>
                      <td>{client.contact_ac || 'N/A'}</td>
                     
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Link
                            to={`/admin/edit-client/${client.id}`}
                            className="btn btn-sm btn-primary"
                            title="Modifier le client"
                          >
                            <FaEdit size={15} />
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(client.id)}
                            title="Supprimer le client"
                          >
                            <FaTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {clients.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Page {pagination.currentPage} sur {pagination.lastPage} • 
                Affichage de {(pagination.currentPage - 1) * pagination.perPage + 1} à {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} • 
                Total: {pagination.total} clients
              </div>
              
              <div className="d-flex gap-2 align-items-center">
                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <FaChevronLeft />
                </button>

                {renderPagination()}

                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.lastPage}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientList;
