import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserName = () => {
    return userData?.username || "Usuario";
  };
  
  // Cargar datos del usuario y su imagen de perfil
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Primero cargar datos básicos del localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }

        // Luego hacer petición al backend para obtener datos completos incluida la imagen
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const profileData = await response.json();
            setUserData(profileData);
            setProfilePic(profileData.profilePic);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
              <Link 
                to="/Profile"  
                className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500 cursor-pointer hover:scale-105 duration-300 overflow-hidden"
              >
                {profilePic && !loading ? (
                  <img 
                    src={`data:image;base64,${profilePic}`} 
                    alt={`${getUserName()} avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error al cargar imagen del header:', e);
                      // Si falla la imagen, mostrar la inicial
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <span 
                  className={`text-white font-bold ${profilePic && !loading ? 'hidden' : 'block'}`}
                  style={{ display: profilePic && !loading ? 'none' : 'block' }}
                >
                  {getUserName().charAt(0).toUpperCase()}
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