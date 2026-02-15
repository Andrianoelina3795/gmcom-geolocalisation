import { Outlet, useLocation } from 'react-router-dom';
import './ClientLayout.css';
import HeaderLeka from '../pages/HeaderLeka/HeaderLeka';
import Footer from '../pages/Footer/Footer';

export default function ClientLayout() {
  const location = useLocation(); // fonction react hook de reacct-router-dom
  const hideFooter = ['/login', '/register'].includes(location.pathname); // Vérifie la route actuelle

  return (
    <div className="client-layout">
      <HeaderLeka />

      <main className="client-main">
        <Outlet />
      </main>

      {/* N'affiche pas le footer sur /login ou /register */}
      {!hideFooter && <Footer />}
    </div>
  );
}

