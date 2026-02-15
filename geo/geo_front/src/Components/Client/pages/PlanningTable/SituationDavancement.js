import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import './SituationDavancement.css';

const SituationAvancement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periode, setPeriode] = useState("semaine");

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get("http://127.0.0.1:8000/api/situations", {
          headers: { Authorization: `Bearer ${token}` },
          params: { periode } // Envoyer la période au backend
        });

        console.log('API RESPONSE: ', res.data);
        setData(res.data);
      } catch (error) {
        console.error("Erreur :", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, periode]);

  // Calcul des totaux avec sécurité
  const total = {
    presentation: data.reduce((sum, row) => sum + (parseInt(row.presentation) || 0), 0),
    vente: data.reduce((sum, row) => sum + (parseInt(row.vente) || 0), 0),
    visite: data.reduce((sum, row) => sum + (parseInt(row.visite) || 0), 0),
    commande_travaux: data.reduce((sum, row) => sum + (parseInt(row.commande_travaux) || 0), 0),
    travaux_debut: data.reduce((sum, row) => sum + (parseInt(row.travaux_debut) || 0), 0),
    relance: data.reduce((sum, row) => sum + (parseInt(row.relance) || 0), 0),
  };

  if (loading) {
    return (
      <div className="container-sa mt-5" style={{ marginTop: '80px' }}>
        <div className="text-center py-5">
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement de la situation d'avancement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger text-center mt-3" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='header-sa'>
        <div className="container-sa">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="text-primary mb-0"> Situation d'avancement</h4>

            {/* Sélecteur de période */}
            <div className="btn-group">
              <button
                type="button"
                className={`btn btn-outline-primary ${periode === "semaine" ? "active" : ""}`}
                onClick={() => setPeriode("semaine")}
              >
                Semaine
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${periode === "mois" ? "active" : ""}`}
                onClick={() => setPeriode("mois")}
              >
                Mois
              </button>
            </div>
          </div>

          {data.length === 0 ? (
            <div className="alert alert-info text-center">
              Aucune donnée disponible pour cette période
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover text-center">
                <thead className="table-dark">
                  <tr>
                    <th> Agent</th>
                    <th> Présentation</th>
                    <th> Vente</th>
                    <th> Visite</th>
                    <th> Commande Travaux</th>
                    <th> Travaux</th>
                    <th> Relance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{row.pseudo}</td>
                      <td>{row.presentation || 0}</td>
                      <td className="text-success fw-bold">{row.vente || 0}</td>
                      <td className="text-info">{row.visite || 0}</td>
                      <td className="text-warning fw-bold">{row.commande_travaux || 0}</td>  {/* Commande travaux */}
                      <td className="text-primary">{row.travaux_debut || 0}</td>  {/* Début travaux */}
                      <td className="text-secondary">{row.relance || 0}</td>
                    </tr>
                  ))}
                  <tr className="table-success fw-bold">
                    <td> TOTAL</td>
                    <td>{total.presentation}</td>
                    <td>{total.vente}</td>
                    <td>{total.visite}</td>
                    <td>{total.commande_travaux}</td>
                    <td>{total.travaux_debut}</td>
                    <td>{total.relance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Légende */}
          <div className="mt-3">
            <small className="text-muted">
              <strong>Note :</strong>
              "Commande Travaux" = nombre de commandes passées cette période |
              "Travaux" = nombre de travaux démarrés cette période
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export default SituationAvancement;