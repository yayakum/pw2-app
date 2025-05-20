import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostsList from '../../components/PostList/PostList';
import { Users } from 'lucide-react';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [isFollowingSomeone, setIsFollowingSomeone] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

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

  // Función para cargar las publicaciones
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      
      if (!token || !userId) {
        throw new Error('No hay token de autenticación o información de usuario');
      }
      
      // Primero, verificamos si el usuario sigue a alguien
      const followingResponse = await fetch(`http://localhost:3000/getUserFollowing/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!followingResponse.ok) {
        throw new Error('Error al verificar usuarios seguidos');
      }
      
      const followingData = await followingResponse.json();
      const hasFollowing = followingData.data && followingData.data.length > 0;
      
      setIsFollowingSomeone(hasFollowing);
      
      // Si no sigue a nadie, obtenemos sugerencias de usuarios para mostrar
      if (!hasFollowing) {
        await fetchSuggestedUsers();
        setPosts([]);
        setLoading(false);
        return;
      }
      
      // Si sigue a alguien, obtener las publicaciones de los usuarios seguidos
      const response = await fetch('http://localhost:3000/getFeedPosts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener las publicaciones');
      }
      
      const responseData = await response.json();
      
      // Acceder al array de posts en data.data y configurar la paginación
      if (responseData.data && Array.isArray(responseData.data)) {
        // Transforma los datos para que coincidan con la estructura esperada por el componente Post
        const formattedPosts = responseData.data.map(post => {
          return {
            id: post.id,
            userId: post.userId,
            description: post.description,
            // Asegurarnos de incluir content y contentType para mostrar imágenes y videos
            content: post.content,
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
        
        // Configurar la paginación si está disponible
        if (responseData.pagination) {
          setPagination(responseData.pagination);
        }
      } else {
        throw new Error('Formato de datos inesperado');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Error al cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener sugerencias de usuarios
  const fetchSuggestedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Puedes implementar un endpoint específico para sugerencias, o usar la búsqueda
      const response = await fetch('http://localhost:3000/search?q=', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios sugeridos');
      }
      
      const data = await response.json();
      
      // Limitar a 5 usuarios sugeridos
      setSuggestedUsers(data.usuarios?.slice(0, 5) || []);
      
    } catch (err) {
      console.error('Error fetching suggested users:', err);
      setSuggestedUsers([]);
    }
  };

  // Función para seguir a un usuario
  const handleFollowUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`http://localhost:3000/followUser/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al seguir al usuario');
      }
      
      // Actualizar la lista de usuarios sugeridos
      setSuggestedUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: true } 
            : user
        )
      );
      
      // Recargar el feed después de seguir a alguien
      fetchPosts();
      
    } catch (err) {
      console.error('Error following user:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Cargar publicaciones cuando el componente se monta
  useEffect(() => {
    fetchPosts();
  }, []);

  // Función para cargar más publicaciones (paginación)
  const loadMorePosts = async (page) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      setLoading(true);
      
      const response = await fetch(`http://localhost:3000/getFeedPosts?page=${page}&limit=${pagination.limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener las publicaciones');
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
        
        // Actualizar la paginación
        if (responseData.pagination) {
          setPagination(responseData.pagination);
        }
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar sugerencias de usuarios aleatorias cuando no hay seguidos
  const renderSuggestedUsers = () => {
    if (!isFollowingSomeone && suggestedUsers.length > 0) {
      return (
        <div className="p-6 bg-gray-800 bg-opacity-60 rounded-lg shadow-md mb-6">
          <h3 className="font-medium text-lg mb-4 flex items-center">
            <Users className="mr-2" size={20} />
            Usuarios Sugeridos para Seguir
          </h3>
          
          <div className="space-y-4">
            {suggestedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center">
                  {user.profilePic ? (
                    <img 
                      src={`data:image/jpeg;base64,${user.profilePic}`} 
                      alt={user.username} 
                      className="w-10 h-10 rounded-full border border-purple-500 mr-3" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center border border-purple-500 mr-3">
                      <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.bio || 'Sin biografía'}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleFollowUser(user.id)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-full text-white text-sm"
                >
                  Seguir
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
      <Header/>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
        {/* Sidebar izquierdo */}
        <LeftSidebar />
        
        {/* Feed central */}
        <section className="w-full md:w-2/4 md:px-4">
          {/* Componente para crear publicación */}
          <CreatePost onPostCreated={fetchPosts} />
          
          {/* Estado de carga y error */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500 bg-opacity-60 p-4 rounded-lg mb-6">
              <p className="text-white">{error}</p>
              <button 
                className="mt-2 px-4 py-2 bg-white text-red-500 rounded-md hover:bg-gray-100"
                onClick={() => fetchPosts()}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
          
          {/* Mostrar sugerencias de usuarios cuando no sigue a nadie */}
          {!loading && !error && !isFollowingSomeone && renderSuggestedUsers()}
          
          {/* Mostrar mensaje cuando no hay publicaciones */}
          {!loading && !error && isFollowingSomeone && posts.length === 0 && (
            <div className="p-8 rounded-lg bg-gray-800 bg-opacity-60 shadow-md mb-6 text-center">
              <h3 className="text-xl font-medium mb-4">No hay publicaciones para mostrar</h3>
              <p className="text-gray-400">
                Aún no hay publicaciones de los usuarios que sigues. Regresa más tarde o sigue a más usuarios para ver su contenido.
              </p>
            </div>
          )}
          
          {/* Mostrar mensaje cuando no sigue a nadie */}
          {!loading && !error && !isFollowingSomeone && (
            <div className="p-8 rounded-lg bg-gray-800 bg-opacity-60 shadow-md mb-6 text-center">
              <h3 className="text-xl font-medium mb-4">¡Bienvenido a tu feed!</h3>
              
              <div className="text-gray-400 space-y-4">
                <p>
                  No estás siguiendo a ningún usuario todavía, por lo que tu feed está vacío.
                </p>
                
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Sugerencias:</h4>
                  <ul className="list-disc list-inside space-y-2 text-left">
                    <li>Sigue a los usuarios sugeridos arriba para empezar a ver su contenido</li>
                    <li>Busca y explora otros perfiles que puedan interesarte</li>
                    <li>Crea tu primera publicación usando el formulario de arriba</li>
                    <li>Completa tu perfil para atraer seguidores</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Componente de lista de publicaciones */}
          {!loading && !error && posts.length > 0 && <PostsList posts={posts} onPostDelete={(postId) => {
            if (postId === "refresh") {
              fetchPosts();
            } else {
              setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            }
          }} />}
          
          {/* Paginación */}
          {!loading && !error && posts.length > 0 && pagination.pages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button 
                onClick={() => {
                  if (pagination.page > 1) {
                    const newPage = pagination.page - 1;
                    loadMorePosts(newPage);
                  }
                }}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-lg ${
                  pagination.page === 1 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Anterior
              </button>
              <span className="px-4 py-2 bg-gray-700 rounded-lg">
                Página {pagination.page} de {pagination.pages}
              </span>
              <button 
                onClick={() => {
                  if (pagination.page < pagination.pages) {
                    const newPage = pagination.page + 1;
                    loadMorePosts(newPage);
                  }
                }}
                disabled={pagination.page === pagination.pages}
                className={`px-4 py-2 rounded-lg ${
                  pagination.page === pagination.pages 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
        
        {/* Sidebar derecho */}
        <aside className="w-full md:w-1/4 md:pl-4 hidden md:block">
          <div className="sticky top-24">
            {/* <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md mb-6">
              <h3 className="font-medium text-lg mb-4">Eventos Cósmicos</h3>
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition cursor-pointer">
                  <h4 className="font-medium">Lluvia de meteoros Perseus</h4>
                  <p className="text-sm text-gray-300 mt-1">Este fin de semana - No te lo pierdas</p>
                </div>
                <div className="p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition cursor-pointer">
                  <h4 className="font-medium">Encuentro espacial virtual</h4>
                  <p className="text-sm text-gray-300 mt-1">Mañana a las 19:00 - 532 asistentes</p>
                </div>
              </div>
            </div> */}
            
            <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
              <h3 className="font-medium text-lg mb-4">Exploradores Sugeridos</h3>
              <div className="space-y-4">
                {suggestedUsers.slice(0, 3).map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {user.profilePic ? (
                        <img
                          src={`data:image/jpeg;base64,${user.profilePic}`}
                          alt={`${user.username}'s avatar`}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center border border-purple-500">
                          <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{user.username}</h4>
                        <p className="text-xs text-gray-400">{user.bio || 'Sin biografía'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollowUser(user.id)}
                      className="px-3 py-1 text-xs rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Seguir
                    </button>
                  </div>
                ))}
                <button className="w-full mt-2 text-sm text-purple-400 hover:text-purple-300">
                  Ver más
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;