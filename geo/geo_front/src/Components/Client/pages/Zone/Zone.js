import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import './Zone.css';

// Correction des icônes Leaflet (important sinon pas d'icône)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Zone = () => {
  const [coords, setCoords] = useState(null);        // Coordonnées GPS
  const [address, setAddress] = useState('Chargement...'); // Adresse estimée via Nominatim
  const [error, setError] = useState('');            // Message d’erreur s’il y a un souci GPS

  useEffect(() => {
    // Obtenir la position actuelle
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        // Requête vers Nominatim pour reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then(res => res.json())
          .then(data => {
            // On récupère le fokontany, village ou nom complet
            const fokontany = data?.address?.suburb || data?.address?.village || data?.display_name;
            setAddress(fokontany || 'Adresse non trouvée');
          })
          .catch(() => {
            setAddress("Erreur lors de la récupération de l'adresse");
          });
      },
      (err) => {
        setError('Erreur GPS : ' + err.message); // En cas de refus ou échec
      }
    );
  }, []);

  return (
   <>
      <div className='header-zone mt-5'>
        <div className="zone-page">
          <div className="zone-form-box text-center mb-3">
            <FaMapMarkerAlt size={50} color="red" /><br/>
            {/* Titre */}
            <h3 className='zone-title text-center mt-3'>Fokontany détecté</h3>
            <p className="zone-description text-center">
              Vous pouvez voir içi vos positions réelle.
            </p>

            {/* Affichage erreur GPS */}
            {error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : (
              <>
                {/* Affichage de l'adresse estimée */}
                <div style={{
                  backgroundColor: '#e8f5e9',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  border: '1px solid #a5d6a7',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  Zone : {address}
                </div>

                {/* Si les coordonnées sont disponibles, afficher la carte */}
                {coords && (
                  <div
                    style={{
                      border: '3px solid #28a745',      // Bordure verte
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <MapContainer
                      center={[coords.latitude, coords.longitude]}
                      zoom={16}
                      style={{ height: '350px', width: '100%' }}
                    >
                      {/* Fond de carte OpenStreetMap */}
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* Marqueur pour la position */}
                      <Marker position={[coords.latitude, coords.longitude]}>
                        <Popup>{address}</Popup>
                      </Marker>

                      {/* Cercle de zone autour du point */}
                      <Circle
                        center={[coords.latitude, coords.longitude]}
                        radius={150}
                        pathOptions={{
                          color: 'green',
                          fillColor: 'lightgreen',
                          fillOpacity: 0.3
                        }}
                      >
                        <Tooltip permanent direction="top" offset={[0, -10]}>
                          Adresse estimée : {address}
                        </Tooltip>
                      </Circle>
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

export default Zone;
