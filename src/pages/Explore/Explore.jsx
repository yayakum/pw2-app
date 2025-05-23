import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Users, Image } from 'lucide-react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import PostsList from '../../components/PostList/PostList';
import AstronautsList from '../../components/AstronautsList/AstronautsList';
const backendURL = import.meta.env.VITE_BACKEND_URL;

const Explore = () => {
  // Estado para manejar la pestaña activa
  const [activeTab, setActiveTab] = useState('publicaciones');
  
  // Estado para los filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [recentOnly, setRecentOnly] = useState(false);
  
  // Estado para publicaciones y astronautas
  const [posts, setPosts] = useState([]);
  const [astronauts, setAstronauts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para categorías
  const [categories, setCategories] = useState([]);
  
  // Función para obtener categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backendURL}/getAllCategories`);
      
      if (!response.ok) {
        throw new Error('Error al obtener las categorías');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // No establecemos error global para no afectar la interfaz principal
    }
  };
  
  // Función para obtener publicaciones
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      let url = `${backendURL}/getExplorePosts`;
      
      // Añadir parámetros de filtro si es necesario
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (recentOnly) {
        // Calcular timestamp de 5 horas atrás
        const fiveHoursAgo = new Date();
        fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);
        params.append('since', fiveHoursAgo.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener las publicaciones');
      }
      
      const responseData = await response.json();
      
      if (responseData.data && Array.isArray(responseData.data)) {
        // Formateamos los datos para el componente PostsList
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
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Error al cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para obtener astronautas
const fetchAstronauts = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    // Construir URL con parámetro de búsqueda si existe
    let url = `${backendURL}/getAllUsersExceptCurrent`;
    
    if (searchQuery.trim()) {
      url += `?search=${encodeURIComponent(searchQuery.trim())}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener astronautas');
    }
    
    // La respuesta ya viene formateada del backend, no está dentro de un campo data
    const astronautsData = await response.json();
    
    if (Array.isArray(astronautsData)) {
      setAstronauts(astronautsData);
    } else {
      setAstronauts([]);
    }
  } catch (err) {
    console.error('Error fetching astronauts:', err);
    setError(err.message || 'Error al cargar astronautas');
  } finally {
    setLoading(false);
  }
};
  
  // Función para formatear la fecha
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
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Efecto para aplicar filtros con debounce para la búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (activeTab === 'publicaciones') {
        fetchPosts();
      } else {
        fetchAstronauts();
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(delayDebounce);
  }, [activeTab, searchQuery, selectedCategory, recentOnly]);
  
  // Manejar cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset filters when changing tabs
    setSearchQuery('');
    setSelectedCategory('');
    setRecentOnly(false);
  };
  
  // Manejar cambio de búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Manejar cambio de categoría
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  // Alternar filtro de recientes
  const toggleRecentFilter = () => {
    setRecentOnly(!recentOnly);
  };
  
  // Manejar refresco de datos (por ejemplo, después de eliminación)
  const handlePostDelete = (postId) => {
    if (postId === "refresh") {
      fetchPosts();
    } else {
      // Eliminar post del estado local
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
        <LeftSidebar />
        
        <section className="w-full md:w-3/4 md:px-4">
          {/* Contenedor de Explorar con posición fija */}
          <div className="sticky top-0 z-10 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-6 text-purple-300">Explorar</h2>
            
            {/* Tabs de navegación */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'publicaciones'
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => handleTabChange('publicaciones')}
              >
                <div className="flex items-center">
                  <Image size={18} className="mr-2" />
                  Publicaciones
                </div>
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'astronautas'
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => handleTabChange('astronautas')}
              >
                <div className="flex items-center">
                  <Users size={18} className="mr-2" />
                  Astronautas
                </div>
              </button>
            </div>
            
            {/* Filtros para publicaciones */}
            {activeTab === 'publicaciones' && (
              <div className="mb-6 space-y-4 ">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  {/* Buscador */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 bg-opacity-50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Buscar publicaciones..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  
                  {/* Selector de categoría */}
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter size={18} className="text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 bg-opacity-50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Botón de recientes */}
                  <button
                    className={`flex items-center px-4 py-2 rounded-md border ${
                      recentOnly
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-gray-700 bg-opacity-50 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={toggleRecentFilter}
                  >
                    <Clock size={18} className="mr-2" />
                    Últimas 5 horas
                  </button>
                </div>
              </div>
            )}
            
            {/* Buscador para astronautas */}
            {activeTab === 'astronautas' && (
              <div className="mb-6">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 bg-opacity-50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Buscar astronautas..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Contenido según la pestaña activa */}
          {activeTab === 'publicaciones' ? (
            <div className="mb-6">
              {/* Estado de carga y error */}
              {loading && (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              )}
              
              {error && !loading && (
                <div className="bg-red-500 bg-opacity-60 p-4 rounded-lg mb-6">
                  <p className="text-white">{error}</p>
                  <button 
                    className="mt-2 px-4 py-2 bg-white text-red-500 rounded-md hover:bg-gray-100"
                    onClick={() => activeTab === 'publicaciones' ? fetchPosts() : fetchAstronauts()}
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
              
              {/* Sin resultados */}
              {!loading && !error && posts.length === 0 && (
                <div className="p-8 rounded-lg bg-gray-700 bg-opacity-60 text-center">
                  <h3 className="text-xl font-medium mb-4">No se encontraron publicaciones</h3>
                  <p className="text-gray-400">
                    Intenta ajustar los filtros o busca algo diferente.
                  </p>
                </div>
              )}
              
              {/* Lista de publicaciones */}
              {!loading && !error && posts.length > 0 && (
                <PostsList posts={posts} onPostDelete={handlePostDelete} />
              )}
            </div>
          ) : (
            // Usar el nuevo componente AstronautsList
            <AstronautsList 
              astronauts={astronauts}
              loading={loading}
              error={error}
              onRetry={fetchAstronauts}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default Explore;