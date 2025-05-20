import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Users, MessageCircle, Info, Bookmark, Image, UserPlus } from 'lucide-react';
import PostsList from '../../components/PostList/PostList';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import AstronautsList from '../../components/AstronautsList/AstronautsList';

const ProfileUserFind = () => {
  const { userId } = useParams(); // Obtener el ID del usuario de la URL
  const [activeTab, setActiveTab] = useState('posts');
  const [userData, setUserData] = useState({
    username: "Cargando...",
    bio: "",
    joinDate: "Cargando...",
    isFollowing: false,
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

  // Función para manejar el seguimiento del usuario
  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Determinar la URL y método correctos según el estado actual
      const url = userData.isFollowing 
        ? `http://localhost:3000/unfollowUser/${userId}`
        : `http://localhost:3000/followUser/${userId}`;
        
      const method = userData.isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al seguir/dejar de seguir al usuario');
      }
      
      // Actualizar estado local
      setUserData(prevData => ({
        ...prevData,
        isFollowing: !prevData.isFollowing,
        followers: prevData.isFollowing 
          ? prevData.followers - 1 
          : prevData.followers + 1
      }));

      // Forzar recarga de seguidores/seguidos
      setRefreshFollow(prev => prev + 1);
    } catch (err) {
      console.error('Error toggling follow:', err);
      setError(err.message);
    }
  };

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        // Hacer una solicitud al backend para obtener los datos del perfil de otro usuario
        const response = await fetch(`http://localhost:3000/Profile/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener perfil del usuario');
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
          username: profileData.username || 'Usuario',
          joinDate: formattedJoinDate,
          isFollowing: profileData.isFollowing || false,
          followers: profileData._count?.seguidores || 0,
          following: profileData._count?.siguiendo || 0
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Cargar las publicaciones del usuario
  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !userId) {
          throw new Error('No se encontró información de usuario necesaria');
        }
        
        // Obtener las publicaciones del usuario
        const response = await fetch(`http://localhost:3000/getUserPosts/${userId}`, {
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
    
    if (!loading && userId) {
      fetchUserPosts();
    }
  }, [loading, refreshPosts, userId]);

  // Cargar seguidores
  useEffect(() => {
    const fetchFollowers = async () => {
      setLoadingFollowers(true);
      setFollowersError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !userId) {
          throw new Error('No se encontró información de usuario necesaria');
        }
        
        const response = await fetch(`http://localhost:3000/getUserFollowers/${userId}`, {
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
    
    if (!loading && activeTab === 'followers') {
      fetchFollowers();
    }
  }, [loading, activeTab, refreshFollow, userId]);

  // Cargar seguidos
  useEffect(() => {
    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      setFollowingError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !userId) {
          throw new Error('No se encontró información de usuario necesaria');
        }
        
        const response = await fetch(`http://localhost:3000/getUserFollowing/${userId}`, {
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
    
    if (!loading && activeTab === 'following') {
      fetchFollowing();
    }
  }, [loading, activeTab, refreshFollow, userId]);

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
                <h3 className="text-xl font-medium mb-3">No hay publicaciones disponibles</h3>
                <p className="text-gray-400">
                  Este usuario aún no ha realizado ninguna publicación.
                </p>
              </div>
            )}
            
            {!loadingPosts && !postsError && posts.length > 0 && (
              <PostsList 
                posts={posts} 
                viewOnly={true} // Modo solo lectura para el perfil de otro usuario
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
              {userData.bio && (
                <div>
                  <h4 className="text-gray-400 text-sm">Bio</h4>
                  <p>{userData.bio}</p>
                </div>
              )}
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
            <AstronautsList 
              astronauts={followers} 
              loading={loadingFollowers} 
              error={followersError} 
              onRetry={() => setRefreshFollow(prev => prev + 1)}
              onFollowUpdate={handleFollowUpdate}
            />
            
            {!loadingFollowers && !followersError && followers.length === 0 && (
              <div className="p-6 bg-gray-800 bg-opacity-60 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-3">Este usuario aún no tiene seguidores</h3>
                <p className="text-gray-400">
                  Cuando alguien lo siga, aparecerá en esta lista.
                </p>
              </div>
            )}
          </div>
        );
        
      case 'following':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Seguidos ({userData.following})</h3>
            <AstronautsList 
              astronauts={following} 
              loading={loadingFollowing} 
              error={followingError} 
              onRetry={() => setRefreshFollow(prev => prev + 1)}
              onFollowUpdate={handleFollowUpdate}
            />
            
            {!loadingFollowing && !followingError && following.length === 0 && (
              <div className="p-6 bg-gray-800 bg-opacity-60 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-3">Este usuario no sigue a nadie todavía</h3>
                <p className="text-gray-400">
                  Los usuarios que siga aparecerán en esta lista.
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
                    ? "Este usuario aún no tiene contenido multimedia." 
                    : `Mostrando ${mediaPosts.length} elemento${mediaPosts.length !== 1 ? 's' : ''} multimedia.`
                  }
                </p>
                
                <MediaGallery mediaPosts={mediaPosts} />
              </div>
            )}
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
      
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
        {/* Sidebar izquierdo */}
        <LeftSidebar />

        {/* Contenido principal del perfil */}
        <section className="w-full md:w-2/3 md:px-4">
          {/* Cabecera de perfil simplificada */}
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center relative">
              {/* Avatar como elemento de texto o imagen si hay profilePic */}
              {userData.profilePic ? (
                <img 
                  src={`data:image/jpeg;base64,${userData.profilePic}`} 
                  alt={userData.username} 
                  className="w-24 h-24 rounded-full border-4 border-purple-500 mb-4 sm:mb-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-purple-900 flex items-center justify-center border-4 border-purple-500 mb-4 sm:mb-0">
                  <span className="text-white text-4xl font-bold">
                    {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              
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
                onClick={handleFollowToggle}
                className={`mt-4 sm:mt-0 sm:ml-auto px-4 py-2 rounded-md text-white flex items-center transition-colors cursor-pointer ${
                  userData.isFollowing 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {userData.isFollowing ? 'Dejar de seguir' : 'Seguir'}
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

export default ProfileUserFind;