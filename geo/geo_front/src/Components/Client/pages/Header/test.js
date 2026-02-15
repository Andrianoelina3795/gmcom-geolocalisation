// Importation des hooks React nécessaires
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// Import des images par défaut
import defaultLogo from '../../../../assets/images/GMCOM.jpg';
import defaultAvatar from '../../../../assets/images/moi.jpg';

// Import des icônes
import { MdOutlineLightMode } from "react-icons/md";
import { FaUser } from "react-icons/fa";

// Import du menu MUI pour le menu utilisateur
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';

// Import des composants internes
import SearchBox from "../SearchBox/SearchBox";
import MessageBadge from "../services/MessageBadge";

// Import de toast pour les notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Style CSS
import './Header.css';

// Début du composant Header
const Header = () => {
  const navigate = useNavigate(); // Permet de rediriger l'utilisateur

  // État pour le menu utilisateur
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl); // Savoir si le menu est ouvert

  // État pour sidebar mobile
  const [showSidebar, setShowSidebar] = useState(false);

  // État pour dark mode, stocké dans le localStorage
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  // Récupération de l'utilisateur depuis le localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Référence vers l'input de fichier caché
  const fileInputRef = useRef(null);

  // Active/désactive le mode sombre et l'enregistre
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Affiche une notification de bienvenue une seule fois par session
  useEffect(() => {
    if (user && user.name && !sessionStorage.getItem("welcomed")) {
      toast.success(`Bienvenue ${user.name} 👋`, { position: "top-right" });
      sessionStorage.setItem("welcomed", "true");
    }
  }, [user]);

  // Ouvre le menu utilisateur
  const handleOpenMyAccDrop = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Ferme le menu utilisateur
  const handleCloseMyAccDrop = () => {
    setAnchorEl(null);
  };

  // Déconnexion de l'utilisateur
  const handleLogout = () => {
    localStorage.clear(); // Supprime les données
    alert("Vous êtes déconnecté avec succès !");
    navigate("/login"); // Redirige vers page de login
  };

  // Clique sur l'image pour ouvrir le sélecteur de fichiers
  /*const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Gère l'envoi de la nouvelle photo
  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Récupère le fichier
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file); // Ajoute le fichier dans FormData

    try {
      const response = await fetch("http://localhost:8000/api/upload-photo", {
        method: "POST",
        body: formData,
        // headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erreur lors de l'upload");

      const data = await response.json();

      // Met à jour la photo dans le localStorage
      const updatedUser = { ...user, photo: data.photoPath };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Photo mise à jour avec succès !");
      window.location.reload(); // Recharge la page

    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la photo.");
      console.error(error);
    }
  };
  */

  // Rendu JSX du Header
  return (
    <>
      {/* Header principal */}
      <header className="d-flex w-full h-16 shadow z-10 items-center px-4">
        <div className="container-fluid">
          <div className="row d-flex align-items-center w-100">

            {/* Logo de l'application */}
            <div className="col-sm-2 d-flex align-items-center">
              <Link className="d-flex align-items-center logo" to="/">
                <img src={defaultLogo} alt="Logo" style={{ width: 60, height: 60, borderRadius: '50%' }} className="me-2" />
                <h4>
                  GENIUS <span style={{ fontSize: '0.7rem', color:"#8B0000" }}>MADAGASCAR COMPANY</span>
                </h4>
              </Link>
            </div>

            {/* Bouton menu pour mobile */}
            <div className="col-sm-1 d-flex align-items-center d-md-none">
              <button className="btn btn-outline-secondary" onClick={() => setShowSidebar(!showSidebar)}>
                ☰
              </button>
            </div>

            {/* Navigation principale */}
            <nav style={{ marginLeft: "105px" }} className="col-sm-9 d-flex align-items-center justify-content-end gap-3">
             {/* <SearchBox /> */}                 {/* Barre de recherche */}
              <MessageBadge />               {/* Badge message */}
              <Link to="/accueil" className="nav-link fw-bold">Accueil</Link>
              <Link to="/a-propos" className="nav-link fw-bold">A propos</Link>
              <Link to="/contact" className="nav-link fw-bold">Contact</Link>

              {/* Bouton dark mode */}
              <MdOutlineLightMode size={24} style={{ cursor: 'pointer' }} onClick={() => setDarkMode(!darkMode)} />

              {/* Profil utilisateur */}
              <div className="myAccWrapper">
                <div className="myAcc d-flex align-items-center" onClick={handleOpenMyAccDrop} style={{ cursor: 'pointer' }}>
                  <img
                    src={user.photo ? `http://localhost:8000/storage/${user.photo}` : defaultAvatar}
                    alt="Avatar"
                    style={{ width: 40, height: 40, borderRadius: '50%' }}
                  />
                </div>

                {/* Menu déroulant utilisateur */}
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleCloseMyAccDrop}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {/* Nom utilisateur ou non connecté */}
                  <MenuItem component={Link} to="/coordonnees" onClick={handleCloseMyAccDrop}>
                    <ListItemIcon><FaUser color="purple" /></ListItemIcon>
                    <div>
                      {user?.name ? (
                        <span>Connecté : <strong>{user.name}</strong></span>
                      ) : (
                        <span>Non connecté</span>
                      )}
                    </div>
                  </MenuItem>

                  {/* Changer photo */}
                  {/*<MenuItem onClick={() => { handleCloseMyAccDrop(); handleClickUpload(); }}>
                    <ListItemIcon><FaUser /></ListItemIcon>
                    <span>Mettre à jour la photo</span>
                  </MenuItem>
                  */}

                  {/* Déconnexion */}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon style={{ color: 'red' }}>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Déconnexion
                  </MenuItem>
                </Menu>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Input caché pour uploader une nouvelle image */}
     {/* <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      */}

      {/* Container pour les toasts */}
      <ToastContainer />

      {/* Sidebar responsive pour mobile */}
      {showSidebar && (
        <div className={`sidebar-mobile ${showSidebar ? "open" : ""}`}>
          <a href="/accueil" className="nav-link">Accueil</a>
          <a href="/a-propos" className="nav-link">À propos</a>
          <a href="/contact" className="nav-link">Contact</a>
        </div>

      )}
    </>
  );
};

// Export du composant Header
export default Header;
