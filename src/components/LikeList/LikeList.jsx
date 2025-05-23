import React, { useState, useEffect } from 'react';
import { X, Heart, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const backendURL = import.meta.env.VITE_BACKEND_URL;
const LikeList = ({ isOpen, onClose, postId }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [followStatus, setFollowStatus] = useState({});
  const [profileImages, setProfileImages] = useState({}); // Estado para las imágenes de perfil
  const [loadingImages, setLoadingImages] = useState({}); // Estado para loading de imágenes
  
  const navigate = useNavigate();

  // Cargar likes cuando se abre el modal
  useEffect(() => {
    if (isOpen && postId) {
      fetchLikes();
    }
  }, [isOpen, postId, pagination.page]);

  // Función para cargar la imagen de perfil de un usuario específico
  const fetchUserProfileImage = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Marcar como cargando
      setLoadingImages(prev => ({ ...prev, [userId]: true }));

      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const isCurrentUser = parseInt(userId) === parseInt(currentUserId);
      
      const url = isCurrentUser 
        ? `${backendURL}/profile`
        : `${backendURL}/profile/${userId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setProfileImages(prev => ({
          ...prev,
          [userId]: userData.profilePic
        }));
        return userData.profilePic;
      }
    } catch (error) {
      console.error('Error fetching user profile image:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [userId]: false }));
    }
    return null;
  };

  // Verificar el estado de seguimiento para cada usuario
  const checkFollowStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Obtener los usuarios que sigues
      const response = await fetch(`${backendURL}/getUserFollowing/${JSON.parse(localStorage.getItem('user')).id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al verificar usuarios seguidos');
      }
      
      const data = await response.json();
      
      // Verificar si el usuario está en la lista de seguidos
      const isFollowing = data.data && data.data.some(follow => 
        follow.seguido && follow.seguido.id === parseInt(userId)
      );
      
      return isFollowing;
    } catch (err) {
      console.error(`Error checking follow status for user ${userId}:`, err);
      return false;
    }
  };

  // Función para obtener los likes de una publicación
  const fetchLikes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${backendURL}/getPostLikes/${postId}?page=${pagination.page}&limit=${pagination.limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener likes');
      }
      
      const data = await response.json();
      
      // Actualizar los likes
      const likesData = data.data || [];
      setLikes(likesData);
      
      // Actualizar la paginación
      if (data.pagination) {
        setPagination(data.pagination);
      }
      
      // Verificar el estado de seguimiento para cada usuario
      const newFollowStatus = {};
      const currentUserId = JSON.parse(localStorage.getItem('user')).id;
      
      // Cargar imágenes de perfil y verificar estado de seguimiento para cada usuario
      for (const like of likesData) {
        const userId = like.usuario?.id;
        
        if (!userId) continue;
        
        // Cargar imagen de perfil
        if (!profileImages[userId]) {
          fetchUserProfileImage(userId);
        }
        
        // No necesitamos verificar para el usuario actual
        if (userId === parseInt(currentUserId)) {
          continue;
        }
        
        // Si ya tenemos la información de isFollowing en la respuesta
        if (like.isFollowing !== undefined) {
          newFollowStatus[userId] = like.isFollowing;
        } else {
          // Si no tenemos la información, verificamos manualmente
          try {
            newFollowStatus[userId] = await checkFollowStatus(userId);
          } catch (err) {
            console.error(`Error checking follow status for user ${userId}:`, err);
            newFollowStatus[userId] = false;
          }
        }
      }
      
      setFollowStatus(newFollowStatus);
      
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para seguir a un usuario
  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${backendURL}/followUser/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al seguir al usuario');
      }
      
      // Actualizar el estado de seguimiento
      setFollowStatus({
        ...followStatus,
        [userId]: true
      });
      
    } catch (err) {
      console.error('Error following user:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Función para dejar de seguir a un usuario
  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${backendURL}/unfollowUser/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al dejar de seguir al usuario');
      }
      
      // Actualizar el estado de seguimiento
      setFollowStatus({
        ...followStatus,
        [userId]: false
      });
      
    } catch (err) {
      console.error('Error unfollowing user:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Función para ir a la página anterior
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  // Función para ir a la página siguiente
  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  
  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm shadow-2xl bg-opacity-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center">
            <Heart size={20} className="text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-white">Likes</h3>
            <span className="ml-2 text-gray-400">({pagination.total})</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div className="flex-grow overflow-y-auto p-1">
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
          )}
          
          {error && (
            <div className="p-6 text-center">
              <p className="text-red-400 mb-3">{error}</p>
              <button 
                onClick={fetchLikes}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {!loading && !error && likes.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-2" />
              <p>Nadie ha dado like a esta publicación aún</p>
            </div>
          )}
          
          {!loading && !error && likes.length > 0 && (
            <ul className="divide-y divide-gray-700">
              {likes.map(like => {
                const getUserName = () => {
                    return like.usuario?.username || "Usuario";
                };

                const handleProfileClick = () => {
                  if (isCurrentUser) {
                    navigate(`/Profile`);
                  } else {
                    navigate(`/profile/${like.userId}`);
                  }
                };

                // Obtener el ID del usuario actual
                const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
                const isCurrentUser = like.usuario?.id === parseInt(currentUserId);
                const userId = like.usuario?.id;
                
                // Determinar si estamos siguiendo a este usuario
                const isFollowing = isCurrentUser ? false : (followStatus[userId] || false);
                
                // Obtener la imagen de perfil y estado de carga
                const userProfileImage = profileImages[userId];
                const isLoadingImage = loadingImages[userId];
                
                return (
                  <li key={like.id} className="py-3 px-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {/* Avatar del usuario */}
                        <div 
                          className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500 cursor-pointer overflow-hidden" 
                          onClick={handleProfileClick}
                        >
                          {isLoadingImage ? (
                            <div className="animate-pulse bg-gray-600 w-full h-full rounded-full"></div>
                          ) : userProfileImage ? (
                            <img 
                              src={`data:image/jpeg;base64,${userProfileImage}`}
                              alt={getUserName()}
                              className="w-full h-full object-cover rounded-full"
                              onError={() => setProfileImages(prev => ({ ...prev, [userId]: null }))}
                            />
                          ) : (
                            <span className="text-white font-bold">{getUserName().charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        
                        {/* Información del usuario */}
                        <div className="ml-3">
                          <div className="text-white font-medium">{like.usuario?.username || 'Usuario'}</div>
                          <div className="text-gray-400 text-sm truncate max-w-[200px]">
                            {like.usuario?.bio || ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Botón de seguir/dejar de seguir (no mostrar para el propio usuario) */}
                      {!isCurrentUser && (
                        <button 
                          onClick={() => isFollowing ? handleUnfollow(like.usuario.id) : handleFollow(like.usuario.id)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isFollowing 
                              ? 'bg-gray-700 text-white hover:bg-gray-600' 
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="border-t border-gray-700 px-4 py-3 flex justify-between items-center">
            <button 
              onClick={handlePrevPage}
              disabled={pagination.page === 1 || loading}
              className={`flex items-center ${
                pagination.page === 1 || loading
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowLeft size={16} className="mr-1" />
              Anterior
            </button>
            
            <div className="text-gray-400 text-sm">
              Página {pagination.page} de {pagination.pages}
            </div>
            
            <button 
              onClick={handleNextPage}
              disabled={pagination.page === pagination.pages || loading}
              className={`flex items-center ${
                pagination.page === pagination.pages || loading
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Siguiente
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikeList;