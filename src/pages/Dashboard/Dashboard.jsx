import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostsList from '../../components/PostList/PostList';

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
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
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
            contentType: post.contentType,
            content: post.content,
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

  // Cargar publicaciones cuando el componente se monta
  useEffect(() => {
    fetchPosts();
  }, []);

  // Datos simulados para sugerencias de amigos (mantenemos esto como está)
  const friendSuggestions = [
    { id: 1, name: 'Nova Explorer', mutualFriends: 5, avatar: '/api/placeholder/50/50' },
    { id: 2, name: 'Estrella Wanderer', mutualFriends: 3, avatar: '/api/placeholder/50/50' },
    { id: 3, name: 'Cosmos Journey', mutualFriends: 8, avatar: '/api/placeholder/50/50' }
  ];

  // Función para cargar más publicaciones (paginación)
  const loadMorePosts = (page) => {
    // Implementación para cargar más publicaciones
    // Actualizar el estado de pagination.page y llamar a fetchPosts
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
                onClick={() => window.location.reload()}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
          
          {/* Mostrar mensaje cuando no hay publicaciones */}
          {!loading && !error && posts.length === 0 && (
            <div className="p-8 rounded-lg bg-gray-800 bg-opacity-60 shadow-md mb-6 text-center">
              <h3 className="text-xl font-medium mb-4">No hay publicaciones para mostrar</h3>
              <p className="text-gray-400">
                Sigue a más usuarios para ver sus publicaciones en tu feed o crea tu primera publicación.
              </p>
            </div>
          )}
          
          {/* Componente de lista de publicaciones */}
          {!loading && !error && posts.length > 0 && <PostsList posts={posts} onPostDelete={(postId) => {
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
          }} />}
          
          {/* Paginación */}
          {!loading && !error && pagination.pages > 1 && (
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
            <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md mb-6">
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
            </div>
            
            <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
              <h3 className="font-medium text-lg mb-4">Exploradores Sugeridos</h3>
              <div className="space-y-4">
                {friendSuggestions.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={friend.avatar}
                        alt={`${friend.name}'s avatar`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-sm">{friend.name}</h4>
                        <p className="text-xs text-gray-400">{friend.mutualFriends} amigos en común</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-xs rounded-full bg-purple-600 hover:bg-purple-700 text-white">
                      Agregar
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