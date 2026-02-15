import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import './Superviseur.css';

const VisiteSuperviseur = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Charger clients qui nécessitent une visite
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/superviseur/clients-a-visiter");
      setClients(res.data.clients || []);
    } catch (err) {
      console.error("Erreur chargement clients superviseur", err);
      Swal.fire("Erreur", "Impossible de charger la liste des clients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Enregistrer la visite
  const handleValiderVisite = async () => {
    if (!selectedClientId) {
      Swal.fire("Erreur", "Veuillez sélectionner un client", "error");
      return;
    }

    if (!commentaire.trim()) {
      Swal.fire({
        toast: true,
        icon: "warning",
        title: "Attention!",
        text: "Veuillez saisir un commentaire",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }

    setValidationLoading(true);
    try {
      await api.post("/superviseur/valider-visite", {
        client_id: selectedClientId,
        superviseur_id: user.id,
        superviseur_nom: user.name,
        commentaire: commentaire.trim(),
        date_visite: new Date().toISOString().split("T")[0],
      });

      await Swal.fire({
        toast: true,
        icon: "success",
        title: "Visite validée !",
        text: "La visite a été enregistrée avec succès",
        timer: 2000,
        showConfirmButton: true,
      });

      setSelectedClientId("");
      setCommentaire("");
      await fetchClients();

    } catch (err) {
      console.error("Erreur validation visite", err);
      const errorMessage = err.response?.data?.message || "Impossible de valider la visite";
      Swal.fire({
        toast: true,
        icon: "error",
        title: "Erreur",
        text: errorMessage,
        timer: 2000,
        showConfirmButton: true,
      });
    } finally {
      setValidationLoading(false);
    }
  };

  return (
    <>
      <div className='header-superviseur'>
      <div className="container">
        {/* En-tête */}
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-header bg-primary text-white text-center">
            <h5 className="mb-1"> Validation des Visites - Superviseur</h5>
          </div>
        </div>

        {/* Formulaire de validation */}
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold"> Sélectionner un client</label>
                  <select
                    className="form-select"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Choisir un client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom_client}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold"> Commentaire</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Commentaire de visite..."
                    disabled={!selectedClientId}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={handleValiderVisite}
                disabled={!selectedClientId || !commentaire.trim() || validationLoading}
                style={{ width:'70%' }}
              >
                {validationLoading ? (
                  <>
                    <span className="spinner-grow text-primary me-2" />
                    Validation...
                  </>
                ) : (
                  " Valider la visite"
                )}
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => { setSelectedClientId(""); setCommentaire(""); }}
                disabled={!selectedClientId && !commentaire}
                style={{ width:'30%' }}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des clients - VERSION RESPONSIVE MAIS TOUJOURS TABLEAU */}
        <div className="card shadow-lg border-0">
          <div className="card-header text-white text-center">
            <h5 className="mb-0"> Liste des clients en attente de visite</h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center-sup py-4">
                <div className="alert alert-success mb-0">
                  <h6> Excellent travail !</h6>
                  <p className="mb-0">Tous les clients ont été visités.</p>
                </div>
              </div>
            ) : (
              <div className="table-responsive">

                <table className="table table-striped table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th className="d-none d-md-table-cell">Client</th>
                      <th>ID Client</th>
                      <th className="d-none d-md-table-cell">Contact</th>
                      <th>AC</th>
                      <th className="d-none d-md-table-cell">Contact AC</th>
                      <th className="d-none d-md-table-cell">Localisation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c, index) => (
                      <tr
                        key={c.id}
                        className={selectedClientId === c.id.toString() ? "table-primary" : ""}
                        onClick={() => setSelectedClientId(c.id.toString())}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{index + 1}</td>
                        <td className="d-none d-md-table-cell">{c.nom_client}</td>
                        <td>
                          <span className="">{c.id_client}</span>
                          <div className="d-md-none small">{c.nom_client}</div>
                        </td>
                        <td className="d-none d-md-table-cell">{c.contact_client}</td>
                        <td>
                          <span className="">{c.ac}</span>
                        </td>
                        <td className="d-none d-md-table-cell">{c.contact_ac}</td>
                        <td className="d-none d-md-table-cell">
                          <small>{c.adresse || "Non renseignée"}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
    </>
  );
};

export default VisiteSuperviseur;
