import React, { useState, useEffect, useCallback } from 'react';
import { FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './CoordonneeForm.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as turf from '@turf/turf';


const CoordonneeForm = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [adresseEstimee, setAdresseEstimee] = useState('');
  const [message, setMessage] = useState('');
  const [zoneInfo, setZoneInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token') || '';

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
        headers: {
          'User-Agent': 'CoordonneeApp/1.0 (contact@email.com)',
        },
      });
      const data = await response.json();
      if (data && data.display_name) {
        setAdresseEstimee(data.display_name);
      } else {
        setAdresseEstimee('Adresse non trouvée');
      }
    } catch (error) {
      console.error('Erreur reverse geocoding :', error);
      setAdresseEstimee("Erreur lors de la récupération de l'adresse");
    }
  };

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage("Géolocalisation non supportée.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const acc = position.coords.accuracy;
        setLatitude(lat);
        setLongitude(lon);
        setAccuracy(acc);
        setMessage('');
        setLoading(false);
        reverseGeocode(lat, lon);
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setMessage("Permission refusée.");
            break;
          case error.POSITION_UNAVAILABLE:
            setMessage("Position indisponible.");
            break;
          case error.TIMEOUT:
            setMessage("Délai dépassé.");
            break;
          default:
            setMessage("Erreur de géolocalisation.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  const validateCoordinates = (lng, lat) => {
    return !isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
  };

  const detectZoneWithTurf = (lng, lat, geojson) => {
    const point = turf.point([parseFloat(lng), parseFloat(lat)]);
    for (const feature of geojson.features) {
      const buffered = turf.buffer(feature, 0.02, { units: 'kilometers' });
      if (turf.booleanPointInPolygon(point, buffered)) {
        return {
          status: 'inside',
          quartier: feature.properties.LIB_FKT || null,
          commune: feature.properties.LIB_COM || null,
          district: feature.properties.LIB_DIST || null,
          region: feature.properties.LIB_REG || null,
          province: feature.properties.LIB_PROV || null,
        };
      }
    }
    return {
      status: 'outside', quartier: null, commune: null, district: null, region: null, province: null
    };
  };

  /*const handleSubmit = async (e) => {
    e.preventDefault();

    if (accuracy === null || accuracy > 200) {
      setMessage("Précision trop faible (> 200m), veuillez re-détecter votre position.");
      return;
    }

    const result = await Swal.fire({
      toast: true,
      position: 'top-end',
      timer: 7000,
      timerProgressBar: true,
      title: 'Confirmation',
      text: 'Envoyer vos coordonnées GPS ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    });

    if (!result.isConfirmed) return setMessage("Envoi annulé.");
    if (!user || !user.id || !user.name) return setMessage("Utilisateur non connecté.");
    if (!validateCoordinates(longitude, latitude)) return setMessage("Coordonnées invalides.");

    try {
      const geo = await axios.get('/geojson/limites.json');
      const zone = detectZoneWithTurf(longitude, latitude, geo.data);
      const res = await axios.post('http://localhost:8000/api/coordonnees', {
        longitude,
        latitude,
        adresse: adresseEstimee,
      }, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },              
      });
      const data = res.data;
      setMessage(data.message || "Coordonnées enregistrées !");
      setZoneInfo(zone);
      setTimeout(() => navigate('/coordonnees'), 10000);
    } catch (error) {
      console.error(error);
      setMessage("Erreur de connexion au serveur.");
      setZoneInfo(null);
    }
  };*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (accuracy === null || accuracy > 200) {
      setMessage("Précision trop faible (> 200m), veuillez re-détecter votre position.");
      return;
    }

    if (!user || !user.id || !user.name) {
      return setMessage("Utilisateur non connecté.");
    }

    if (!validateCoordinates(longitude, latitude)) {
      return setMessage("Coordonnées invalides.");
    }

    try {

      const res = await axios.post(
        'http://localhost:8000/api/coordonnees',
        {
          longitude,
          latitude,
          adresse: adresseEstimee,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          },
        }
      );

      const data = res.data;

      setMessage(data.message || "Coordonnées enregistrées !");

      setZoneInfo({
        status: data.status,
        quartier: data.quartier,
        commune: data.commune,
        district: data.district,
        region: data.region,
        province: data.province,
      });

      setTimeout(() => navigate('/coordonnees'), 10000);

    } catch (error) {
      console.error(error);
      setMessage("Erreur de connexion au serveur.");
      setZoneInfo(null);
    }
  };

  // Envoi automatique toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!navigator.geolocation || !user || !token) return;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const acc = position.coords.accuracy;

          if (acc > 200 || isNaN(lat) || isNaN(lon)) return;

          /*try {
            const geo = await axios.get('/geojson/limites.json');
            const zone = detectZoneWithTurf(longitude, latitude, geo.data);
            const res = await axios.post('http://localhost:8000/api/coordonnees', {
              longitude: lon,
              latitude: lat,
              adresse: adresseEstimee,
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
              },
            });

            const now = new Date();
            const heures = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const data = res.data;
            setMessage(data.message || `Coordonnées envoyées automatiquement à ${heures}h${minutes}`);

            setZoneInfo(zone);
            setTimeout(() => {
              navigate('/coordonnees');
              setMessage('');
            }, 10000); // 10 secondes

          }catch (error) {
            console.error("Erreur lors de l'envoi automatique :", error);
          }*/
          try {

            const res = await axios.post(
              'http://localhost:8000/api/coordonnees',
              {
                longitude: lon,
                latitude: lat,
                adresse: adresseEstimee,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json"
                },
              }
            );

            const data = res.data;

            setMessage(data.message || `Coordonnées envoyées automatiquement`);

            setZoneInfo({
              status: data.status,
              quartier: data.quartier,
              commune: data.commune,
              district: data.district,
              region: data.region,
              province: data.province,
            });

            setTimeout(() => {
              navigate('/coordonnees');
              setMessage('');
            }, 10000);

          } catch (error) {
            console.error("Erreur lors de l'envoi automatique :", error);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation automatique :", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 0,
        }
      );
    }, 1 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className='header-coordonnee mt-5'>
        <div className="coordonnee-page">
          <div className="coordonnee-form-box text-center mb-3">
            <FaMapMarkerAlt size={50} color="red" /><br />
            <h2 className="coordonnee-title text-center mt-3">
              Envoyer ma position GPS
            </h2>
            <p className="coordonnee-description text-center">
              Assurez-vous que votre GPS est activé et que laccès est autorisé
            </p>

            <div className="text-center mb-3">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                  <div className="spinner-grow text-primary me-2" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <span>Localisation en cours...</span>
                </div>
              ) : (
                <p>
                  <strong>Longitude :</strong> {longitude || '...'}<br />
                  <strong>Latitude :</strong> {latitude || '...'}<br />
                  <strong>Précision :</strong> {accuracy ? `${Math.round(accuracy)} m` : '...'}
                </p>
              )}
            </div>

            {accuracy !== null && accuracy > 200 && (
              <div className="alert alert-danger text-center">
                Précision insuffisante (&gt; 200 mètres). Veuillez réessayer.
              </div>
            )}

            {accuracy !== null && accuracy <= 200 && adresseEstimee && (
              <div className="alert alert-secondary text-center">
                <strong>Adresse estimée :</strong><br />
                {adresseEstimee}
              </div>
            )}

            <form onSubmit={handleSubmit} className="coordonnee-form">
              <input type="text" value={latitude} readOnly required className="form-control mb-2" />
              <input type="text" value={longitude} readOnly required className="form-control mb-2" />

              {/* Boutons masqués, non supprimés */}

              <div className="d-grid gap-2 d-md-flex justify-content-center mt-3">
                <button type="submit" className="btn btn-warning w-100 mb-2" disabled={loading || accuracy > 200}>
                  {loading ? "Chargement..." : "Envoyer"}
                </button>
                <button onClick={getCurrentPosition} className="btn btn-primary w-100 mb-2" disabled={loading}>
                  Re-détecter ma position
                </button>
              </div>

            </form>

            {message && (
              <div className={`alert text-center ${message.includes('Erreur') || message.includes('non connecté') ? 'alert-danger' : 'alert-success'}`}>
                {message.includes('succès') || message.includes('enregistrées') || message.includes('automatiquement') ? (
                  <FaCheckCircle className="me-2" />
                ) : (
                  <FaExclamationTriangle className="me-2" />
                )}
                {message}
              </div>
            )}

            {zoneInfo && (
              <div className="zone-details p-3 border rounded bg-light">
                <h5>Détails de la zone détectée :</h5>
                <ul className="list-unstyled">
                  <li><strong>Status :</strong> {zoneInfo.status}</li>
                  <li><strong>Quartier :</strong> {zoneInfo.quartier || 'Inconnu'}</li>
                  <li><strong>Commune :</strong> {zoneInfo.commune || 'Inconnue'}</li>
                  <li><strong>District :</strong> {zoneInfo.district || 'Inconnu'}</li>
                  <li><strong>Région :</strong> {zoneInfo.region || 'Inconnue'}</li>
                  <li><strong>Province :</strong> {zoneInfo.province || 'Inconnue'}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoordonneeForm;
