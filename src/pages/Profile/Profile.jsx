import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Camera, Edit, Users, Image, MessageCircle, Info, UserRoundPlus, UserRoundCheck, Bookmark } from 'lucide-react';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostsList from '../../components/PostList/PostList';
import UserEdit from '../../components/UserEdit/UserEdit';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    username: "Cargando...",
    email: "Cargando...",
    avatar: "/api/placeholder/50/50",
    joinDate: "Cargando...",
    friends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las publicaciones
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [refreshPosts, setRefreshPosts] = useState(0); // Para forzar la recarga

  // Función para formatear la fecha y hora en formato "hace X tiempo"
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  };

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Primero obtenemos datos básicos del localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        // Luego hacemos una solicitud al backend para obtener datos completos
        const response = await fetch('http://localhost:3000/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener perfil');
        }
        
        const profileData = await response.json();
        
        // Formateamos la fecha de creación
        const joinDate = new Date(profileData.createdAt);
        const formattedJoinDate = joinDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long'
        });
        
        // Actualizamos el estado con los datos completos
        setUserData({
          ...profileData,
          username: profileData.username || storedUser.username,
          joinDate: formattedJoinDate,
          friends: profileData._count?.seguidores || 0,
          coverImage: "/api/placeholder/800/300", // Placeholder hasta tener imagen real
          // No procesamos profilePic aquí, se usará MediaDisplay posteriormente
          profilePic: profileData.profilePic,
          profilePicType: 'image/jpeg' // Asumimos que el avatar es JPEG
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        // Si hay error, usamos los datos básicos del localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        setUserData(prevData => ({
          ...prevData,
          username: storedUser.username || 'Usuario',
          email: 'No disponible',
        }));
        
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Cargar las publicaciones del usuario
  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);
      
      try {
        // Obtener el ID del usuario y token
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        if (!token || !storedUser.id) {
          throw new Error('No se encontró información de usuario necesaria');
        }
        
        // Obtener las publicaciones del usuario
        const response = await fetch(`http://localhost:3000/getUserPosts/${storedUser.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener publicaciones');
        }
        
        const responseData = await response.json();
        
        // Verificar si la respuesta tiene la estructura esperada
        if (responseData.data && Array.isArray(responseData.data)) {
          // Los datos ya vienen formateados desde el backend con content en base64
          // No necesitamos hacer ninguna conversión adicional
          const formattedPosts = responseData.data.map(post => {
            return {
              id: post.id,
              userId: post.userId,
              description: post.description,
              content: post.content,  // Ya es base64 desde el backend
              contentType: post.contentType,
              createdAt: post.createdAt,
              user: {
                name: post.usuario?.username || 'Usuario',
                avatar: post.usuario?.profilePic ? `data:image/jpeg;base64,${post.usuario.profilePic}` : '/api/placeholder/40/40',
                verified: false
              },
              usuario: post.usuario,
              time: formatTimestamp(post.createdAt),
              likes: post._count?.likes || 0,
              comments: post._count?.comentarios || 0,
              hasLiked: post.hasLiked || false,
              emojiData: post.emojiData,
              categoryId: post.categoryId,
              _count: post._count
            };
          });
          
          setPosts(formattedPosts);
        } else {
          throw new Error('Formato de datos inesperado');
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setPostsError(err.message || 'Error al cargar las publicaciones');
      } finally {
        setLoadingPosts(false);
      }
    };
    
    if (!loading) {
      fetchUserPosts();
    }
  }, [loading, refreshPosts]);

  const initialUserData = {
    name: userData.username,
    email: userData.email,
    profileImage: userData.avatar,
    birthDate: userData.birthDate || '1990-01-01'
  };

  // Manejar la creación de una nueva publicación
  const handlePostCreated = () => {
    // Incrementar el contador para forzar la recarga de publicaciones
    setRefreshPosts(prev => prev + 1);
  };

  // Manejar la eliminación de una publicación
  const handlePostDeleted = (postId) => {
    // Si es "refresh", simplemente recargamos todas las publicaciones
    if (postId === "refresh") {
      setRefreshPosts(prev => prev + 1);
      return;
    }
    
    // Si es un ID específico, eliminamos esa publicación del estado
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  // Renderizar el contenido según la pestaña activa
  const renderTabContent = () => {
    switch(activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            <CreatePost onPostCreated={handlePostCreated} />
            
            {loadingPosts && (
              <div className="flex justify-center items-center p-6 bg-gray-800 bg-opacity-60 rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                <span className="ml-3">Cargando publicaciones...</span>
              </div>
            )}
            
            {postsError && (
              <div className="p-4 bg-red-500 bg-opacity-60 rounded-lg text-white">
                <p>Error: {postsError}</p>
                <button 
                  className="mt-2 px-3 py-1 bg-white text-red-500 rounded-md text-sm"
                  onClick={() => setRefreshPosts(prev => prev + 1)}
                >
                  Reintentar
                </button>
              </div>
            )}
            
            {!loadingPosts && !postsError && posts.length === 0 && (
              <div className="p-6 bg-gray-800 bg-opacity-60 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-3">No has publicado nada aún</h3>
                <p className="text-gray-400">
                  Tu primera publicación aparecerá aquí. ¡Comparte algo interesante!
                </p>
              </div>
            )}
            
            {!loadingPosts && !postsError && posts.length > 0 && (
              <PostsList 
                posts={posts} 
                onPostDelete={handlePostDeleted} 
              />
            )}
          </div>
        );
      case 'info':
        return (
          <div className="p-4 bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Información</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-gray-400 text-sm">Nombre</h4>
                <p>{userData.username}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Email</h4>
                <p>{userData.email}</p>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm">Se unió</h4>
                <p>{userData.joinDate}</p>
              </div>
            </div>
          </div>
        );
      case 'friends':
        return (
          <div className="p-4 bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Seguidores ({userData.friends})</h3>
            {userData.friends > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aquí iría un map de los amigos cuando tengamos esa información */}
                <p>No hay información disponible sobre seguidores</p>
              </div>
            ) : (
              <p>Aún no tienes seguidores</p>
            )}
          </div>
        );
      case 'multimedia':
        // Filtrar solo publicaciones con imágenes o videos
        const mediaItems = posts.filter(post => post.content && post.contentType);
        
        return (
          <div className="p-4 bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Multimedia</h3>
            
            {loadingPosts && (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                <span className="ml-3">Cargando multimedia...</span>
              </div>
            )}
            
            {!loadingPosts && mediaItems.length === 0 && (
              <p className="text-center text-gray-400 py-4">
                No has compartido ninguna imagen o video aún
              </p>
            )}
            
            {!loadingPosts && mediaItems.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.map((item, index) => (
                  <div key={`media-${item.id}-${index}`} className="relative group">
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                      {item.contentType?.includes('image') ? (
                        <img 
                          src={`data:${item.contentType};base64,${item.content}`}
                          alt="Contenido del post"
                          className="h-32 w-full object-cover"
                          onError={(e) => {
                            console.error("Error al cargar imagen:", e);
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/50/50";
                          }}
                        />
                      ) : item.contentType?.includes('video') ? (
                        <video 
                          src={`data:${item.contentType};base64,${item.content}`}
                          className="h-32 w-full object-cover"
                          controls={false}
                          muted
                          loop
                          onError={(e) => {
                            console.error("Error al cargar video:", e);
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 w-full bg-gray-700">
                          <p className="text-sm text-gray-300">Formato no soportado</p>
                        </div>
                      )}
                      
                      {/* Capa de overlay para efectos visuales */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 text-white">
                          {item.contentType?.includes('image') ? (
                            <Image size={24} />
                          ) : (
                            <svg className="w-12 h-12 text-white opacity-70" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'favorites':
        // Podríamos implementar una pestaña para mostrar publicaciones guardadas o con "me gusta"
        return ( 
          <div className="p-4 bg-gray-800 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-3">Favoritos</h3>
            <p className="text-gray-400">
              Esta característica aún no está disponible. Pronto podrás ver aquí tus publicaciones favoritas.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Mostrar un indicador de carga mientras obtenemos los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
        <Header className="sticky top-0 z-10" />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="ml-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Función para renderizar el avatar del usuario
  const renderUserAvatar = () => {
    // Si tenemos profilePic almacenado como base64
    if (userData.profilePic) {
      return (
        <div className="relative">
          <img
            src={`data:image/jpeg;base64,${userData.profilePic}`}
            alt="Avatar del usuario"
            className="w-28 h-28 rounded-full border-3 border-purple-500 -mt-12 object-cover"
            onError={(e) => {
              console.error("Error al cargar avatar:", e);
              e.target.onerror = null; // Prevenir bucles infinitos
              e.target.src = "/api/placeholder/50/50";
            }}
          />
        </div>
      );
    }
    
    // Si no hay imagen, mostrar un placeholder
    return (
      <div className="relative">
        <img
          src="/api/placeholder/50/50"
          alt="Avatar del usuario"
          className="w-28 h-28 rounded-full border-3 border-purple-500 -mt-12 object-cover"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
      <Header className="sticky top-0 z-10" />

       {/* Error message if any */}
       {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-500 bg-opacity-70 text-white p-3 rounded-lg">
            {error}
          </div>
        </div>
       )}

       {/* User Edit Modal */}
       <UserEdit
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialUser={initialUserData}
      />
      
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
        {/* Sidebar izquierdo */}
        <LeftSidebar />

        {/* Contenido principal del perfil */}
        <section className="w-full md:w-2/3 md:px-4">
          {/* Portada y Foto de perfil */}
          <div className="relative bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="h-46 bg-cover bg-center" style={{ backgroundImage: `url('${userData.coverImage}')` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center p-4 relative">
              {renderUserAvatar()}
              <div className="ml-0 sm:ml-4 mt-3 sm:mt-0">
                <h2 className="text-2xl font-semibold">{userData.username}</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="-mb-8 mt-4 sm:mt-0 sm:ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white flex items-center transition-colors cursor-pointer"
              >
                <Edit size={16} className="mr-2" />
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Secciones de perfil */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'posts' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('posts')}
            >
              <MessageCircle size={16} className="mr-2" />
              Publicaciones
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'info' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('info')}
            >
              <Info size={16} className="mr-2" />
              Información
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'friends' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('friends')}
            >
              <Users size={16} className="mr-2" />
              Amigos
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'multimedia' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('multimedia')}
            >
              <Image size={16} className="mr-2" />
              Multimedia
            </button>

            <button 
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'favorites' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('favorites')}
            >
              <Bookmark size={16} className="mr-2" />
              Favoritos
            </button>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;