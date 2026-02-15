import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PlanningList.css';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const PlanningList = () => {
  const [plannings, setPlannings] = useState([]);
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const response = await axios.get('http://localhost:8000/api/plannings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const normalizedPlannings = response.data.map(agent => {
          const semaine = {};
          jours.forEach(jour => {
            semaine[jour] = {
              P: agent.semaine?.[jour]?.P || 0,
              V: agent.semaine?.[jour]?.V || 0,
              T: agent.semaine?.[jour]?.T || 0,
            };
          });
          return {
            pseudo: agent.pseudo,
            semaine
          };
        });

        setPlannings(normalizedPlannings);
      } catch (error) {
        console.error('Erreur lors du chargement des plannings :', error);
      }
    };

    fetchPlannings();
  }, []);

  return (
    <div className="planning-cont">
      <div className="container-pa">
        <div className="card-header-pa d-flex justify-content-between align-items-center">
          <h3 className="text-center text-dark mt-3 mb-4" style={{ fontSize: 24, fontWeight: 'bold' }}>
            Planning de la semaine suivante : {getNextWeekDate()}
          </h3>
          <Link to="/planning-form"
            className="btn btn-outline-success rounded-circle d-flex align-items-center"
            style={{ width: "40px", height: "40px" }}>
            <FaPlus size={20} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped text-center">
            <thead>
              <tr>
                <th>Activité</th>
                {jours.map((jour, i) => (
                  <th key={i}>{jour}</th>
                ))}
                <th>Total</th>
                <th>AC</th>
              </tr>
            </thead>
            <tbody>
              {plannings.map((agent, index) => (
                <React.Fragment key={index}>
                  {/* Présentation */}
                  <tr>
                    <td>P</td>
                    {jours.map((jour, i) => (
                      <td key={i}>{agent.semaine[jour].P}</td>
                    ))}
                    <td>{jours.reduce((sum, jour) => sum + agent.semaine[jour].P, 0)}</td>
                    <td rowSpan={3}>{agent.pseudo}</td>
                  </tr>

                  {/* Vente */}
                  <tr>
                    <td>V</td>
                    {jours.map((jour, i) => (
                      <td key={i}>{agent.semaine[jour].V}</td>
                    ))}
                    <td>{jours.reduce((sum, jour) => sum + agent.semaine[jour].V, 0)}</td>
                  </tr>

                  {/* Travaux */}
                  <tr>
                    <td>T</td>
                    {jours.map((jour, i) => (
                      <td key={i}>{agent.semaine[jour].T}</td>
                    ))}
                    <td>{jours.reduce((sum, jour) => sum + agent.semaine[jour].T, 0)}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanningList;
