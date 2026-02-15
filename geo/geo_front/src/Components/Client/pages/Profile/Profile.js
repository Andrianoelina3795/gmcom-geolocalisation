import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import defaultAvatar from "../../../../assets/images/profile_par_defaut.jpg";

const Profil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setError("Aucun utilisateur connecté");
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (err) {
      console.error("Erreur lors du parsing des données utilisateur:", err);
      setError("Erreur de chargement du profil");
    } finally {
      setLoading(false);
    }
  }, []);

  // Gestion sécurisée de l'URL de la photo
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return defaultAvatar;
    
    // Vérifier si c'est déjà une URL complète
    if (photoPath.startsWith('http')) return photoPath;
    
    // Sinon construire l'URL relative
    return `http://localhost:8000/storage/${photoPath}`;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body text-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement du profil...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body text-center p-4">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
                <Link to="/connexion" className="btn btn-primary">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body text-center p-4">
                <p>Aucun utilisateur trouvé</p>
                <Link to="/connexion" className="btn btn-primary">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body text-center p-4">
              {/* Avatar avec gestion d'erreur de chargement */}
              <div className="mb-4">
                <img
                  src={getPhotoUrl(user.photo)}
                  alt={`Avatar de ${user.name || "Utilisateur"}`}
                  className="rounded-circle border border-3"
                  width="120"
                  height="120"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
              
              {/* Informations utilisateur */}
              <h3 className="fw-bold mb-1">{user.name || "Utilisateur"}</h3>
              <p 
                className="text-primary mb-3" 
                style={{ color: 'skyblue' }}
              >
                {user.email || "Email non défini"}
              </p>

              {/* Badge du rôle */}
              {user.role && (
                <span className="badge bg-dark-subtle text-dark mb-3 text-uppercase px-3 py-1">
                  {user.role}
                </span>
              )}

              <hr />

              {/* Actions */}
              <div className="d-grid gap-2 d-md-flex justify-content-center mt-4">
                <Link 
                  to="/modifier-profile" 
                  className="btn btn-outline-primary"
                >
                  ✏️ Modifier le profil
                </Link>
                <Link 
                  to="/accueil" 
                  className="btn btn-outline-secondary"
                >
                  ← Retour
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;
