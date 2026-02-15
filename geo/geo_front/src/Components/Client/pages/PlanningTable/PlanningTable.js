import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PlanningTable.css';

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi'];

function PlanningTable() {
  const [planning, setPlanning] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/planning')
      .then(response => {
        setPlanning(response.data);
      })
      .catch(error => {
        console.error('Erreur lors du chargement du planning:', error);
      });
  }, []);

  return (
    <div className="container">
      <h3 className='text-center text-dark mt-4 mb-4' style={{ fontSize: 24, fontWeight: 'bold' }}>Planning de la semaine de : </h3>
      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center">
          <thead>
            <tr>
              <th>Activité</th>
              {jours.map((jour, i) => (
                <th key={i}>{jour}</th>
              ))}
              <th>Total</th>
              <th rowSpan="4">ID</th>
            </tr>
          </thead>
          <tbody>
            {planning.map((agent, index) => (
              <>
                {/* Présentation */}
                <tr key={`${index}-P`}>
                  <td className='text-red'>P</td>
                  {jours.map(jour => (
                    <td key={jour} className={agent.P[jour] === 0 ? 'bg-red' : 'bg-green'}>
                      {agent.P[jour]}
                    </td>
                  ))}
                  <td className={Object.values(agent.P).reduce((a, b) => a + b, 0) > 0 ? 'bg-blue' : ''}>
                    {Object.values(agent.P).reduce((a, b) => a + b, 0)}
                  </td>
                  <td rowSpan="3">{agent.id}</td>
                </tr>

                {/* Vente */}
                <tr key={`${index}-V`}>
                  <td className='text-black'>V</td>
                  {jours.map(jour => (
                    <td key={jour} className={agent.V[jour] === 0 ? 'bg-red' : 'bg-green'}>
                      {agent.V[jour]}
                    </td>
                  ))}
                  <td className={Object.values(agent.V).reduce((a, b) => a + b, 0) > 0 ? 'bg-blue' : ''}>
                    {Object.values(agent.V).reduce((a, b) => a + b, 0)}
                  </td>
                </tr>

                {/* Travaux */}
                <tr key={`${index}-T`}>
                  <td>T</td>
                  {jours.map(jour => (
                    <td key={jour} className={agent.T[jour] === 0 ? 'bg-red' : 'bg-green'}>
                      {agent.T[jour]}
                    </td>
                  ))}
                  <td className={Object.values(agent.T).reduce((a, b) => a + b, 0) > 0 ? 'bg-blue' : ''}>
                    {Object.values(agent.T).reduce((a, b) => a + b, 0)}
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlanningTable;
