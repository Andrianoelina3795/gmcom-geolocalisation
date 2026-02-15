import { useEffect, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaUsers, FaRoute, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import './Statistique.css';

function Statistiques() {
  const [users, setUsers] = useState([]);
  const [coordonnees, setCoordonnees] = useState([]);
  const [zones, setZones] = useState([]);
  const [activityToday, setActivityToday] = useState(0);

  useEffect(() => {
    // Récupération agents
    axios.get("http://127.0.0.1:8000/api/users")
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));

    // Récupération positions
    axios.get("http://127.0.0.1:8000/api/coordonnees")
      .then(response => setCoordonnees(response.data))
      .catch(error => console.error(error));

    // Récupération zones
    axios.get("http://127.0.0.1:8000/api/zones")
      .then(response => setZones(response.data))
      .catch(error => console.error(error));

    // Récupération activité du jour
    axios.get("http://127.0.0.1:8000/api/coordonnees/today")
      .then(response => setActivityToday(response.data.count))
      .catch(error => console.error(error));

  }, []);

  const dataGraph = [
    { name: 'Antananarivo', agents: 50 },
    { name: 'Ambohidratrimo', agents: 20 },
    { name: 'Ankazobe', agents: 15 },
    { name: 'Andramasina', agents: 12 },
  ];

  return (
    <div style={{ paddingTop: '0px' }}>
    <div className="stat-container">
      <div>
        <h1 className="stat-title text-2xl font-bold"> Statistiques</h1>

        <div className="stat-grid grid-cols-5 gap-0 mb-8" style={{  }}>
          <div className="bg-green p-2 rounded shadow flex items-center" style={{ height: '135px', width:'194px', backgroundColor: '#48d483' }}>
            <FaUsers size={20} color='#6610f2' className="text-3xl text-blue-500 mr-4" />
            <div>
              <p className="text-white-500">Utilisateurs</p>
              <p className="text-lg font-bold">{users.length}</p>
            </div>
          </div>

          <div className="bg-orange p-2 rounded shadow flex items-center" style={{ height: '135px',marginLeft:'20px', width:'194px', backgroundColor: '#eb64fe' }}>
            <FaMapMarkerAlt size={20} color="red" className="text-3xl text-green-500" />
            <div>
              <p className="text-white-500">Coordonnées</p>
              <p className="text-lg font-bold">{coordonnees.length}</p>
            </div>
          </div>

          <div className="bg-gray p-2 rounded shadow flex items-center" style={{ height: '135px',marginLeft:'20px', width:'194px', backgroundColor: '#60aff5' }}>
            <FaRoute size={20} color="purple" className="text-3xl text-purple-500" />
            <div>
              <p className="text-white-500">Zones</p>
              <p className="text-lg font-bold">{zones.length}</p>
            </div>
          </div>
          <div className="bg-gray p-2 rounded shadow flex items-center" style={{ height: '135px',marginLeft:'20px', width:'194px', backgroundColor: '#60aff5' }}>
            <FaExclamationTriangle size={20} color="red" className="text-3xl text-purple-500" />
            <div>
              <p className="text-white-500">Alertes</p>
              <p className="text-lg font-bold">{/*alertes.length*/}</p>
            </div>
          </div>

          <div className="bg-red p-2 rounded shadow flex items-center" style={{ height: '135px',marginLeft:'20px', width:'194px', backgroundColor: '#f3cd29'}}>
            <FaChartLine size={20} color="blue" className="text-3xl text-orange-500" />
            <div>
              <p className="text-white-500">Activité du jour</p>
              <p className="text-lg font-bold">{activityToday}</p>
            </div>
          </div>
        </div>

        {/* Graphique */}
        <div className="graph mb-0">
        <div className=" graph-card bg-whith">
          <h2 className="text-lg font-bold mb-4">Répartition des agents par district</h2>
          <ResponsiveContainer width="50%" height={250}>
            <BarChart data={dataGraph}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="agents" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Statistiques;