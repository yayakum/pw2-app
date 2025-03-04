import React from 'react';
import { Home, User, Users, MessageCircle, Bookmark, Settings } from 'lucide-react';

const LeftSidebar = () => {
  // Datos simulados para usuarios activos
  const activeUsers = [
    { id: 1, name: 'Nebula Walker', avatar: '/api/placeholder/40/40' },
    { id: 2, name: 'Stellar Nomad', avatar: '/api/placeholder/40/40' },
    { id: 3, name: 'Luna Explorer', avatar: '/api/placeholder/40/40' }
  ];

  return (
    <aside className="w-full md:w-1/4 md:pr-4 mb-6 md:mb-0 hidden md:block">
      <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md sticky top-24">
        <nav className="space-y-1">
          <a href="#" className="flex items-center space-x-3 p-2 rounded-md bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-70 text-white">
            <Home size={20} />
            <span>Inicio</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
            <User size={20} />
            <span>Perfil</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
            <Users size={20} />
            <span>Amigos</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
            <MessageCircle size={20} />
            <span>Mensajes</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
            <Bookmark size={20} />
            <span>Guardados</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
            <Settings size={20} />
            <span>Configuración</span>
          </a>
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