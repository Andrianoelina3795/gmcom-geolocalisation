import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./GeoTest.css"; // Fichier CSS dédié

// Composant pour recentrer automatiquement la carte quand la position change
const GeolocUpdater = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position); // Recentrer la carte
  }, [position, map]);

  return null;
};

// Composant principal
const GeoTest = () => {
  // États
  const [position, setPosition] = useState(null);               // Position actuelle GPS
  const [accuracy, setAccuracy] = useState(null);               // Précision GPS
  const [path, setPath] = useState([]);                         // Historique de positions
  const [badAccuracyCount, setBadAccuracyCount] = useState(0);  // Compteur de mauvaises précisions
  const [message, setMessage] = useState("");                   // Message d'état pour l'utilisateur
  const [loading, setLoading] = useState(true);                 // Chargement initial de la position

  // useRef pour son d'alerte si besoin
  // const audioRef = useRef(null);

  useEffect(() => {
    let intervalId;

    // Vérifier si le navigateur supporte la géolocalisation
    if ("geolocation" in navigator) {
      const updatePosition = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;

            // Vérifie la précision : si trop faible (> 200m)
            if (accuracy > 200) {
              setBadAccuracyCount((prev) => {
                const newCount = prev + 1;

                if (newCount >= 3) {
                  setMessage(
                    `⚠️ Alerte : précision GPS trop faible depuis ${newCount} mesures (${Math.round(accuracy)} m)`
                  );

                  // Lecture sonore si souhaitée
                  // if (audioRef.current) {
                  //   audioRef.current.play().catch((err) => {
                  //     console.warn("Lecture audio bloquée :", err);
                  //   });
                  // }
                } else {
                  setMessage(`Précision faible : ${Math.round(accuracy)} m`);
                }

                return newCount;
              });
              return;
            }

            // Bonne précision : réinitialisation du compteur
            setBadAccuracyCount(0);
            setMessage(`Bonne précision : ${Math.round(accuracy)} m`);

            const newPosition = [latitude, longitude];
            setPosition(newPosition);
            setAccuracy(accuracy);
            setPath((prevPath) => [...prevPath, newPosition]);

            setLoading(false); // Fin du chargement une fois la première position détectée
          },
          (err) => {
            console.error("Erreur de géolocalisation :", err);
            setMessage("Erreur de géolocalisation");
          },
          {
            enableHighAccuracy: true,
            timeout: 60000,
            maximumAge: 0,
          }
        );
      };

      // Démarrage immédiat + mise à jour toutes les 6 secondes
      updatePosition();
      intervalId = setInterval(updatePosition, 6000);

      return () => clearInterval(intervalId); // Nettoyage
    } else {
      alert("Géolocalisation non supportée par ce navigateur.");
    }
  }, []);

  return (
    <div className="geotest-page mt-5">
      <div className="geotest-container">
        {/* Message d'état (vert, orange, rouge) */}
        {message && !loading && (
          <div
            className={`status-message ${message.includes("⚠️")
                ? "status-danger"
                : message.includes("Bonne")
                  ? "status-good"
                  : "status-warning"
              }`}
          >
            {message}
          </div>
        )}

        {/* Carte ou squelette */}
        <div className="map-wrapper">
          {loading ? (
            // Skeleton UI pendant le chargement
            <div className="skeleton-container">
              <div className="skeleton-map"></div>
              <div className="skeleton-text short"></div>
              <div className="skeleton-text"></div>
            </div>
          ) : position ? (
            // Carte réelle après chargement
            <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Marqueur de position */}
              <Marker position={position}>
                <Popup>
                  Vous êtes ici<br />
                  Précision : {Math.round(accuracy)} m
                </Popup>
              </Marker>

              {/* Cercle de précision */}
              <Circle
                center={position}
                radius={accuracy}
                pathOptions={{ color: "blue", fillOpacity: 0.2 }}
              />

              {/* Historique de déplacement */}
              <Polyline positions={path} pathOptions={{ color: "red" }} />

              {/* Recentrage automatique */}
              <GeolocUpdater position={position} />
            </MapContainer>
          ) : (
            <p className="loading-message">Aucune position détectée.</p>
          )}
        </div>

        {/* Son d’alerte optionnel */}
        {/* <audio ref={audioRef} src="/alert.mp3" preload="auto" /> */}
      </div>
    </div>
  );
};

export default GeoTest;
