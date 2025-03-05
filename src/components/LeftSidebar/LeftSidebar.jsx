/* eslint-disable no-unused-vars */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Users, MessageCircle, Bookmark, Settings } from 'lucide-react';

const LeftSidebar = () => {
  // Hook para obtener la ruta actual
  const location = useLocation();

  // Datos simulados para usuarios activos
  const activeUsers = [
    { id: 1, name: 'Nebula Walker', avatar: '/api/placeholder/40/40' },
    { id: 2, name: 'Stellar Nomad', avatar: '/api/placeholder/40/40' },
    { id: 3, name: 'Luna Explorer', avatar: '/api/placeholder/40/40' }
  ];

  // Secciones del menú con sus rutas correspondientes
  const menuSections = [
    { icon: Home, name: 'Inicio', path: '/Dashboard' },
    { icon: User, name: 'Perfil', path: '/Profile' },
    // { icon: Users, name: 'Amigos', path: '' }, // Ajusta esta ruta según tu estructura
    { icon: MessageCircle, name: 'Mensajes', path: '' }, // Ajusta esta ruta según tu estructura
    { icon: Bookmark, name: 'Favoritos', path: '' }, // Ajusta esta ruta según tu estructura
    // { icon: Settings, name: 'Configuración', path: '' } // Ajusta esta ruta según tu estructura
  ];

  return (
    <aside className="w-full md:w-1/4 md:pr-4 mb-6 md:mb-0 hidden md:block">
      <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md sticky top-24">
        <nav className="space-y-1">
          {menuSections.map(({ icon: Icon, name, path }) => (
            <Link 
              key={name}
              to={path}
              className={` w-full flex items-center space-x-3 p-2 rounded-md transition ${
                location.pathname === path
                  ? 'bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-70 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Icon size={20} />
              <span>{name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="font-medium text-lg mb-4">Exploradores Activos</h3>
          <ul className="space-y-3">
            {activeUsers.map(user => (
              <li key={user.id} className="flex items-center">
                <div className="relative">
                  <img src={user.avatar} alt={`${user.name}`} className="w-8 h-8 rounded-full" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800"></span>
                </div>
                <span className="ml-3">{user.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;