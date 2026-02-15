import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import defaultLogo from '../../../../assets/images/GMCOM.jpg';
import defaultAvatar from '../../../../assets/images/moi.jpg';

import { MdOutlineLightMode } from "react-icons/md";
import { FaUser } from "react-icons/fa";

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';

import MessageBadge from "../services/MessageBadge";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const open = Boolean(anchorEl);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (user?.name && !sessionStorage.getItem("welcomed")) {
      toast.success(`Bienvenue ${user.name} 👋`, { position: "top-right" });
      sessionStorage.setItem("welcomed", "true");
    }
  }, [user]);

  const handleOpenMyAccDrop = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMyAccDrop = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    alert("Vous êtes déconnecté avec succès !");
    navigate("/login");
  };

  return (
    <>
      <header className="main-header">
        <div className="container-header">
          {/* LOGO */}
          <Link className="logo d-flex align-items-center text-decoration-none" to="/">
            <img src={defaultLogo} alt="Logo" />
            <h4 className="ms-2 mb-0">
              GENIUS <span style={{ fontSize: '0.7rem', color:"#8B0000" }}>MADAGASCAR COMPANY</span>
            </h4>
          </Link>

          {/* BOUTON BURGER (mobile) */}
          <button
            className="burger-button d-md-none"
            onClick={() => {
              if (!showSidebar) setSidebarVisible(true);
              setShowSidebar(prev => !prev);
            }}
          >
            ☰
          </button>

          {/* NAVIGATION DESKTOP */}
          <nav className="nav-section d-none d-md-flex align-items-center gap-3">
            <MessageBadge />
            <Link to="/accueil" className="nav-link fw-bold">Accueil</Link>
            <Link to="/a-propos" className="nav-link fw-bold">A propos</Link>
            <Link to="/contact" className="nav-link fw-bold">Contact</Link>
            <MdOutlineLightMode size={24} style={{ cursor: 'pointer' }} onClick={() => setDarkMode(!darkMode)} />

            <div className="myAccWrapper">
              <div className="myAcc d-flex align-items-center" onClick={handleOpenMyAccDrop} style={{ cursor: 'pointer' }}>
                <img
                  src={user.photo ? `http://localhost:8000/storage/${user.photo}` : defaultAvatar}
                  alt="Avatar"
                  className="rounded-circle"
                  width="35"
                  height="35"
                />
              </div>

              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleCloseMyAccDrop}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem component={Link} to="/coordonnees" onClick={handleCloseMyAccDrop}>
                  <ListItemIcon><FaUser color="purple" /></ListItemIcon>
                  {user?.name ? <span>Connecté : <strong>{user.name}</strong></span> : <span>Non connecté</span>}
                </MenuItem>

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
      </header>

      {/* TOAST */}
      <ToastContainer />

      {/* SIDEBAR MOBILE */}
      {sidebarVisible && (
        <div
          className={`sidebar-mobile ${showSidebar ? "slide-in" : "slide-out"}`}
          onAnimationEnd={() => {
            if (!showSidebar) setSidebarVisible(false);
          }}
        >
          <Link to="/accueil" className="nav-link">Accueil</Link>
          <Link to="/a-propos" className="nav-link">À propos</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <div className="d-flex align-items-center mt-3 gap-2">
            <MdOutlineLightMode size={20} style={{ cursor: 'pointer' }} onClick={() => setDarkMode(!darkMode)} />
            <span>Mode</span>
          </div>

          {/* AVATAR + MENU UTILISATEUR DANS SIDEBAR MOBILE */}
          <div className="myAccWrapper mt-4">
            <div
              className="myAcc d-flex align-items-center"
              onClick={handleOpenMyAccDrop}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={user.photo ? `http://localhost:8000/storage/${user.photo}` : defaultAvatar}
                alt="Avatar"
                className="rounded-circle"
                width="40"
                height="40"
              />
              <span className="ms-2">{user?.name || "Invité"}</span>
            </div>

            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleCloseMyAccDrop}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem component={Link} to="/coordonnees" onClick={handleCloseMyAccDrop}>
                <ListItemIcon><FaUser color="purple" /></ListItemIcon>
                {user?.name ? <span>Connecté : <strong>{user.name}</strong></span> : <span>Non connecté</span>}
              </MenuItem>

              <MenuItem onClick={handleLogout}>
                <ListItemIcon style={{ color: 'red' }}>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
