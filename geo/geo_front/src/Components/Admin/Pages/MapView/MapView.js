import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './MapView.css';
import { FiRefreshCw } from 'react-icons/fi';
import { FaFileCsv, FaFileExcel, FaPrint } from 'react-icons/fa';
import * as turf from '@turf/turf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const token = localStorage.getItem('token') || '';

// Limites et centre de la carte (Madagascar)
const madagascarBounds = [[-26.5, 41], [-11.5, 51]];
const madagascarCenter = [
  (madagascarBounds[0][0] + madagascarBounds[1][0]) / 2,
  (madagascarBounds[0][1] + madagascarBounds[1][1]) / 2,
];

// Validation des coordonnées
const isValidLatLng = (lng, lat) =>
  !isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;

// Couleurs personnalisées par ID
const getColorFromId = (userId) => {
  const colors = ['#ff4444', '#4444ff', '#44aa44', '#ffaa44', '#aa44ff', '#aa8844', '#44aaaa', '#ff44aa'];
  return colors[userId % colors.length];
};

// Génération d'un icône SVG coloré
const generateColorIcon = (color = 'red') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="${color}">
      <path d="M168 0C75.3 0 0 75.3 0 168c0 87.5 144.1 307.5 152.4 320.3 5.1 7.5 16.1 7.5 21.2 0C239.9 475.5 384 255.5 384 168 384 75.3 308.7 0 216 0zm0 256c-48.6 0-88-39.4-88-88s39.4-88 88-88 88 39.4 88 88-39.4 88-88 88z"/>
    </svg>
  `;
  const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  return new L.Icon({
    iconUrl: url,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'custom-fa-marker'
  });
};

// Renvoie un icône personnalisé pour un user_id
const getColorIcon = (userId) => {
  const color = getColorFromId(userId);
  return generateColorIcon(color);
};

// Hook personnalisé pour les positions (SANS actualisation automatique)
const usePositions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/coordonnees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data;

      if (Array.isArray(data)) {
        const latestByUser = {};
        data.forEach((p) => {
          if (!isValidLatLng(p.longitude, p.latitude)) return;
          const key = p.user_id;
          if (!latestByUser[key] || new Date(p.created_at) > new Date(latestByUser[key].created_at)) {
            latestByUser[key] = p;
          }
        });
        setPositions(Object.values(latestByUser));
      } else {
        setPositions([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des positions', err);
      setError('Erreur lors du chargement des données');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // SUPPRIMER l'intervalle d'actualisation automatique
  useEffect(() => {
    fetchPositions();
    // Retirer complètement l'intervalle pour éviter les problèmes de zoom
  }, [fetchPositions]);

  return { positions, loading, error, refetch: fetchPositions };
};

const MapView = () => {
  const { positions, loading, error, refetch: fetchPositions } = usePositions();
  const [geoData, setGeoData] = useState(null);
  const [filtreUserId, setFiltreUserId] = useState('');
  const mapRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chargement du fichier GeoJSON
  useEffect(() => {
    fetch('/geojson/limites.json')
      .then((res) => {
        if (!res.ok) throw new Error('Erreur de chargement GeoJSON');
        return res.json();
      })
      .then((data) => {
        if (data?.type === 'FeatureCollection') {
          setGeoData(data);
        }
      })
      .catch((err) => {
        console.error('Erreur GeoJSON :', err);
      });
  }, []);

  // Crée un buffer autour de la province Antananarivo
  const antananarivoZone = useMemo(() => {
    if (!geoData) return null;
    return turf.featureCollection(
      geoData.features
        .filter((f) => f.properties.LIB_PROV === 'Antananarivo')
        .map((feature) => turf.buffer(feature, 0.02, { units: 'kilometers' }))
    );
  }, [geoData]);

  // Vérifie si une position est dans la zone
  const isInsideAntananarivo = useCallback((lng, lat) => {
    if (!antananarivoZone) return false;
    const point = turf.point([lng, lat]);
    return antananarivoZone.features.some((bufferedFeature) =>
      turf.booleanPointInPolygon(point, bufferedFeature)
    );
  }, [antananarivoZone]);

  // Liste unique des utilisateurs
  const uniqueUsers = useMemo(() => 
    [...new Map(positions.map((p) => [p.user_id, p])).values()],
    [positions]
  );

  // Positions filtrées
  const filteredPositions = useMemo(() => 
    positions.filter((p) => {
      if (!filtreUserId) return true;
      const filterId = parseInt(filtreUserId);
      const userId = parseInt(p.user_id);
      return !isNaN(filterId) && !isNaN(userId) && userId === filterId;
    }),
    [positions, filtreUserId]
  );

  // Gestion manuelle du rafraîchissement
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchPositions();
    setIsRefreshing(false);
  };

  // Export CSV
  const exportCSV = () => {
    if (positions.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const rows = positions.map((pos) => ({
      Nom: pos.user_name,
      Longitude: pos.longitude,
      Latitude: pos.latitude,
      Date: pos.created_at,
      Quartier: pos.quartier
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');
    const blob = new Blob([XLSX.write(workbook, { bookType: 'csv', type: 'array' })]);
    saveAs(blob, 'agents.csv');
  };

  // Export Excel
  const exportExcel = () => {
    if (positions.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const rows = positions.map((pos) => ({
      Nom: pos.user_name,
      Longitude: pos.longitude,
      Latitude: pos.latitude,
      Date: pos.created_at,
      Quartier: pos.quartier
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');
    const blob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })]);
    saveAs(blob, 'agents.xlsx');
  };

  // Imprimer la carte
  const printMap = () => {
    window.print();
  };

  // Nettoyage des URLs des icônes
  useEffect(() => {
    return () => {
      document.querySelectorAll('.custom-fa-marker').forEach(icon => {
        if (icon.options?.iconUrl) {
          URL.revokeObjectURL(icon.options.iconUrl);
        }
      });
    };
  }, []);

  return (
    <div className='carte-container'>
      <div className="map" style={{ maxWidth: 1250 }}>
        <h2 className="map-title">Carte de localisation des commerciaux</h2>
        <hr/>

        {loading ? (
          <div className="loading-container">
            <div className="spinner-grow text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p>Chargement des positions...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="alert alert-danger" role="alert">
              {error}
              <button 
                onClick={handleManualRefresh} 
                className="btn btn-sm btn-outline-danger ms-2"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Chargement...' : 'Réessayer'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filtres et export */}
            <div className="filter-section mt-3">
              <label className="filter-label">Filtrer par agent :</label>
              <select 
                className='form-select filter-select' 
                value={filtreUserId} 
                onChange={(e) => setFiltreUserId(e.target.value)}
              >
                <option value="">Tous les commerciaux</option>
                {uniqueUsers.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.user_name || `Agent #${user.user_id}`}
                  </option>
                ))}
              </select>

              <button 
                onClick={handleManualRefresh} 
                className="refresh-btn"
                aria-label="Actualiser les positions"
                disabled={isRefreshing}
              >
                <FiRefreshCw className={isRefreshing ? 'spinning' : ''} /> 
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              <button onClick={exportCSV} className="btn-export" disabled={positions.length === 0}>
                <FaFileCsv className="export-icon" /> CSV
              </button>
              <button onClick={exportExcel} className="btn-export" disabled={positions.length === 0}>
                <FaFileExcel className="export-icon" /> Excel
              </button>
              <button onClick={printMap} className="btn-export">
                <FaPrint className="export-icon" /> Imprimer
              </button>
            </div>

            {/* Légende */}
            {uniqueUsers.length > 0 && (
              <div className="legend-container">
                <h6 className="legend-title">Légende des agents :</h6>
                <div className="legend-items">
                  {uniqueUsers.map((u) => (
                    <div key={u.user_id} className="legend-item">
                      <div
                        className="color-dot"
                        style={{ backgroundColor: getColorFromId(u.user_id) }}
                      ></div>
                      <span className="legend-text">{u.user_name || `Agent #${u.user_id}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Carte Leaflet */}
            <MapContainer
              ref={mapRef}
              center={madagascarCenter}
              zoom={5}
              minZoom={5}
              maxZoom={16}
              maxBounds={madagascarBounds}
              className="leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Polygones GeoJSON (Antananarivo) */}
              {geoData && (
                <GeoJSON
                  data={geoData.features.filter((f) => f.properties.LIB_PROV === 'Antananarivo')}
                  onEachFeature={(feature, layer) => {
                    const { LIB_FKT, LIB_COM, LIB_DIST, LIB_REG, LIB_PROV } = feature.properties;
                    layer.bindPopup(`
                      <div class="popup-content">
                        <strong>Fokontany:</strong> ${LIB_FKT}<br/>
                        <strong>Commune:</strong> ${LIB_COM}<br/>
                        <strong>District:</strong> ${LIB_DIST}<br/>
                        <strong>Région:</strong> ${LIB_REG}<br/>
                        <strong>Province:</strong> ${LIB_PROV}
                      </div>
                    `);
                  }}
                  style={{ color: '#28a745', weight: 1, fillOpacity: 0.2 }}
                />
              )}

              {/* Marqueurs avec cluster */}
              <MarkerClusterGroup 
                chunkedLoading
                maxClusterRadius={50}
              >
                {filteredPositions.map((pos, index) => {
                  const inside = isInsideAntananarivo(pos.longitude, pos.latitude);
                  return (
                    <Marker
                      key={`${pos.user_id}-${index}`}
                      position={[pos.latitude, pos.longitude]}
                      icon={getColorIcon(pos.user_id)}
                    >
                      <Popup className="custom-popup">
                        <div className="popup-content">
                          <strong>{pos.user_name}</strong>
                          <br />
                          <strong>Date :</strong> {new Date(pos.created_at).toLocaleString()}
                          <br />
                          <strong>Latitude :</strong> {pos.latitude}
                          <br />
                          <strong>Longitude :</strong> {pos.longitude}
                          <br />
                          <strong>Quartier :</strong> {pos.quartier || 'Non spécifié'}
                          <br />
                          <strong>Statut :</strong> 
                          <span className={inside ? 'status-inside' : 'status-outside'}>
                            {inside ? ' Dans Antananarivo' : ' Hors zone'}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            </MapContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default MapView;