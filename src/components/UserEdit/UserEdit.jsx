import React, { useState } from 'react';
import { User, Lock, Mail, Calendar, X, Upload, Rocket } from 'lucide-react';

const UserEdit = ({ isOpen, onClose, initialUser }) => {
  const [userData, setUserData] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    profileImage: initialUser?.profileImage || null,
    birthDate: initialUser?.birthDate || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated user data to your backend
    console.log('Updated User Data:', userData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-2xl border border-purple-500 relative">
        {/* Close Button */}
                  <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Editar Perfil Cósmico
          </h2>
          <p className="text-blue-300 mt-2">Actualiza tu identidad intergaláctica</p>
          
          {/* Profile Image Selector */}
          <div className="mt-6 flex justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 flex items-center justify-center bg-gray-800">
                {userData.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-purple-400">
                    <Rocket 
                      width="40" 
                      height="40"
                    />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="opacity-0 absolute inset-0 w-24 h-24 rounded-full cursor-pointer z-10" 
                onChange={handleImageChange}
              />
              <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Upload size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-purple-400" />
            </div>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nombre de explorador"
            />
          </div>
          
          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-purple-400" />
            </div>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Email cósmico"
            />
          </div>
          
          {/* Birth Date Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={20} className="text-purple-400" />
            </div>
            <input
              type="date"
              name="birthDate"
              value={userData.birthDate}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Fecha de nacimiento estelar"
            />
          </div>
          
          {/* Save Changes Button */}
          <div>
            <button
              type="submit"
              className="relative w-full flex justify-center py-2 px-4 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer hover:scale-102 duration-300 mt-10"
            >
              Guardar cambios cósmicos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;