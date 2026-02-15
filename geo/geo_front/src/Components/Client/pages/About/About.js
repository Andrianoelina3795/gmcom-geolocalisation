import React from 'react';
import './About.css';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import GMCOM from '../../../../assets/images/a-propos.jpg';
import mapDemo from '../../../../assets/images/mapDemo.jpg';
import agentsField from '../../../../assets/images/agentsField.jpg';
import team from '../../../../assets/images/team.jpg';
import GeographyMap from '../../../../assets/images/GeographyMap.jpg';

const About = () => {
  return (
    <>
      <div className='header-apropos'>
      <div className="about-container mt-5 mb-5">
        <div className="about-content">
          <h2 className="about-title">À propos de nous</h2>

          {/* Carrousel d'images */}
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            interval={3000}
            className="about-carousel"
          >
            <div>
              <img src={GMCOM} alt="Carte interactive" />
              <p className="legend">Logo du GMCOM</p>
            </div>

            <div>
              <img src={mapDemo} alt="Carte interactive" />
              <p className="legend">Carte interactive des agents.</p>
            </div>
            <div>
              <img src={GeographyMap} alt="Carte géographique" />
              <p className="legend">Carte géographique en temps réel.</p>
            </div>
            <div>
              <img src={agentsField} alt="Carte du monde" />
              <p className="legend">Carte du monde.</p>
            </div>
            <div>
              <img src={team} alt="Localisation" />
              <p className="legend">Localisation.</p>
            </div>
          </Carousel>

          {/* Section activités */}
          <section className="activity-section mt-3">
            <h4>Nos activités:</h4>
            <ol>
              <li>Étude et conception</li>
              <li>Travaux de génie civil</li>
              <li>Vente de matériaux de construction</li>
              <li>Eaux et assainissement</li>
            </ol>
          </section>

          {/* Section mission */}
          <section className="vision-section mt-3">
            <h4>Notre mission:</h4>
            <p>
              Chez <strong>GMCOM</strong>, nous visons à offrir des solutions durables et innovantes dans le domaine du bâtiment,
              de l'ingénierie et de l'environnement, en nous appuyant sur l'expertise locale et une approche axée sur la qualité.
            </p>
            <p className="about-text">
              Pour toute suggestion ou demande, contactez-nous via notre <a href="/contact" className="about-link">page de contact</a>.
            </p>
          </section>

          {/* Informations officielles */}
          <section className="company-info mt-3">
            <h3 className="company-title text-center mt-2 mb-4">Informations légales de l'entreprise</h3>
            <ul className="company-details">
              <li><strong>Entreprise :</strong> GMCOM (Genius Madagascar COMpany)</li>
              <li><strong>Slogan :</strong> "Mifanohana mba ho vanona"</li>
              <li><strong>NIF :</strong> 1004014027</li>
              <li><strong>RCS :</strong> 2020B00370</li>
              <li><strong>STAT :</strong> 4100211202010388</li>
              <li><strong>Adresse :</strong> Lot AKT ID 70 BIS ANTANETY II, Vontovorona</li>
              <li><strong>Email :</strong> <a href="mailto:renaly.samtheo@gmail.com">renaly.samtheo@gmail.com</a></li>
              <li><strong>Téléphone :</strong> +261 34 78 695 64</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </>
  );
};

export default About;