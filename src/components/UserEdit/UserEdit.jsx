import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, X, Upload, Rocket } from 'lucide-react';

const UserEdit = ({ isOpen, onClose, initialUser }) => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    profilePic: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inicializar datos del usuario cuando el componente se monta o cuando cambia initialUser
  useEffect(() => {
  if (initialUser) {
    // Establecer los datos iniciales
    setUserData(prevData => ({
      ...prevData,
      username: initialUser.name || '',
      email: initialUser.email || '',
      bio: initialUser.bio || ''
    }));

    // Priorizar la imagen del initialUser (viene del backend)
    if (initialUser.profilePic) {
      setPreviewImage(`data:image;base64,${initialUser.profilePic}`);
    } else {
      // Fallback: si no hay imagen en initialUser, intentar desde localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.profilePic) {
        setPreviewImage(`data:image;base64,${storedUser.profilePic}`);
      }
    }
  }
}, [initialUser, isOpen]);

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
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validación básica
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Crear FormData para enviar la información, incluyendo posiblemente un archivo
      const formData = new FormData();
      if (userData.username) formData.append('username', userData.username);
      if (userData.bio !== undefined) formData.append('bio', userData.bio);
      if (userData.password) formData.append('password', userData.password);

      // Añadir la imagen si se seleccionó una nueva
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput.files[0]) {
        formData.append('profilePic', fileInput.files[0]);
      }

      // Realizar la petición al backend
      const response = await fetch('http://localhost:3000/updateprofile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el perfil');
      }

      // Actualizar la información del usuario en localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        username: data.username || storedUser.username,
        profilePic: data.profilePic || storedUser.profilePic,
        bio: data.bio || storedUser.bio,
        email: data.email || storedUser.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Perfil actualizado correctamente');
      
      // Esperar un segundo antes de cerrar para que se vea el mensaje de éxito
      setTimeout(() => {
        onClose();
        // Recargar la página para mostrar los cambios
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-2xl border border-purple-500 relative">
        {/* Botón de cierre */}
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
          
          {/* Mensajes de error o éxito */}
          {error && (
            <div className="mt-4 p-2 bg-red-500 bg-opacity-70 text-white rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-2 bg-green-500 bg-opacity-70 text-white rounded-md">
              {success}
            </div>
          )}
          
          {/* Selector de imagen de perfil */}
          <div className="mt-6 flex justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 flex items-center justify-center bg-gray-800">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error al cargar imagen en UserEdit:', e);
                      console.log('URL de imagen:', e.target.src.substring(0, 100) + '...');
                      // Si falla la imagen, mostrar el icono de fallback
                      setPreviewImage(null);
                    }}
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
          {/* Nombre de usuario */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-purple-400" />
            </div>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nombre de explorador"
            />
          </div>
          
          {/* Email (solo visualización) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-purple-400" />
            </div>
            <input
              type="email"
              name="email"
              value={userData.email}
              readOnly
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent opacity-70"
              placeholder="Email cósmico"
            />
          </div>

          {/* Biografía */}
          <div>
            <textarea
              name="bio"
              value={userData.bio}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Comparte tu historia intergaláctica..."
              rows={3}
            />
          </div>

          {/* Nueva contraseña */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-purple-400" />
            </div>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nueva contraseña estelar (opcional)"
            />
          </div>

          {/* Confirmar nueva contraseña */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-purple-400" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirmar nueva contraseña"
            />
          </div>
          
          {/* Botón de guardar */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-2 px-4 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer hover:scale-102 duration-300 mt-10"
            >
              {isLoading ? "Guardando..." : "Guardar cambios cósmicos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;