import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Edit, Users, MessageCircle, Info, Bookmark, Image, UserPlus, User } from 'lucide-react';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostsList from '../../components/PostList/PostList';
import UserEdit from '../../components/UserEdit/UserEdit';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import { useNavigate } from 'react-router-dom';
const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserAvatar = ({ userId, username, size = 'w-10 h-10', className = '' }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
        const isCurrentUser = userId === parseInt(currentUserId);
        
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
          setProfileImage(userData.profilePic);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return (
    <div className={`${size} rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500 overflow-hidden ${className}`}>
      {loading ? (
        <div className="animate-pulse bg-gray-600 w-full h-full rounded-full"></div>
      ) : profileImage ? (
        <img 
          src={`data:image/jpeg;base64,${profileImage}`}
          alt={username}
          className="w-full h-full object-cover rounded-full"
          onError={() => setProfileImage(null)}
        />
      ) : (
        <span className="text-white font-bold">{username?.charAt(0).toUpperCase() || 'U'}</span>
      )}
    </div>
  );
};

const AstronautCard = ({ astronaut, isProfile = false }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(astronaut.isFollowing || false);

  const getUserName = () => {
    return astronaut?.username || "Usuario";
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const url = isFollowing 
        ? `${backendURL}/unfollowUser/${astronaut.id}`
        : `${backendURL}/followUser/${astronaut.id}`;
        
      const method = isFollowing ? 'DELETE' : 'POST';
      
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
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const navigateToProfile = () => {
    navigate(`/Profile/${astronaut.id}`);
  };

  return (
    <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4 shadow-lg mb-3 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserAvatar 
            userId={astronaut.id}
            username={getUserName()}
            className="cursor-pointer"
          />
          <div>
            <h3 className="font-bold text-white">{astronaut.username || 'Astronauta Cósmico'}</h3>
            <div className="flex items-center text-sm text-gray-400">
              <span className="mr-4">
                Desde {astronaut.createdAt 
                  ? new Date(astronaut.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                  : 'marzo de 2025'}
              </span>
            </div>
            {astronaut.bio && (
              <p className="text-sm text-gray-300 mt-1">{astronaut.bio}</p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!isProfile && (
            <button
              onClick={handleFollow}
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                isFollowing 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isFollowing ? 'Dejar de seguir' : 'Seguir'}
            </button>
          )}
          
          <button
            onClick={navigateToProfile}
            className="px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center cursor-pointer" 
          >
            <User size={14} className="mr-1" />
            Ver perfil
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para la lista de usuarios
const AstronautsList = ({ astronauts, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-6 bg-gray-800 bg-opacity-60 rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3">Cargando usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500 bg-opacity-60 rounded-lg text-white">
        <p>Error: {error}</p>
        {onRetry && (
          <button 
            className="mt-2 px-3 py-1 bg-white text-red-500 rounded-md text-sm"
            onClick={onRetry}
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {astronauts.map(astronaut => (
        <AstronautCard 
          key={astronaut.id} 
          astronaut={astronaut} 
          isProfile={false}
        />
      ))}
    </div>
  );
};

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
  const [posts, setPosts] = useState([]);
  const [mediaPosts, setMediaPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [refreshPosts, setRefreshPosts] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followersError, setFollowersError] = useState(null);
  const [followingError, setFollowingError] = useState(null);
  const [refreshFollow, setRefreshFollow] = useState(0);

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

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const response = await fetch(`${backendURL}/profile`, {
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
        
        const joinDate = new Date(profileData.createdAt);
        const formattedJoinDate = joinDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long'
        });
        
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
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        if (!token || !storedUser.id) {
          throw new Error('No se encontró información de usuario necesaria');
        }
        
        const response = await fetch(`${backendURL}/getUserPosts/${storedUser.id}`, {
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
        
        const response = await fetch(`${backendURL}/getUserFollowers/${storedUser.id}`, {
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
        
        console.log('Respuesta de seguidores:', responseData);
        
        if (responseData.data && Array.isArray(responseData.data)) {
          const followerCount = responseData.pagination?.total || responseData.data.length;
          
          setUserData(prevData => ({
            ...prevData,
            followers: followerCount
          }));
          
          const formattedFollowers = responseData.data.map(follower => ({
            id: follower.seguidor.id,
            username: follower.seguidor.username,
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
    
    if (!loading && activeTab === 'followers') {
      fetchFollowers();
    }
  }, [loading, activeTab, refreshFollow]);

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
        
        const response = await fetch(`${backendURL}/getUserFollowing/${storedUser.id}`, {
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
          const followingCount = responseData.pagination?.total || responseData.data.length;
          
          setUserData(prevData => ({
            ...prevData,
            following: followingCount
          }));
          
          const formattedFollowing = responseData.data.map(follow => ({
            id: follow.seguido.id,
            username: follow.seguido.username,
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
    
    if (!loading && activeTab === 'following') {
      fetchFollowing();
    }
  }, [loading, activeTab, refreshFollow]);

  const initialUserData = {
    name: userData.username,
    email: userData.email,
    bio: userData.bio || '',
    profilePic: userData.profilePic
  };

  const handlePostCreated = () => {
    setRefreshPosts(prev => prev + 1);
  };

  const handlePostDeleted = (postId) => {
    if (postId === "refresh") {
      setRefreshPosts(prev => prev + 1);
      return;
    }
    
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setMediaPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };
  
  const handleFollowUpdate = () => {
    setRefreshFollow(prev => prev + 1);
  };

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
            
            <AstronautsList 
              astronauts={followers} 
              loading={loadingFollowers} 
              error={followersError} 
              onRetry={() => setRefreshFollow(prev => prev + 1)}
            />
            
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
            
            <AstronautsList 
              astronauts={following} 
              loading={loadingFollowing} 
              error={followingError} 
              onRetry={() => setRefreshFollow(prev => prev + 1)}
            />
            
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
                  Mostrando {mediaPosts.length} elemento{mediaPosts.length !== 1 ? 's' : ''} multimedia.

                </p>
                <MediaGallery mediaPosts={mediaPosts} />
              </div>
            )}
          </div>
        );

      // case 'favorites':
      //   return ( 
      //     <div className="p-4 bg-gray-800 rounded-lg shadow-md text-center">
      //       <h3 className="text-lg font-medium mb-3">Favoritos</h3>
      //       <p className="text-gray-400">
      //         Esta característica aún no está disponible. Pronto podrás ver aquí tus publicaciones favoritas.
      //       </p>
      //     </div>
      //   );
      default:
        return null;
    }
  };

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

      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-500 bg-opacity-70 text-white p-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <UserEdit
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialUser={initialUserData}
      />
      
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
        <LeftSidebar />

        <section className="w-full md:w-2/3 md:px-4">
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center relative">
              <div className="w-24 h-24 rounded-full bg-purple-900 flex items-center justify-center border-4 border-purple-500 mb-4 sm:mb-0 overflow-hidden">
                {userData.profilePic ? (
                  <img 
                    src={`data:image;base64,${userData.profilePic}`} 
                    alt={`${userData.username} avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error al cargar la imagen:', e);
                      console.log('URL de la imagen:', e.target.src.substring(0, 100) + '...');
                    }}
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
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
            {/* <button 
              className={`px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'favorites' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
              onClick={() => setActiveTab('favorites')}
            >
              <Bookmark size={16} className="mr-2" />
              Favoritos
            </button> */}
          </div>

          <div className="mt-6">
            {renderTabContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;