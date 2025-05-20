import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const getUserName = () => {
    return userData?.username || "Usuario";
  };
  
  // Cargar datos del usuario desde localStorage cuando el componente se monta
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
  
  const handleLogout = () => {
    // Eliminar datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirigir al login
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-purple-900 shadow-lg justify-items-center ">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          <div className="flex items-center">
            <Link to="/Dashboard">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 cursor-pointer">
                PortalCosmico
              </h1>
            </Link>
          </div>
          
          {/* Iconos de navegación */}
          <div className="flex items-center space-x-4">
            <button>
              <NotificationCenter/>
            </button>
            
            <div className="relative group">
              <Link to="/Profile"  className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500 cursor-pointer hover:scale-105 duration-300">
                <span className="text-white font-bold">{getUserName().charAt(0).toUpperCase()}</span>
              </Link>
            </div>
            
            <button 
              className="p-2 rounded-full hover:bg-gray-700 relative cursor-pointer hover:scale-105 duration-300"
              onClick={handleLogout}
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;