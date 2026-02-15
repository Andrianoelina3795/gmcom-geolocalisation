import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaMapMarkerAlt, FaUsers, FaChartLine, FaRegChartBar,
    FaUserCircle, FaRecycle, FaExclamationTriangle, FaSync
} from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import './Dashboard.css';
import { MdLogout, MdPieChart } from "react-icons/md";
import defaultAvatar from '../../../../assets/images/profile_par_defaut.jpg';
import Swal from "sweetalert2";

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const REFRESH_INTERVAL = 300000; // 5 minutes

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [coordonnees, setCoordonnees] = useState([]);
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [activity, setActivity] = useState(0);
    const [dataGraph, setDataGraph] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const navigate = useNavigate();

    const COLORS = ['#82ca9d', '#8884d8', 'skyblue', '#ffc658', '#ff8042'];

    // Fonction de déconnexion
    const handleLogout = () => {
        Swal.fire({
            toast: true,
            title: 'Déconnexion',
            text: "Êtes-vous sûr de vouloir vous déconnecter ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Déconnecter',
            cancelButtonText: 'Annuler',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                Swal.fire({
                    icon: 'success',
                    title: 'Déconnecté',
                    text: 'Vous êtes déconnecté avec succès !',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate("/login");
            }
        });
    };

    // Gestion des erreurs API
    const handleApiError = (error, endpoint) => {
        console.error(`Erreur sur ${endpoint}:`, error);
        if (error.response?.status === 401) {
            navigate("/login");
            return true;
        }
        return false;
    };

    // Récupération du token
    const getAuthToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login");
            throw new Error('Token non trouvé');
        }
        return token;
    };

    // Fonction pour rafraîchir les données
    const refreshData = async () => {
        setLoading(true);
        setError(null);
        await fetchData();
    };

    // Fonction centrale pour récupérer les données
    const fetchData = async () => {
        let token;
        try {
            token = getAuthToken();
        } catch (error) {
            navigate("/login");
            return;
        }

        try {
            const [
                usersResponse,
                coordonneesResponse,
                clientsResponse,
                produitsResponse,
                activityResponse
            ] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/users/dataChart`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/coordonnees/dataChart`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/clients/dataChart`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/produits/dataChart`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/getTodayActivities`, { 
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const errors = [];

            // Traitement des réponses
            if (usersResponse.status === 'fulfilled') {
                const usersData = Array.isArray(usersResponse.value.data) 
                    ? usersResponse.value.data 
                    : usersResponse.value.data?.data || [];
                
                const adminCount = usersData.filter(user => user.role === 'admin').length;
                const userCount = usersData.filter(user => user.role === 'AC').length;
                const superviseurCount = usersData.filter(user => user.role === 'superviseur').length;
                
                setDataGraph([
                    { name: 'Admin', value: adminCount },
                    { name: 'Agent Commercial', value: userCount },
                    { name: 'Superviseur', value: superviseurCount },
                ]);
                setUsers(usersData);
            } else {
                if (!handleApiError(usersResponse.reason, 'Utilisateurs')) {
                    errors.push('Utilisateurs');
                }
            }

            if (coordonneesResponse.status === 'fulfilled') {
                const coordData = Array.isArray(coordonneesResponse.value.data) 
                    ? coordonneesResponse.value.data 
                    : coordonneesResponse.value.data?.data || [];
                setCoordonnees(coordData);
            } else {
                if (!handleApiError(coordonneesResponse.reason, 'Coordonnées')) {
                    errors.push('Coordonnées');
                }
            }

            if (clientsResponse.status === 'fulfilled') {
                const clientsData = Array.isArray(clientsResponse.value.data) 
                    ? clientsResponse.value.data 
                    : clientsResponse.value.data?.data || [];
                setClients(clientsData);
            } else {
                if (!handleApiError(clientsResponse.reason, 'Clients')) {
                    errors.push('Clients');
                }
            }

            if (produitsResponse.status === 'fulfilled') {
                const produitsData = Array.isArray(produitsResponse.value.data) 
                    ? produitsResponse.value.data 
                    : produitsResponse.value.data?.data || [];
                setProduits(produitsData);
            } else {
                if (!handleApiError(produitsResponse.reason, 'Produits')) {
                    errors.push('Produits');
                }
            }

            if (activityResponse.status === 'fulfilled') {
                const activityData = activityResponse.value.data;
                if (typeof activityData === 'number') {
                    setActivity(activityData);
                } else if (typeof activityData === 'object' && activityData.count !== undefined) {
                    setActivity(activityData.count);
                } else {
                    setActivity(0);
                }
            } else {
                if (!handleApiError(activityResponse.reason, 'Activités')) {
                    errors.push('Activités');
                }
            }

            if (errors.length > 0) {
                setError(`Erreur de chargement: ${errors.join(', ')}`);
            }

            setLastUpdate(new Date().toLocaleTimeString());

        } catch (error) {
            console.error('Erreur générale:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem("user");
        
        if (!token || !storedUser || storedUser === "undefined") {
            navigate("/login");
            return;
        }

        setUser(JSON.parse(storedUser));
        fetchData();

        const interval = setInterval(refreshData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [navigate]);

    // Données mémoïsées pour les performances
    const statCards = useMemo(() => [
        { label: 'Produits', value: produits.length, link: '/admin/list-produit', icon: <FaRecycle size={28} /> },
        { label: 'Utilisateurs', value: users.length, link: '/admin/users', icon: <FaUsers size={28} /> },
        { label: 'Coordonnées', value: coordonnees.length, link: '/admin/list-coordonnee', icon: <FaMapMarkerAlt size={24} /> },
        { label: 'Clients', value: clients.length, link: '/admin/client-list', icon: <FaUserCircle size={24} /> },
        { label: 'Activités', value: activity, link: '/admin/activite-duJour', icon: <FaChartLine size={24} /> },
    ], [produits.length, users.length, coordonnees.length, clients.length, activity]);

    const chartData = useMemo(() => [
        { name: 'Produits', value: produits.length },
        { name: 'Utilisateurs', value: users.length },
        { name: 'Coordonnées', value: coordonnees.length },
        { name: 'Clients', value: clients.length },
        { name: 'Activités', value: activity },
    ], [produits.length, users.length, coordonnees.length, clients.length, activity]);

    // Composants de tooltip personnalisés
    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-white p-3 border rounded shadow">
                    <p className="font-weight-bold">{`${label}`}</p>
                    <p className="text-primary">{`Total: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const totalUsers = users.length;
            const percentage = totalUsers > 0 ? ((payload[0].value / totalUsers) * 100).toFixed(1) : 0;
            return (
                <div className="custom-tooltip bg-white p-3 border rounded shadow">
                    <p className="font-weight-bold">{`Rôle: ${payload[0].name}`}</p>
                    <p className="text-primary">{`Nombre: ${payload[0].value}`}</p>
                    <p>{`Pourcentage: ${percentage}%`}</p>
                </div>
            );
        }
        return null;
    };

    // Composant de carte de statistique
    const StatCard = ({ item, index }) => (
        <div className="col-md">
            <div 
                className="p-4 rounded shadow d-flex align-items-center text-white position-relative stat-card"
                style={{ 
                    height: '135px', 
                    backgroundColor: [
                        '#48d483', // Produits - Vert
                        'orange',   // Utilisateurs - Orange
                        '#87CEEB', // Coordonnées - Bleu ciel
                        'yellowgreen', // Clients - Vert jaune
                        '#f3cd29'  // Activités - Jaune
                    ][index]
                }}
            >
                <div className="stat-icon me-3">
                    {item.icon}
                </div>
                <div className="flex-grow-1">
                    <Link 
                        to={item.link} 
                        className="text-white fw-bold text-decoration-none h5 mb-2 d-block"
                    >
                        {item.label}
                    </Link>
                    <div className="d-flex align-items-baseline">
                        <span className="h3 fw-bold me-2">{item.value}</span>
                        <small className="opacity-75">éléments</small>
                    </div>
                </div>
            </div>
        </div>
    );

    // Composant de profil utilisateur
    const UserProfile = ({ user, onLogout }) => (
        <div className="dropdown text-end me-4 mt-2">
            <button
                className="btn dropdown-toggle d-flex align-items-center bg-light border-0 shadow-sm"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Menu profil"
            >
                <span className="fw-semibold me-2" style={{ fontSize: 14 }}>
                    {user ? user.name : "Cher utilisateur"}
                </span>
                <img
                    src={user?.photo ? `http://localhost:8000/storage/${user.photo}` : defaultAvatar}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: 45, height: 45, objectFit: "cover" }}
                    onError={(e) => {
                        e.target.src = defaultAvatar;
                    }}
                />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow">
                <li className="px-3 py-2 text-primary small">
                    <strong>{user?.name}</strong>
                    <br />
                    <span className="text-muted">{user?.email}</span>
                    <br />
                    <span className="badge bg-secondary">{user?.role}</span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={onLogout}
                    >
                        <MdLogout size={18} /> Déconnexion
                    </button>
                </li>
            </ul>
        </div>
    );

    if (loading && !lastUpdate) {
        return (
            <div className="dash d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="text-center">
                    <div className="spinner-grow text-primary mb-3" style={{ width: '2rem', height: '2rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash" style={{ maxWidth: 1260, margin: '0 auto' }}>
            {/* En-tête */}
            <div className="content-header d-flex justify-content-between align-items-start mb-4">
                <div className="mt-2">
                    <h3 className="text-success fw-semibold mb-1">
                        Bienvenue sur le Tableau de Bord
                    </h3>
                    <div className="d-flex align-items-center gap-3">
                        {lastUpdate && (
                            <small className="text-muted">
                                Dernière mise à jour: {lastUpdate}
                            </small>
                        )}
                        <button 
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={refreshData}
                            disabled={loading}
                            aria-label="Rafraîchir les données"
                        >
                            <FaSync size={14} className={loading ? 'spinning' : ''} />
                            {loading ? 'Rafraîchissement...' : 'Rafraîchir'}
                        </button>
                    </div>
                </div>

                <UserProfile user={user} onLogout={handleLogout} />
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="alert alert-warning d-flex align-items-center" role="alert">
                    <FaExclamationTriangle className="me-2" />
                    <div>{error}</div>
                    <button 
                        type="button" 
                        className="btn-close ms-auto" 
                        onClick={() => setError(null)}
                        aria-label="Fermer"
                    ></button>
                </div>
            )}

            {/* Indicateur de chargement pendant le rafraîchissement */}
            {loading && lastUpdate && (
                <div className="alert alert-info d-flex align-items-center">
                    <div className="spinner-grow text-primary me-2" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    Mise à jour des données en cours...
                </div>
            )}

            {/* Statistiques */}
            <div className="stat-container mt-3">
                <div className="row g-3 mb-0">
                    {statCards.map((item, index) => (
                        <StatCard key={index} item={item} index={index} />
                    ))}
                </div>

                {/* Graphiques */}
                <div className="row mt-1">
                    <div className="col-lg-6">
                        <div className="card shadow-sm border-2">
                            <div className="card-body">
                                <h5 className="card-title d-flex align-items-center text-gray mb-2">
                                    <FaRegChartBar size={20} className="me-2 text-primary" />
                                    Statistiques Globales
                                </h5>
                                <div style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="name" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip content={<CustomBarTooltip />} />
                                            <Bar 
                                                dataKey="value" 
                                                fill="#007bff" 
                                                radius={[4, 4, 0, 0]}
                                                name="Nombre"
                                                barSize={35}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card shadow-sm border-2">
                            <div className="card-body">
                                <h5 className="card-title d-flex align-items-center text-gray mb-0">
                                    <MdPieChart size={20} className="me-2 text-info" />
                                    Répartition des Rôles
                                </h5>
                                <div style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dataGraph}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ percent }) => 
                                                    `${(percent * 100).toFixed(0)}%`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {dataGraph.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomPieTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;