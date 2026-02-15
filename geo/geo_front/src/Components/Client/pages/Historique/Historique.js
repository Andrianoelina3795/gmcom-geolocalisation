import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Historique.css';

// Correction des icônes Leaflet (sinon icône cassée)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Historique = () => {
  // Stocke les positions GPS reçues
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true); // Indique si chargement ou pas

// Chargement des données lors du montage
useEffect(() => {

    const token = localStorage.getItem('token'); // récupération du token

    axios.get('http://localhost:8000/api/coordonnees', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : response.data.data;
        setPositions(data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des positions :", error);
        setLoading(false);
      });
}, []);


  // Si on a au moins une position, on centre dessus ; sinon par défaut Antananarivo
  const defaultCenter = positions.length > 0
    ? [positions[0].latitude, positions[0].longitude]
    : [-18.8792, 47.5079];

  return (
    <>
      <div className='header-historique mt-5'>
        <div className="historique-page">
          <div className="historique-form-box text-center mb-3">
            {/* Titre */}
            <h3 className='historique-title text-center mt-3 text-bg-info' style={{ marginBottom: '10px' }}>Historique de vos positions GPS</h3>
            <p className="historique-description text-center">
              Vous pouvez voir içi toute vos historique de positions réelle déjà enregistrée.
            </p>

            {/* Indicateur de chargement */}
            {loading ? (
              <div className="text-center">
                <div className="spinner-grow text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Si aucune position trouvée */}
                {positions.length === 0 ? (
                  <p className="text-center">Aucune donnée trouvée.</p>
                ) : (
                  <div
                    className="map-wrapper mt-5"
                    style={{
                      border: '3px solid #007bff', // bordure bleue
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    {/* Carte Leaflet encadrée */}
                    <MapContainer
                      center={defaultCenter}
                      zoom={13}
                      style={{ height: '500px', width: '100%' }}
                    >
                      {/* Fond de carte OpenStreetMap */}
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />

                      {/* Marqueurs pour chaque position GPS */}
                      {positions.map((pos) => (
                        <Marker key={pos.id} position={[pos.latitude, pos.longitude]}>
                          <Popup>
                            <strong>- Position enregistrée le :</strong><br />
                            {new Date(pos.created_at).toLocaleString()} <br />
                            <strong>- Latitude :</strong> {pos.latitude} <br />
                            <strong>- Longitude :</strong> {pos.longitude} <br />
                            <strong>- Quartier :</strong> {pos.fokontany || 'Non défini'}
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </>
      );
};

      export default Historique;
