import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function GeoMap() {
  // Références Leaflet (carte, marqueur, cercle de précision)
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // Message affiché à l'utilisateur
  const [message, setMessage] = useState('Recherche de votre position...');
  const [mapInitialized, setMapInitialized] = useState(false); // pour éviter plusieurs initialisations

  useEffect(() => {
    // Si le navigateur ne supporte pas la géolocalisation
    if (!navigator.geolocation) {
      setMessage("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    // Surveillance de la position GPS en temps réel
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Si précision > 50m, ignorer la position
        if (accuracy > 50) {
          setMessage(`Précision insuffisante (${Math.round(accuracy)} m), en attente d'une meilleure position...`);
          return;
        }

        // Précision suffisante, on affiche la carte
        setMessage(`Position détectée avec précision ${Math.round(accuracy)} mètres`);

        // Initialiser la carte (seulement une fois)
        if (!mapInitialized) {
          mapRef.current = L.map('map').setView([latitude, longitude], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapRef.current);

          // Marqueur de position
          markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current)
            .bindPopup(`Vous êtes ici<br>Précision : ${Math.round(accuracy)} m`).openPopup();

          // Cercle de précision
          circleRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: 'blue',
            fillColor: '#007bff',
            fillOpacity: 0.2
          }).addTo(mapRef.current);

          setMapInitialized(true);
        } else {
          // Mise à jour des éléments si la carte existe
          if (mapRef.current && markerRef.current && circleRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            markerRef.current.setPopupContent(`Vous êtes ici<br>Précision : ${Math.round(accuracy)} m`);
            circleRef.current.setLatLng([latitude, longitude]);
            circleRef.current.setRadius(accuracy);

            try {
              mapRef.current.panTo([latitude, longitude]);
            } catch (e) {
              console.warn("Erreur lors du panTo :", e);
            }
          }
        }
      },
      (error) => {
        // En cas d’erreur GPS
        setMessage('Erreur de géolocalisation.');
        console.error(error);

        // On initialise quand même une carte par défaut (ex: Antananarivo)
        if (!mapInitialized) {
          mapRef.current = L.map('map').setView([-18.8792, 47.5079], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapRef.current);
          setMapInitialized(true);
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 60000}
    );

    // Nettoyage : arrêt de la surveillance à la destruction du composant
    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [mapInitialized]);

  return (
    <div style={{ height: '80%', display: 'flex', flexDirection: 'column' }}>
      {/* Message dynamique au-dessus de la carte */}
      <div style={{
        padding: '10px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: message.includes('insuffisante') || message.includes('Erreur') ? 'red' : 'green'
      }}>
        {message}
      </div>

      {/* Carte Leaflet : prend toute la hauteur restante */}
      <div id="map" style={{
        flexGrow: 1,
        minHeight: '280px', // pour petits écrans
        width: '100%'
      }}>
      </div>
    </div>
  );
}
