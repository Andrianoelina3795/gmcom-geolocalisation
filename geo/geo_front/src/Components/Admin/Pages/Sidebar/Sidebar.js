import Button from '@mui/material/Button';
import { 
  MdDashboard, MdLocationOn, MdMenuOpen, MdOutlineLogout, MdOutlineMenu
} from 'react-icons/md';
import { 
  FaMapMarkedAlt, FaHome, FaUser, FaUserCircle, FaRecycle, FaChartBar
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { MyContext } from '../../../Context/MyContext';
import './Sidebar.css';
import Swal from 'sweetalert2';
import ArLogo from '../ArLogo/ArLogo';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState('/');
  const [user, setUser] = useState(null);
  const { setIsLogin, setUser: setContextUser } = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  }, []);

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
      customClass: { popup: 'custom-swal-popup' }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('sidebarState');
        if (setIsLogin) setIsLogin(false);
        if (setContextUser) setContextUser(null);
        navigate('/login');
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Déconnexion réussie',
          text: 'À bientôt !',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    });
  };

  const menuItems = [
    { path: '/', icon: MdDashboard, label: 'Tableau de Bord', color: '#dc3545' },
    { path: '/accueil', icon: FaHome, label: 'Accueil', color: '#007bff' },
    { path: '/admin/list-produit', icon: FaRecycle, label: 'Produits', color: '#48d483' },
    { path: '/admin/client-list', icon: FaUserCircle, label: 'Clients', color: '#87CEEB' },
    { path: '/admin/list-paiements', icon: () => <ArLogo size={22} />, label: 'Paiements', color: '#28a745' },
    { path: '/admin/users', icon: FaUser, label: 'Utilisateurs', color: '#6610f2' },
    { path: '/admin/list-coordonnee', icon: FaMapMarkedAlt, label: 'Coordonnées', color: '#dc3545' },
    { path: '/admin/map', icon: MdLocationOn, label: 'Positions', color: '#fd7e14' },
    { path: '/admin/stats', icon: FaChartBar, label: 'Statistiques', color: '#6f42c1' },
  ];

  return (
    <>
      {/* Bouton hamburger */}
      <button
        className="sidebar-toggle"
        aria-label="Toggle menu"
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 2000,
          transition: 'transform 0.3s ease',
          background: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transform: isOpen ? 'translateX(160px)' : 'translateX(0)' // 230 - 70
        }}
      >
        {isOpen ? <MdMenuOpen size={20} /> : <MdOutlineMenu size={20} />}
      </button>

      {/* Overlay mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h4>GEO<span className="sp">COM</span></h4>
          </div>
        </div>

        <ul className="sidebar-list">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.path;

            return (
              <li key={item.path} className="sidebar-item">
                <Link 
                  to={item.path} 
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.path)}
                  title={!isOpen ? item.label : ''}
                >
                  <div className="sidebar-icon">
                    <IconComponent size={20} color={isActive ? '#fff' : item.color} />
                  </div>
                  {isOpen && <span className="sidebar-label">{item.label}</span>}
                  {isActive && isOpen && <div className="active-indicator" />}
                </Link>
              </li>
            );
          })}

          <li className="sidebar-spacer" />

          <li className="sidebar-logout">
            <Button 
              className="logout-btn"
              onClick={handleLogout}
              title={!isOpen ? 'Déconnexion' : ''}
              fullWidth
              sx={{
                justifyContent: isOpen ? 'flex-start' : 'center',
                padding: '12px 16px',
                color: '#dc3545',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(220, 53, 69, 0.1)' },
              }}
            >
              <MdOutlineLogout size={20} className="logout-icon" />
              {isOpen && <span className="logout-text">Déconnexion</span>}
            </Button>
          </li>
        </ul>

        {isOpen && (
          <div className="sidebar-footer">
            <div className="version-info">
              <small className="text-white">v1.0.0</small>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Sidebar;