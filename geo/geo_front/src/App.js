import { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, Navigate } from 'react-router-dom';

import Dashboard from './Components/Admin/Pages/Dashboard/Dashboard';
import Login from './Components/Client/pages/LoginRegister/Login';
import Register from './Components/Client/pages/LoginRegister/Register';
import Accueil from './Components/Client/pages/Accueil/Accueil';

import UserList from './Components/Admin/Pages/Users/UserList';
import UserEdit from './Components/Admin/Pages/Users/UserEdit';
import CoordonneeList from './Components/Admin/Pages/Coordonnees/CoordonneeList';

import CoordonneeForm from './Components/Client/pages/CoordonneeForm/CoordonneeForm';
import MapView from './Components/Admin/Pages/MapView/MapView';
import FokontanyDetectionMap from './Components/Client/pages/FokontanyDetectionMap/FokontanyDetectionMap';
import Contact from './Components/Client/pages/Contact/Contact';
import About from './Components/Client/pages/About/About';
import Historique from './Components/Client/pages/Historique/Historique';
import Zone from './Components/Client/pages/Zone/Zone';
import Chat from './Components/Client/pages/services/Chat';

import { MyContext } from './Components/Context/MyContext';

import AdminLayout from './Components/Admin/AdminLayout/AdminLayout';
import ClientLayout from './Components/Client/ClientLayout/ClientLayout';
import GeoTest from './Components/Client/pages/GeoTest/GeoTest';
import ClientForm from './Components/Client/pages/ClientForm/ClientForm';
import ClientList from './Components/Admin/Pages/ClientList/ClientList';
import Profile from './Components/Client/pages/Profile/Profile';
import ModifierProfile from './Components/Client/pages/Profile/ModifierProfile';
import PlanningTable from './Components/Client/pages/PlanningTable/PlanningTable';
import ProduitAdd from './Components/Admin/Pages/Produit/ProduitAdd';
import ProduitList from './Components/Admin/Pages/Produit/ProduitList';
import ProduitEdit from './Components/Admin/Pages/Produit/ProduitEdit';
import ActiviteDuJour from './Components/Admin/Pages/ActiviteDuJour/ActiviteDuJour';
import CartePaiement from './Components/Client/pages/CartePaiement/CartePaiement';
import PlanningForm from './Components/Client/pages/PlanningForm/PlanningForm';
import SituationDavancement from './Components/Client/pages/PlanningTable/SituationDavancement';
import SuperviseurVisite from './Components/Client/pages/Superviseur/SuperviseurVisite';
import Statistics from './Components/Admin/Pages/Dashboard/Statistics';
import SituationAvancementAvecGraphiques from './Components/Client/pages/PlanningTable/SituationAvancementAvecGraphiques';
import PaiementList from './Components/Admin/Pages/Paiement/PaiementList.';
import EditPaiement from './Components/Admin/Pages/Paiement/EditPaiement';
import PlanningList from './Components/Client/pages/PlanningList/PlanningList';


function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isHideSidebarAndHeader, setIsHideSidebarAndHeader] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLogin(true);
    }
  }, []);

  const values = {
    isLogin,
    setIsLogin,
    user,
    setUser,
    isHideSidebarAndHeader,
    setIsHideSidebarAndHeader,
  };

  return (
    <MyContext.Provider value={values}>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirection initiale */}
        <Route
          path="/"
          element={
            isLogin ? (
              user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/accueil" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin routes */}
        {isLogin && user?.role === "admin" && (
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="edit-user/:id" element={<UserEdit />} />
            <Route path="list-coordonnee" element={<CoordonneeList />} />
            <Route path="list-paiements" element={<PaiementList />} />
            <Route path="client-list" element={<ClientList />} />
            <Route path="map" element={<MapView />} />
            <Route path="ajout-produit" element={<ProduitAdd />} />
            <Route path="list-produit" element={<ProduitList />} />
            <Route path="edit-produit/:id" element={<ProduitEdit />} />
            <Route path="activite-duJour" element={<ActiviteDuJour />} />
            <Route path="stats" element={<Statistics />} />
            <Route path="graphique" element={<SituationAvancementAvecGraphiques />} />
             <Route path="edit-paiement/:id" element={<EditPaiement/>} />
          </Route>
        )}

        {/* Client routes */}
        {isLogin && (user?.role === "AC" || user?.role === "superviseur" || user?.role === "admin") && (
          <Route path="/*" element={<ClientLayout />}>
            <Route path="accueil" element={<Accueil />} />

            {/* Accessible à tous (AC, superviseur, admin) */}
            <Route path="profile" element={<Profile />} />
            <Route path="modifier-profile" element={<ModifierProfile />} />
            <Route path="planning" element={<PlanningTable />} />
            <Route path="situation_avancement" element={<SituationDavancement />} />
            <Route path="planning-list" element={<PlanningList />} />
            <Route path="coordonnees" element={<CoordonneeForm />} />
            <Route path="fokontany" element={<FokontanyDetectionMap />} />
            <Route path="contact" element={<Contact />} />
            <Route path="a-propos" element={<About />} />
            <Route path="historique" element={<Historique />} />
            <Route path="zone" element={<Zone />} />
            <Route path="mety" element={<GeoTest />} />
            <Route path="chat/:receiverId" element={<Chat />} />

            {/* Seulement AC */}
            {(user?.role === "AC" || user?.role === "admin") && (
              <> 
                <Route path="clients" element={<ClientForm />} />
                <Route path="carte-paiement" element={<CartePaiement />} />
                <Route path="planning-form" element={<PlanningForm />} />

                
              </>
            )}

            {/* Seulement superviseur */}
            {(user?.role === "superviseur" || user?.role === "admin") && (
              <>
                <Route path="superviseur" element={<SuperviseurVisite />} />
                {/* Le superviseur voit le planning, mais pas accès à PlanningForm */}
              </>
            )}
          </Route>
        )}
      </Routes>
    </MyContext.Provider>
  );
}

export default App;
export { MyContext };
