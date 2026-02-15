import {
    FaMapMarkerAlt,
    FaHistory,
    FaMap,
    FaSms,
    FaChartBar,
    FaUserCircle,
    FaCalendarAlt,
    FaChartLine,
    FaUser,
    FaMoneyBill,
    FaSync
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Accueil.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import ArLogo from '../../../Admin/Pages/ArLogo/ArLogo';

const Accueil = () => {
    // Récupération de l'utilisateur connecté
    const [user, setUser] = useState({});
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // États pour stocker les statistiques personnelles
    const [stats, setStats] = useState({
        positions: 0,
        messages: 0,
        zone: 'Chargement...',
        clients: 0,
        paiements: 0
    });

    // Récupération des données utilisateur au chargement
    useEffect(() => {
        const userData = localStorage.getItem('user');
        const userToken = localStorage.getItem('token');

        if (userData && userData !== 'undefined') {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Erreur parsing user data:', error);
            }
        }

        if (userToken) {
            setToken(userToken);
        }
    }, []);

    // Chargement des statistiques depuis l'API
    const fetchStats = async (showLoading = true) => {
        if (showLoading) setLoading(true);

        try {
            const response = await axios.get('http://localhost:8000/api/statis', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }
            });

            const data = response.data;
            setStats({
                positions: data.positions || 0,
                messages: data.unreadMessages || 0,
                zone: data.lastZone || 'Aucune zone',
                clients: data.clients || 0,
                paiements: data.paiements || 0
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des stats :', error);
            Swal.fire({
                toast: true,
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de charger les statistiques',
                timer: 1000,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token]);

    // Rafraîchir les statistiques
    const handleRefreshStats = () => {
        setRefreshing(true);
        fetchStats(false);
    };

    // Configuration des cartes fonctionnelles
    const featureCards = [
        // Cartes visibles pour TOUS les utilisateurs
        {
            id: 1,
            title: "Envoyer ma position",
            description: "Soumettre votre position GPS actuelle",
            icon: FaMapMarkerAlt,
            iconColor: "#dc3045",
            path: "/coordonnees",
            roles: ["all"]
        },
        {
            id: 2,
            title: "Voir ma zone",
            description: "Consultez le Fokontany détecté automatiquement",
            icon: FaMap,
            iconColor: "#28a745",
            path: "/zone",
            roles: ["all"]
        },
        {
            id: 3,
            title: "Historique",
            description: "Voir vos positions GPS précédemment envoyées",
            icon: FaHistory,
            iconColor: "#007bff",
            path: "/historique",
            roles: ["all"]
        },
        {
            id: 4,
            title: "Information client",
            description: "Consultez l'information du client",
            icon: FaUserCircle,
            iconColor: "#87CEEB",
            path: "/clients",
            roles: ["AC", "admin"]
        },
        {
            id: 5,
            title: "Carte de Paiement",
            description: "Consultez la carte des paiements",
            icon: () => <ArLogo size={27} />,
            iconColor: "#FFA726",
            path: "/carte-paiement",
            roles: ["AC", "admin"]
        },
        {
            id: 6,
            title: "Gestion Messagerie",
            description: "Bienvenue dans le message privé",
            icon: FaSms,
            iconColor: "green",
            path: "/chat/:receiverId",
            roles: ["all"],
            requiresAuth: true
        },
        {
            id: 7,
            title: "Planning Objectifs",
            description: "Définir votre objectif de la semaine prochaine",
            icon: FaCalendarAlt,
            iconColor: "#6f42c1",
            path: "/planning-list",
            roles: ["AC", "admin"]
        },
        {
            id: 8,
            title: "Situation d'avancement",
            description: "Consultez la situation d'avancement",
            icon: FaChartLine,
            iconColor: "blue",
            path: "/situation_avancement",
            roles: ["all"]
        },
        {
            id: 9,
            title: "Superviseur",
            description: "Superviseur/Visite",
            icon: FaUser,
            iconColor: "#fd7e14",
            path: "/superviseur",
            roles: ["superviseur", "admin"]
        },
    ];

    // Filtrer les cartes selon le rôle de l'utilisateur
    const filteredCards = featureCards.filter(card => {
        if (card.roles.includes("all")) return true;
        if (!user?.role) return false;
        return card.roles.includes(user.role);
    });

    // Animation variants pour framer-motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <>
            <div className='header-accueil'>
                <div className="accueil-container">
                    {/* En-tête avec bienvenue */}
                    <motion.div
                        className="welcome-section"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="welcome-title">
                            Bienvenue{user?.name ? `, ${user.name}` : ''}
                        </h1>
                        <p className="welcome-subtitle">
                            Ce portail vous permet d'accéder à vos positions, votre historique,
                            informations clients et bien plus encore.
                        </p>
                    </motion.div>

                    {/* Section des fonctionnalités */}
                    <motion.div
                        className="features-section"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.p
                            className="features-subtitle"
                            variants={itemVariants}
                        >
                            Choisissez une action pour commencer
                        </motion.p>

                        <motion.div
                            className="features-grid"
                            variants={containerVariants}
                        >
                            {filteredCards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    className="feature-card"
                                    variants={itemVariants}
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        to={card.path}
                                        className="feature-link"
                                        onClick={(e) => {
                                            if (card.requiresAuth && !user.id) {
                                                e.preventDefault();
                                                Swal.fire({
                                                    toast: true,
                                                    icon: 'warning',
                                                    title: 'Connexion requise',
                                                    text: 'Veuillez vous connecter pour accéder à cette fonctionnalité'
                                                });
                                            }
                                        }}
                                    >
                                        <div className="feature-icon-wrapper">
                                            <card.icon
                                                size={28}
                                                className="feature-icon"
                                                style={{ color: card.iconColor }}
                                            />
                                        </div>
                                        <h3 className="feature-title">{card.title}</h3>
                                        <p className="feature-description">{card.description}</p>
                                        <div className="feature-badge">
                                            {card.roles.includes("all") ? "Tous" : card.roles.join(", ")}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Section des statistiques EN BAS */}
                    <motion.div
                        className="stats-section"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        <div className="stats-header">
                            <h2>
                                <FaChartBar className="stats-icon" />
                                Mes Statistiques
                            </h2>
                            <button
                                className="refresh-btn"
                                onClick={handleRefreshStats}
                                disabled={refreshing}
                                title="Rafraîchir les statistiques"
                            >
                                <FaSync className={refreshing ? 'spinning' : ''} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="stats-loading">
                                <div className="spinner"></div>
                                <span>Chargement des statistiques...</span>
                            </div>
                        ) : (
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-value">{stats.positions}</div>
                                    <div className="stat-label">Positions envoyées</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.messages}</div>
                                    <div className="stat-label">Messages non lus</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.clients}</div>
                                    <div className="stat-label">Clients</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.paiements}</div>
                                    <div className="stat-label">Paiements</div>
                                </div>
                                <div className="stat-item wide">
                                    <div className="stat-label">Dernière zone</div>
                                    <div className="stat-zone">{stats.zone}</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Accueil;