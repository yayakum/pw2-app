import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown, LogOut } from 'lucide-react';

const Header = (
//   notifications = 0, 
//   messages = 0,
//   logoText = "CosmicPortal",
//   searchPlaceholder = "Buscar en el cosmos...",
//   profileImage = "/api/placeholder/32/32"
) => {
  return (
    <header className="sticky top-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-purple-900 shadow-lg justify-items-center ">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 cursor-pointer">
              PortalCosmico
            </h1>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="hidden md:flex relative mx-4 flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hover:scale-105 duration-300">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar en el cosmos..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:scale-105 duration-300"
            />
          </div>
          
          {/* Iconos de navegación */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-800 relative cursor-pointer  hover:scale-105 duration-300">
              <Bell size={24} />
              {/* Puedes añadir un prop para mostrar el número de notificaciones */}
              {/* {notifications > 0 && (
                <span className="absolute top-0 right-0 inline-block w-5 h-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )} */}
            </button>
            
            {/* <button className="p-2 rounded-full hover:bg-gray-800 relative cursor-pointer hover:scale-105 duration-300">
              <MessageSquare size={24} />
              {/* {messages > 0 && (
                <span className="absolute top-0 right-0 inline-block w-5 h-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                  {messages}
                </span>
              )} 
            </button> */}
            
            <div className="relative group">
              <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-800  hover:scale-105 duration-300 cursor-pointer">
                <img
                  src="/api/placeholder/32/32"
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-500"
                />
              </button>
            </div>
            
            <button className="p-2 rounded-full hover:bg-gray-800 relative cursor-pointer hover:scale-105 duration-300">
              <LogOut size={24} />
             
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;