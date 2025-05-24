import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Edit, Users, MessageCircle, Info, Bookmark, Image, UserPlus, User, ArrowLeft } from 'lucide-react';
import PostsList from '../../components/PostList/PostList';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import { useNavigate, useParams } from 'react-router-dom';
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
  
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const isCurrentUser = astronaut.id === parseInt(currentUserId);

  const getUserName = () => {
    const username = astronaut?.username || "Usuario";
    return isCurrentUser ? `${username} (Tú)` : username;
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    
    if (isCurrentUser) return;
    
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
    if (isCurrentUser) {
      navigate('/Profile');
    } else {
      navigate(`/Profile/${astronaut.id}`);
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4 shadow-lg mb-3 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserAvatar 
            userId={astronaut.id}
            username={astronaut?.username || "Usuario"}
            className="cursor-pointer"
          />
          
          <div>
            <h3 className="font-bold text-white">{getUserName()}</h3>
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
          {!isProfile && !isCurrentUser && (
            <button
              onClick={handleFollow}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
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

const ProfileUserFind = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [userData, setUserData] = useState({
    username: "Cargando...",
    email: "Cargando...",
    joinDate: "Cargando...",
    followers: 0,
    following: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

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

  const handleFollowUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const url = isFollowing 
        ? `${backendURL}/unfollowUser/${userId}`
        : `${backendURL}/followUser/${userId}`;
        
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

      setUserData(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }));
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        if (!userId) {
          throw new Error('ID de usuario no proporcionado');
        }
        
        const response = await fetch(`${backendURL}/profile/${userId}`, {
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
        
        const joinDate = new Date(profileData.createdAt);
        const formattedJoinDate = joinDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long'
        });
        
        setUserData({
          ...profileData,
          joinDate: formattedJoinDate,
          followers: profileData._count?.seguidores || 0,
          following: profileData._count?.siguiendo || 0
        });
        
        setIsFollowing(profileData.isFollowing || false);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !userId) {
          throw new Error('No se encontró información necesaria');
        }
        
        const response = await fetch(`${backendURL}/getUserPosts/${userId}`, {
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
    
    if (!loading && userId) {
      fetchUserPosts();
    }
  }, [loading, userId, refreshPosts]);

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoadingFollowers(true);
      setFollowersError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !userId) {
          throw new Error('No se encontró información necesaria');
        }
        
        const response = await fetch(`${backendURL}/getUserFollowers/${userId}`, {
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
          const formattedFollowers = responseData.data.map(follower => ({
            id: follower.seguidor.id,
            username: follower.seguidor.username,
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
    
    if (!loading && activeTab === 'followers' && userId) {
      fetchFollowers();
    }
  }, [loading, activeTab, userId, refreshFollow]);

  useEffect(() => {
    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      setFollowingError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !userId) {
          throw new Error('No se encontró información necesaria');
        }
        
        const response = await fetch(`${backendURL}/getUserFollowing/${userId}`, {
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
          const formattedFollowing = responseData.data.map(follow => ({
            id: follow.seguido.id,
            username: follow.seguido.username,
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
    
    if (!loading && activeTab === 'following' && userId) {
      fetchFollowing();
    }
  }, [loading, activeTab, userId, refreshFollow]);

  const handleFollowUpdate = () => {
    setRefreshFollow(prev => prev + 1);
  };

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
                <h3 className="text-xl font-medium mb-3">Este usuario no ha publicado nada aún</h3>
                <p className="text-gray-400">
                  Las publicaciones aparecerán aquí cuando el usuario comparta contenido.
                </p>
              </div>
            )}
            
            {!loadingPosts && !postsError && posts.length > 0 && (
              <PostsList 
                posts={posts} 
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
                <h4 className="text-gray-400 text-sm">Biografía</h4>
                <p>{userData.bio || ''}</p>
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
                <h3 className="text-xl font-medium mb-3">Este usuario no tiene seguidores aún</h3>
                <p className="text-gray-400">
                  Los seguidores aparecerán en esta lista.
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
                <h3 className="text-xl font-medium mb-3">Este usuario no sigue a nadie todavía</h3>
                <p className="text-gray-400">
                  Los usuarios seguidos aparecerán en esta lista.
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
                    ? "Este usuario no tiene contenido multimedia. Las fotos y videos aparecerán aquí." 
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
        <Header className="sticky top-0 z-10" />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-500 bg-opacity-70 text-white p-6 rounded-lg text-center ">
            <h2 className="text-xl font-bold mb-2">Error al cargar el perfil</h2>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-white text-red-500 px-4 py-2 rounded-md font-medium cursor-pointer"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
      <Header className="sticky top-0 z-10" />
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
        <LeftSidebar />
        <section className="w-full md:w-2/3 md:px-4">
          <div className="mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </button>
          </div>

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
                {userData.bio && (
                  <p className="text-gray-300 mt-2">{userData.bio}</p>
                )}
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
                onClick={handleFollowUser}
                className={`mt-4 sm:mt-0 sm:ml-auto px-4 py-2 rounded-md text-white flex items-center transition-colors cursor-pointer ${
                  isFollowing 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                <UserPlus size={16} className="mr-2" />
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
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
          </div>
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfileUserFind;