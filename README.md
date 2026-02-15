# gmcom-geolocalisation
   Application web de géolocalisation et de suivi en temps réel des activités des agents commerciaux - GMCOM.
   
   ## Prérequis
   - PHP 8.1+
   - Composer
   - Node.js 18+
   - PostgreSQL
   
   ## Installation
    # Installez le backend :
      bash
      cd geo/geo_back
      composer install
      cp .env.example .env
      php artisan key:generate
    # configurez votre base de données dans .env
      php artisan migrate
      php artisan serve

    # Installez le frontend :
      bash
      cd geo/geo_front
      npm install
      npm start
      
    # Lancez le serveur socket :
      bash
      cd geo/socket-server
      npm install
      node server.js
 