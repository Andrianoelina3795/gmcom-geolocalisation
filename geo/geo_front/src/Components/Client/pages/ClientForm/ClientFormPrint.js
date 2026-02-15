import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './ClientFormPrint.css';

const ClientFormPrint = ({ clientData, showPrintData }) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Fiche_Client_${clientData?.nom_client || ''}`,
    onAfterPrint: () => console.log('Impression terminée')
  });

  if (!showPrintData || !clientData) return null;

  return (
    <div className="print-container">
      {/* Bouton d'impression */}
      <div className="text-center mb-3 no-print">
        <button 
          onClick={handlePrint}
          className="btn btn-success btn-lg"
        >
          🖨️ Imprimer la Fiche Client
        </button>
      </div>

      {/* Contenu à imprimer */}
      <div ref={printRef} className="print-content">
        {/* En-tête avec logo */}
        <div className="print-header">
          <div className="print-logo-section">
            <img src="/logo.jpg" alt="Logo GMCOM" className="print-logo" />
            <div className="print-title">
              <h1>FICHE CLIENT</h1>
              <h2>GMCOM MADAGASCAR</h2>
            </div>
            <img src="/logo.jpg" alt="Logo GMCOM" className="print-logo" />
          </div>
          <div className="print-date">
            Date d'émission: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Informations générales */}
        <div className="print-section">
          <h3>INFORMATIONS GÉNÉRALES</h3>
          <div className="print-grid">
            <div className="print-field">
              <label>ID Client:</label>
              <span>{clientData.id_client || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Date:</label>
              <span>{clientData.date || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Type:</label>
              <span>{clientData.type || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Type travaux:</label>
              <span>{clientData.type_travaux || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Activité:</label>
              <span>{clientData.activite || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Agent Commercial:</label>
              <span>{clientData.ac || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Contact AC:</label>
              <span>{clientData.contact_ac || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="print-section">
          <h3>INFORMATIONS PERSONNELLES</h3>
          <div className="print-grid-2">
            <div className="print-field">
              <label>Nom du Client:</label>
              <span>{clientData.nom_client || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Type de Client:</label>
              <span>{clientData.type_client || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Contact Client:</label>
              <span>{clientData.contact_client || 'N/A'}</span>
            </div>
            
            {/* CIN ou Naissance */}
            {clientData.type_identification === 'cin' && (
              <>
                <div className="print-field">
                  <label>CIN:</label>
                  <span>{clientData.CIN_client || 'N/A'}</span>
                </div>
                <div className="print-field">
                  <label>Date délivrance CIN:</label>
                  <span>{clientData.date_CIN || 'N/A'}</span>
                </div>
                <div className="print-field">
                  <label>Lieu délivrance:</label>
                  <span>{clientData.lieu_CIN || 'N/A'}</span>
                </div>
                <div className="print-field">
                  <label>Duplicata:</label>
                  <span>{clientData.duplicata || 'N/A'}</span>
                </div>
              </>
            )}

            {clientData.type_identification === 'naissance' && (
              <>
                <div className="print-field">
                  <label>Date de Naissance:</label>
                  <span>{clientData.date_naissance || 'N/A'}</span>
                </div>
                <div className="print-field">
                  <label>Lieu de Naissance:</label>
                  <span>{clientData.lieu_naissance || 'N/A'}</span>
                </div>
              </>
            )}

            <div className="print-field full-width">
              <label>Adresse:</label>
              <span>{clientData.adresse || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Fokontany:</label>
              <span>{clientData.fokontany || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Commune:</label>
              <span>{clientData.commune || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Province:</label>
              <span>{clientData.province || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Statut Logement:</label>
              <span>{clientData.statut_logement || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Nombre d'Usagers:</label>
              <span>{clientData.nombre_usagers || 'N/A'}</span>
            </div>
            <div className="print-field">
              <label>Source de Revenus:</label>
              <span>{clientData.source_revenus || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Assainissement et Eau */}
        <div className="print-section">
          <h3>ASSAINISSEMENT ET EAU</h3>
          <div className="print-table">
            <table className="sanitary-print-table">
              <thead>
                <tr>
                  <th colSpan="5">TOILETTE</th>
                </tr>
                <tr>
                  <th>Fosse</th>
                  <th>Plate-forme</th>
                  <th>Source d'eau</th>
                  <th>Aucune</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{clientData.toilette_fosse || 'N/A'}</td>
                  <td>{clientData.toilette_plateforme || 'N/A'}</td>
                  <td>{clientData.toilette_source_eau || 'N/A'}</td>
                  <td>{clientData.toilette_aucune ? 'OUI' : 'NON'}</td>
                </tr>
              </tbody>
            </table>

            <table className="sanitary-print-table">
              <thead>
                <tr>
                  <th colSpan="4">PUIT/FORAGE</th>
                </tr>
                <tr>
                  <th>Simple</th>
                  <th>Motorisé</th>
                  <th>Autre</th>
                  <th>Aucune</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{clientData.puit_simple ? 'OUI' : 'NON'}</td>
                  <td>{clientData.puit_motorise ? 'OUI' : 'NON'}</td>
                  <td>{clientData.puit_autre ? 'OUI' : 'NON'}</td>
                  <td>{clientData.puit_aucune ? 'OUI' : 'NON'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Décision et Paiement */}
        <div className="print-section">
          <h3>DÉCISION ET PAIEMENT</h3>
          <div className="print-grid">
            <div className="print-field">
              <label>Décision:</label>
              <span>{clientData.type_decision === 'oui' ? 'OUI' : 'NON'}</span>
            </div>
            
            {clientData.type_decision === 'oui' && clientData.type !== 'Prospect' && (
              <>
                <div className="print-field">
                  <label>Produit:</label>
                  <span>{clientData.produit || 'N/A'}</span>
                </div>
                <div className="print-field">
                  <label>Montant:</label>
                  <span>{clientData.montant ? `${clientData.montant} Ar` : 'N/A'}</span>
                </div>
                <div className="print-field">
                  <label>Modes de Paiement:</label>
                  <span>{clientData.paiement_mode?.join(', ') || 'N/A'}</span>
                </div>
                {clientData.reference_paiement && (
                  <div className="print-field">
                    <label>Référence Paiement:</label>
                    <span>{clientData.reference_paiement}</span>
                  </div>
                )}
                {clientData.montant_par_mois && (
                  <div className="print-field">
                    <label>Montant par Mois:</label>
                    <span>{clientData.montant_par_mois} Ar</span>
                  </div>
                )}
              </>
            )}

            {clientData.type_decision === 'non' && (
              <div className="print-field full-width">
                <label>Raison du Refus:</label>
                <span>{clientData.raison_refus || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Relance */}
        {(clientData.type === 'Prospect' || clientData.type === 'Follow_up') && clientData.relance && (
          <div className="print-section">
            <h3>RELANCE</h3>
            <div className="print-grid">
              <div className="print-field">
                <label>Relance Effectuée:</label>
                <span>OUI</span>
              </div>
              <div className="print-field">
                <label>Date de Relance:</label>
                <span>{clientData.date_relance || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Consentement */}
        <div className="print-section">
          <div className="consentement-box">
            <div className="print-field">
              <label>Consentement:</label>
              <span>{clientData.consentement ? 
                '✅ Le client accepte que ses données soient utilisées par GMCOM' : 
                '❌ Le client n\'a pas donné son consentement'}
              </span>
            </div>
          </div>
        </div>

        {/* Photo si disponible */}
        {clientData.photo && (
          <div className="print-section">
            <h3>PHOTO DU CLIENT</h3>
            <div className="photo-container">
              <img 
                src={clientData.photo} 
                alt="Photo client" 
                className="client-photo"
              />
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="print-footer">
          <div className="signature-section">
            <div className="signature-box">
              <p>Signature du Client</p>
              <div className="signature-line"></div>
            </div>
            <div className="signature-box">
              <p>Signature de l'Agent Commercial</p>
              <div className="signature-line"></div>
            </div>
          </div>
          <div className="footer-note">
            <p>Document confidentiel - GMCOM Madagascar © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientFormPrint;