import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Pages/Sidebar/Sidebar';
import './AdminLayout.css';
//import Footer from '../../Client/pages/Footer/Footer';

const AdminLayout = () => {
  const location = useLocation();
  //const hideFooter = ['/login', '/register'].includes(location.pathname);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="admin-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`admin-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="admin-main">
          <Outlet />
        </div>
        {/*{!hideFooter && <Footer />}*/}
      </div>
    </div>
  );
};

export default AdminLayout;
