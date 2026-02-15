import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ZonesPage = () => {
  const [zones, setZones] = useState([]);
  const [nom, setNom] = useState('');
  const [coordonnees, setCoordonnees] = useState('');
  const [editingZone, setEditingZone] = useState(null);

  // Charger les zones existantes
  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const res = await axios.get('http://localhost:8000/api/zones');
    setZones(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nom,
        coordonnees: JSON.parse(coordonnees),
      };

      if (editingZone) {
        await axios.put(`http://localhost:8000/api/zones/${editingZone.id}`, data);
        alert("Zone modifiée !");
        setEditingZone(null);
      } else {
        await axios.post('http://localhost:8000/api/zones', data);
        alert("Zone ajoutée !");
      }

      setNom('');
      setCoordonnees('');
      fetchZones();
    } catch (err) {
      alert("Erreur lors de la soumission.");
    }
  };

  const handleEdit = (zone) => {
    setNom(zone.nom);
    setCoordonnees(JSON.stringify(zone.coordonnees));
    setEditingZone(zone);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      await axios.delete(`http://localhost:8000/api/zones/${id}`);
      fetchZones();
    }
  };

  return (
    <div style={{ paddingTop: '0px' }}>
      <h2 className='text-center' style={{ fontSize: '20px' }}>{editingZone ? "Modifier une zone" : "Ajouter une zone"}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nom de la zone"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <textarea
          placeholder='Coordonnées (ex: [[-18.5, 45.5], [-18.5, 47.8], ...])'
          value={coordonnees}
          onChange={(e) => setCoordonnees(e.target.value)}
          rows={4}
        />
        <button type="submit">{editingZone ? "Modifier" : "Ajouter"} la zone</button>
      </form>

      <MapContainer center={[-18.9, 47.5]} zoom={6} style={{ height: '66vh' }}>
        <TileLayer 
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        {zones.map((zone, idx) => (
          <Polygon
            key={idx}
            positions={zone.coordonnees}
            pathOptions={{ color: 'blue' }}
          >
            <Popup>
              <strong>{zone.nom}</strong><br />
              <button onClick={() => handleEdit(zone)}>Modifier</button><br />
              <button onClick={() => handleDelete(zone.id)}>Supprimer</button>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
};

export default ZonesPage;