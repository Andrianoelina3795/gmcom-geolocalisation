
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as turf from '@turf/turf';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


const FokontanyDetectionMap = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState(''); const [fokontany, setFokontany] = useState('');
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true); // Chargement des données ou non

  useEffect(() => {
    const fetchGeojson = async () => {
      try {
        const geo = await axios.get('/geojson/limites.json');
        setGeojsonData(geo.data);
      } catch (error) {
        console.error('Erreur chargement GeoJSON:',
          error);
      }
    };
    fetchGeojson();
  }, []);

  useEffect(() => {
    if (!geojsonData || !latitude || !longitude || isNaN(latitude) || isNaN(longitude))
      return;

    // Création du point à partir des coordonnées GPS saisies
    const point = turf.point([parseFloat(longitude), parseFloat(latitude)]);

    // Buffer de 20m pour compenser imprécision GPS
    const bufferedPoint = turf.buffer(point, 0.02, { units: 'kilometers' });

    // Vérification si le point est dans un polygone
    const match = geojsonData.features.find((feature) => {
      return turf.booleanIntersects(bufferedPoint, feature);
    });

    if (match) {
      setFokontany(match.properties.LIB_FKT ?? 'Fokontany inconnu');
    } else {
      setFokontany('Hors zone connue');
    }

  }, [latitude, longitude, geojsonData]);

  return (
    <div>
      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-lg font-semibold mb-2">
          Formulaire avec détection du Fokontany
        </h2>

        <label className="block mb-1">Latitude</label>
        <input
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="w-full border px-2 py-1 rounded mb-3"
          placeholder="Ex: -18.9104"
        />

        <label className="block mb-1">Longitude</label>
        <input
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="w-full border px-2 py-1 rounded mb-3"
          placeholder="Ex: 47.5168"
        />

        <div className="mb-3">
          <strong>Fokontany détecté :</strong> {fokontany || 'Aucune détection'}
        </div>

        {/* Carte pour visualiser le point GPS et sa position dans la zone */}
        {latitude && longitude && !isNaN(latitude) && !isNaN(longitude) && (
          <MapContainer
            center={[parseFloat(latitude), parseFloat(longitude)]}
            zoom={17}
            scrollWheelZoom={false}
            className="h-64 w-full rounded shadow"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[parseFloat(latitude), parseFloat(longitude)]}
              icon={L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
              })}
            >
              <Popup>
                Position actuelle<br />{latitude}, {longitude}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>

  );
};

export default FokontanyDetectionMap;


