import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdLightMode, MdDarkMode, MdLogout, MdHome } from 'react-icons/md';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './HeaderLeka.css'; 

// Images du logo et de l'avatar par défaut
import defaultLogo from '../../../../assets/images/GMCOM.jpg';
import defaultAvatar from '../../../../assets/images/profile_par_defaut.jpg';
import Swal from 'sweetalert2';


const HeaderLeka = () => {
  const navigate = useNavigate();

  // État du dark mode (stocké dans localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem('darkMode')) || false;
  });

  // Récupération de l'utilisateur depuis localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Applique la classe bg-dark/text-white selon le dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.classList.toggle("bg-dark", darkMode);
    document.body.classList.toggle("text-white", darkMode);
  }, [darkMode]);

  // Affiche un toast de bienvenue une seule fois par session
  useEffect(() => {
    if (user?.name && !sessionStorage.getItem("welcomed")) {
      toast.success(`Bienvenue ${user.name}`, { position: "top-right" });
      sessionStorage.setItem("welcomed", "true");
    }
  }, [user]);

  // Déconnexion utilisateur
  const handleLogout = () => {
    Swal.fire({
      toast: true,
      title: 'Déconnexion?',
      text: "Êtes-vous sûr de vouloir vous déconnecter ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
      timer: 15000,
      timerProgressBar: true,
        didOpen: () => {
        Swal.showLoading();
      },
    }).then((result) => {
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        Swal.fire({
          toast: true,
          icon: 'success',
          title: 'Déconnexion!',
          text: 'Vous avez été déconnecté.'
      });
    }
  });
}


  return (
    <>
      {/* Navbar principale */}
      <nav className={`navbar navbar-expand-lg shadow-sm
        ${darkMode ? 'navbar-dark navbar-custom-dark' : 'navbar-light navbar-custom-light'}`} style={{ position:'fixed' }}>
        
        <div className="container-fluid">
          {/* Logo + texte */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={defaultLogo} alt="Logo" width="60" height="60" className="rounded-circle me-2" />
            <h4 className="header-header ms-2">
             {/*GENIUS <span style={{ fontSize: '0.7rem', color:"#8B0000", marginBottom:'5px' }}> <br/> MADAGASCAR COMPANY</span> */} 
             GEO<span className='sp'>COM</span>
            </h4>
          </Link>

          {/* Bouton menu hamburger pour mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Liens de navigation */}
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/accueil">
                  <MdHome color='skyblue' size={28}/>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/a-propos">À propos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">Contact</Link>
              </li>
            </ul>

            {/* Boutons à droite : dark mode + profil */}
            <div className="d-flex align-items-center gap-3">
              {/* Bouton dark mode */}
              <button
                className="btn btn-outline-secondary"
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
              </button>

              {/* Menu déroulant profil utilisateur */}
              <div className="dropdown" style={{ backgroundColor: 'navajowhite ', borderRadius:'10px' }}>
                <button
                  className="btn dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={user.photo ? `http://localhost:8000/storage/${user.photo}` : defaultAvatar}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    width="38"
                    height="38"
                  />
                  <span className="d-none d-md-inline">Profil</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">Voir Profil</Link>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                      <MdLogout /> Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Affichage des toasts de bienvenue */}
      <ToastContainer />
    </>
  );
};

export default HeaderLeka;