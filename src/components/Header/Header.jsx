import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
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
          
          {/* Barra de búsqueda */}
          <div className="hidden md:flex relative mx-4 flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hover:scale-105 duration-300">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar en el cosmos..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-700 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:scale-105 duration-300"
            />
          </div>
          
          {/* Iconos de navegación */}
          <div className="flex items-center space-x-4">
            <button>
              <NotificationCenter/>
            </button>
            
            <div className="relative group">
              <Link to="/Profile" className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-700 hover:scale-105 duration-300 cursor-pointer">
                <img
                  src="/neji.jfif"
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-500"
                />
                <span className="hidden md:inline text-sm text-gray-300">
                  {userData ? userData.username : 'Usuario'}
                </span>
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