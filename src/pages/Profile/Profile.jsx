import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Edit, Users, MessageCircle, Info, Bookmark, Image, UserPlus } from 'lucide-react';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostsList from '../../components/PostList/PostList';
import UserEdit from '../../components/UserEdit/UserEdit';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import AstronautsList from '../../components/AstronautsList/AstronautsList';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    username: "Cargando...",
    email: "Cargando...",
    joinDate: "Cargando...",
    followers: 0,
    following: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las publicaciones
  const [posts, setPosts] = useState([]);
  const [mediaPosts, setMediaPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [refreshPosts, setRefreshPosts] = useState(0); // Para forzar la recarga

  // Estados para seguidores y seguidos
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followersError, setFollowersError] = useState(null);
  const [followingError, setFollowingError] = useState(null);
  const [refreshFollow, setRefreshFollow] = useState(0); // Para forzar la recarga

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
          followers: profileData._count?.seguidores || 0,
          following: profileData._count?.siguiendo || 0
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
          const formattedPosts = responseData.data.map(post => {
            return {
              id: post.id,
              userId: post.userId,
              description: post.description,
              content: post.content,
              contentType: post.contentType,
              createdAt: post.createdAt,
              user: {
                name: post.usuario?.username || 'Usuario',
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
          
          // Filtramos las publicaciones que contienen contenido multimedia
          const mediaContent = formattedPosts.filter(post => 
            post.content && post.contentType && 
            (post.contentType.startsWith('image/') || post.contentType.startsWith('video/'))
          );
          
          setMediaPosts(mediaContent);
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

  // Cargar seguidores
  useEffect(() => {
    const fetchFollowers = async () => {
    
    setLoadingFollowers(true);
    setFollowersError(null);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!token || !storedUser.id) {
        throw new Error('No se encontró información de usuario necesaria');
      }
      
      const response = await fetch(`http://localhost:3000/getUserFollowers/${storedUser.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener seguidores');
      }
      
      const responseData = await response.json();
      
      // Depurar la respuesta para ver qué estamos recibiendo
      console.log('Respuesta de seguidores:', responseData);
      
      if (responseData.data && Array.isArray(responseData.data)) {
        // Actualizar el contador de seguidores para mantener la consistencia
        const followerCount = responseData.pagination?.total || responseData.data.length;
        
        // Actualizar el valor de userData para reflejar el conteo real
        setUserData(prevData => ({
          ...prevData,
          followers: followerCount
        }));
        
        // Formatear los datos para el componente AstronautsList
        const formattedFollowers = responseData.data.map(follower => ({
          id: follower.seguidor.id,
          username: follower.seguidor.username,
          profilePic: follower.seguidor.profilePic,
          bio: follower.seguidor.bio,
          isFollowing: follower.seguidor.isFollowing,
          createdAt: follower.createdAt
        }));
        
        setFollowers(formattedFollowers);
        console.log('Seguidores formateados:', formattedFollowers);
      } else {
        throw new Error('Formato de datos inesperado');
      }
    } catch (err) {
      console.error('Error fetching followers:', err);
      setFollowersError(err.message || 'Error al cargar seguidores');
    } finally {
      setLoadingFollowers(false);
    }
  };
  
  if (!loading) {
    fetchFollowers();
  }
}, [loading, activeTab, refreshFollow]);

  // Cargar seguidos
  useEffect(() => {
  const fetchFollowing = async () => {
    
    setLoadingFollowing(true);
    setFollowingError(null);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!token || !storedUser.id) {
        throw new Error('No se encontró información de usuario necesaria');
      }
      
      const response = await fetch(`http://localhost:3000/getUserFollowing/${storedUser.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios seguidos');
      }
      
      const responseData = await response.json();
      console.log('Respuesta de seguidos:', responseData);
      
      if (responseData.data && Array.isArray(responseData.data)) {
        // Actualizar el contador de seguidos para mantener la consistencia
        const followingCount = responseData.pagination?.total || responseData.data.length;
        
        // Actualizar el valor de userData para reflejar el conteo real
        setUserData(prevData => ({
          ...prevData,
          following: followingCount
        }));
        
        // Formatear los datos para el componente AstronautsList
        const formattedFollowing = responseData.data.map(follow => ({
          id: follow.seguido.id,
          username: follow.seguido.username,
          profilePic: follow.seguido.profilePic,
          bio: follow.seguido.bio,
          isFollowing: follow.seguido.isFollowing || true,
          createdAt: follow.createdAt
        }));
        
        setFollowing(formattedFollowing);
        console.log('Seguidos formateados:', formattedFollowing);
      } else {
        throw new Error('Formato de datos inesperado');
      }
    } catch (err) {
      console.error('Error fetching following:', err);
      setFollowingError(err.message || 'Error al cargar usuarios seguidos');
    } finally {
      setLoadingFollowing(false);
    }
  };
  
  if (!loading) {
    fetchFollowing();
  }
}, [loading, activeTab, refreshFollow]);

  const initialUserData = {
  name: userData.username,
  email: userData.email,
  bio: userData.bio || '',
  profilePic: userData.profilePic
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
    setMediaPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };
  
  // Manejar actualización de seguidores/seguidos
  const handleFollowUpdate = () => {
    setRefreshFollow(prev => prev + 1);
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
                <h4 className="text-gray-400 text-sm">Biografía</h4>
                <p>{userData.bio}</p>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm">Se unió</h4>
                <p>{userData.joinDate}</p>
              </div>
            </div>
          </div>
        );
        
      case 'followers':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Seguidores ({userData.followers})</h3>
            {followers.length != 0 && (
            <AstronautsList 
              astronauts={followers} 
              loading={loadingFollowers} 
              error={followersError} 
              onRetry={() => setRefreshFollow(prev => prev + 1)}
            />
            )}
            
            {!loadingFollowers && !followersError && followers.length === 0 && (
              <div className="p-6 bg-gray-800 bg-opacity-60 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-3">Aún no tienes seguidores</h3>
                <p className="text-gray-400">
                  Cuando alguien te siga, aparecerá en esta lista.
                </p>
              </div>
            )}
          </div>
        );
        
      case 'following':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Seguidos ({userData.following})</h3>
            {following.length != 0 && (
            <AstronautsList 
              astronauts={following} 
              loading={loadingFollowing} 
              error={followingError} 
              onRetry={() => setRefreshFollow(prev => prev + 1)}
            />
            )}
            
            {!loadingFollowing && !followingError && following.length === 0 && (
              <div className="p-6 bg-gray-800 bg-opacity-60 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-3">No sigues a nadie todavía</h3>
                <p className="text-gray-400">
                  Los usuarios que sigas aparecerán en esta lista.
                </p>
              </div>
            )}
          </div>
        );

      case 'multimedia':
        return (
          <div className="space-y-4">
            {loadingPosts && (
              <div className="flex justify-center items-center p-6 bg-gray-800 bg-opacity-60 rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                <span className="ml-3">Cargando multimedia...</span>
              </div>
            )}
            
            {!loadingPosts && !postsError && (
              <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
                <h3 className="text-lg font-medium mb-2">Galería Multimedia</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {mediaPosts.length === 0 
                    ? "Aún no tienes contenido multimedia. Cuando subas fotos o videos aparecerán aquí." 
                    : `Mostrando ${mediaPosts.length} elemento${mediaPosts.length !== 1 ? 's' : ''} multimedia.`
                  }
                </p>
                
                {/* Usando el componente MediaGallery */}
                <MediaGallery mediaPosts={mediaPosts} />
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
          {/* Cabecera de perfil simplificada */}
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center relative">
              {/* Avatar como elemento de texto */}
              <div className="w-24 h-24 rounded-full bg-purple-900 flex items-center justify-center border-4 border-purple-500 mb-4 sm:mb-0">
                <span className="text-white text-4xl font-bold">
                  {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              
              <div className="ml-0 sm:ml-6">
                <h2 className="text-2xl font-semibold">{userData.username}</h2>
                <p className="text-gray-400">Miembro desde {userData.joinDate}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <MessageCircle size={16} className="mr-1" />
                    <span>{posts.length} publicaciones</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Users size={16} className="mr-1" />
                    <span>{userData.followers} seguidores</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <UserPlus size={16} className="mr-1" />
                    <span>{userData.following} seguidos</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Image size={16} className="mr-1" />
                    <span>{mediaPosts.length} multimedia</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 sm:mt-0 sm:ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white flex items-center transition-colors cursor-pointer"
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
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'followers' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('followers')}
            >
              <Users size={16} className="mr-2" />
              Seguidores
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'following' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('following')}
            >
              <UserPlus size={16} className="mr-2" />
              Seguidos
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