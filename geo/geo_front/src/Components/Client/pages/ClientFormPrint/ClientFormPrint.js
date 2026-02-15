import React, { useEffect } from 'react';
import './ClientFormPrint.css';

const ClientFormPrint = ({ clientData, showPrintData }) => {
  // Impression automatique
  useEffect(() => {
    if (showPrintData && clientData) {
      const timer = setTimeout(() => {
        window.print();
      }, 500); // Réduit à 500ms pour plus de réactivité
      
      return () => clearTimeout(timer);
    }
  }, [showPrintData, clientData]);

  if (!showPrintData || !clientData) return null;

  return (
    <div id="printable" className="print-cv">
      <div className="cv-container">
        
        {/* En-tête */}
        <div className="cv-header">
          <h1>FICHE CLIENT - GMCOM</h1>
          <div className="cv-date">
            Date: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        <div className="cv-content">
          {/* Partie gauche : Infos du client */}
          <div className="cv-info">
            <h3>INFORMATIONS GÉNÉRALES</h3>
            
            <div className="info-section">
              <div className="info-row">
                <span className="info-label">ID Client:</span>
                <span className="info-value">{clientData.id_client || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">{clientData.type || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Activité:</span>
                <span className="info-value">{clientData.activite || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date:</span>
                <span className="info-value">{clientData.date || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">AC:</span>
                <span className="info-value">{clientData.ac || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Contact AC:</span>
                <span className="info-value">{clientData.contact_ac || 'N/A'}</span>
              </div>
            </div>

            <h3>INFORMATIONS PERSONNELLES</h3>
            <div className="info-section">
              <div className="info-row">
                <span className="info-label">Type client:</span>
                <span className="info-value">{clientData.type_client || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Nom:</span>
                <span className="info-value">{clientData.nom_client || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Adresse:</span>
                <span className="info-value">{clientData.adresse || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Fokontany:</span>
                <span className="info-value">{clientData.fokontany || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Commune:</span>
                <span className="info-value">{clientData.commune || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Province:</span>
                <span className="info-value">{clientData.province || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Statut logement:</span>
                <span className="info-value">{clientData.statut_logement || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Nombre d'usagers:</span>
                <span className="info-value">{clientData.nombre_usagers || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Source de revenus:</span>
                <span className="info-value">{clientData.source_revenus || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Autre revenu:</span>
                <span className="info-value">{clientData.source_revenus_autre || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Contact:</span>
                <span className="info-value">{clientData.contact_client || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Partie droite : Photo */}
          <div className="cv-photo">
            {clientData.photo ? (
              <img
                src={clientData.photo}
                alt="Photo du client"
                className="cv-img"
              />
            ) : (
              <div className="no-photo">
                <p>Aucune photo</p>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        
        <div className="cv-footer">
          {/*
          <div className="signature">
            <p>Signature du client: _________________________</p>
          </div>
          <div className="signature">
            <p>Signature de l'agent: _________________________</p>
          </div>
          */}
          <div className="footer-note">
            <p>Document confidentiel - GMCOM Madagascar © {new Date().getFullYear()}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientFormPrint;
