import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../../../assets/images/profile_par_defaut.jpg";

const ModifierProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(
    user.photo ? `http://localhost:8000/storage/${user.photo}` : defaultAvatar
  );

  useEffect(() => {
    if (photo) {
      const objectUrl = URL.createObjectURL(photo);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tu peux connecter ici à ton API Laravel (via fetch ou axios)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (photo) {
      formData.append("photo", photo);
    }

    // TODO : appel API Laravel avec authentification
    console.log("Formulaire prêt à être envoyé :", formData);

    alert("Profil modifié (simulation). Implémente la connexion au back-end.");
    navigate("/profile");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h3 className="text-center mb-4 fw-bold">Modifier mon profil</h3>

              {/* Avatar */}
              <div className="text-center mb-4">
                <img
                  src={preview}
                  alt="Aperçu Avatar"
                  className="rounded-circle border border-3"
                  width="100"
                  height="100"
                />
              </div>

              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Adresse e-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Photo de profil</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                  />
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/profile")}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifierProfile;
