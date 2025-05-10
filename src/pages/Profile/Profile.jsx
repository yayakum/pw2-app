import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Camera, Edit, Users, Image, MessageSquare, Info, UserRoundPlus, UserRoundCheck, Bookmark } from 'lucide-react';
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
          avatar: profileData.profilePic 
            ? `data:image/jpeg;base64,${profileData.profilePic}` 
            : "/api/placeholder/50/50"
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

  const initialUserData = {
    name: userData.username,
    email: userData.email,
    profileImage: userData.avatar,
    birthDate: '1990-01-01'
  };

  const posts = [
    {
      id: 1,
      user: {
        name: userData.username,
        avatar: userData.avatar,
        verified: true
      },
      time: 'hace 2 horas',
      content: 'Acabo de descubrir esta increíble nebulosa en mi viaje espacial. ¡Las vistas son impresionantes! ¿Alguien más ha explorado esta región?',
      image: '/neji.jfif',
      likes: 245,
      comments: [],
      shares: 12
    },
    // Los otros posts...
  ];

  // Renderizar el contenido según la pestaña activa
  const renderTabContent = () => {
    switch(activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            <CreatePost/>
            <PostsList posts={posts} />
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
        return (
          <div className="p-4 bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Fotos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(id => (
                <div key={id} className="relative group">
                  <img 
                    src={`/api/placeholder/300/300?text=Foto${id}`} 
                    alt={`Foto ${id}`}
                    className="w-full h-32 object-cover rounded-lg" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 text-white">
                      <Image size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'favorites':
        return ( 
          <PostsList posts={posts} />
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
          {/* Portada y Foto de perfil */}
          <div className="relative bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="h-46 bg-cover bg-center" style={{ backgroundImage: `url('${userData.coverImage}')` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center p-4 relative">
              <div className="relative group">
                <img
                  src={userData.avatar}
                  alt="User avatar"
                  className="w-28 h-28 rounded-full border-3 border-purple-500 -mt-12 object-cover"
                />
              </div>
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
              <MessageSquare size={16} className="mr-2" />
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
              className={` px-4 py-2 rounded-lg text-white flex items-center transition-colors ${activeTab === 'friends' ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-opacity-100' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`}
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