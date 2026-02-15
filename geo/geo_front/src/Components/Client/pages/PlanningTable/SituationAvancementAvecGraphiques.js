import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, Legend, ComposedChart, Area
} from "recharts";
import { FaChartBar, FaChartPie, FaUsers, FaShoppingCart } from "react-icons/fa";
import { MdShowChart } from "react-icons/md";

const SituationAvancementAvecGraphiques = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periode, setPeriode] = useState("semaine");

  const token = localStorage.getItem("token") || "";

  // Couleurs pour les graphiques
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

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

  // Données pour le graphique de performance des agents
  const agentsPerformanceData = data.map(agent => ({
    name: agent.pseudo,
    presentations: agent.presentation || 0,
    ventes: agent.vente || 0,
    visites: agent.visite || 0,
    commandes: agent.commande_travaux || 0,
    travaux: agent.travaux_debut || 0,
    relances: agent.relance || 0
  }));

  // Données pour le graphique en camembert (répartition des activités)
  const activitiesDistribution = [
    { name: 'Présentations', value: total.presentation },
    { name: 'Ventes', value: total.vente },
    { name: 'Visites', value: total.visite },
    { name: 'Commandes', value: total.commande_travaux },
    { name: 'Travaux', value: total.travaux_debut },
    { name: 'Relances', value: total.relance }
  ].filter(item => item.value > 0);

  // Données pour le graphique des tops performeurs
  const topPerformers = [...data]
    .sort((a, b) => (b.vente || 0) - (a.vente || 0))
    .slice(0, 5)
    .map(agent => ({
      name: agent.pseudo,
      ventes: agent.vente || 0,
      visites: agent.visite || 0
    }));

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border rounded shadow">
          <p className="fw-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
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
        <div className="alert alert-danger text-center mt-4" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-primary mb-0">📊 Situation d'avancement</h3>
        
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
        <>
          {/* Section Graphiques */}
          <div className="row mb-4">
            {/* Graphique 1: Performance des agents */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <FaUsers className="me-2" />
                    Performance des Agents
                  </h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agentsPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="ventes" 
                        fill="#82ca9d" 
                        radius={[4, 4, 0, 0]}
                        name="Ventes"
                      />
                      <Bar 
                        dataKey="visites" 
                        fill="#ffc658" 
                        radius={[4, 4, 0, 0]}
                        name="Visites"
                      />
                      <Bar 
                        dataKey="presentations" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        name="Présentations"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Graphique 2: Répartition des activités */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <FaChartPie className="me-2" />
                    Répartition des Activités
                  </h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activitiesDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {activitiesDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Graphique 3: Top 5 des vendeurs */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <FaShoppingCart className="me-2" />
                    Top 5 des Vendeurs
                  </h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topPerformers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="ventes" 
                        fill="#28a745" 
                        radius={[4, 4, 0, 0]}
                        name="Ventes"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Graphique 4: Comparaison Ventes vs Visites */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <MdShowChart className="me-2" />
                    Ventes vs Visites
                  </h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={topPerformers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="ventes" 
                        fill="#82ca9d" 
                        radius={[4, 4, 0, 0]}
                        name="Ventes"
                      />
                      <Bar 
                        dataKey="visites" 
                        fill="#ffc658" 
                        radius={[4, 4, 0, 0]}
                        name="Visites"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SituationAvancementAvecGraphiques;