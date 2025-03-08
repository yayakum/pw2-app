import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Camera, Edit, Users, Image, MessageSquare, Info, UserRoundPlus,UserRoundCheck,Bookmark  } from 'lucide-react';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostsList from '../../components/PostList/PostList';
import UserEdit from '../../components/UserEdit/UserEdit';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialUserData = {
    name: 'Explorador Cósmico',
    email: 'cosmonaut@galaxia.com',
    profileImage: null,
    birthDate: '1990-01-01'
  };
  // Datos de ejemplo (en una aplicación real vendrían de una API o Redux)
  const userData = {
    name: "Nombre del Usuario",
    bio: "Explorador cósmico",
    coverImage: "/api/placeholder/800/300",
    avatar: "../assets/images/avatar.jpg",
    
    friends: [
      { id: 1, name: "Ana García", avatar: "/api/placeholder/50/50" },
      { id: 2, name: "Carlos López", avatar: "/api/placeholder/50/50" },
      { id: 3, name: "Elena Martínez", avatar: "/api/placeholder/50/50" }
    ]
  };
  const posts = [
    {
      id: 1,
      user: {
        name: 'Astro Explorer',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      time: 'hace 2 horas',
      content: 'Acabo de descubrir esta increíble nebulosa en mi viaje espacial. ¡Las vistas son impresionantes! ¿Alguien más ha explorado esta región?',
      image: '/neji.jfif',
      likes: 245,
      comments: [
        
      ],
      shares: 12
    },
    {
      id: 2, 
      user: {
        name: 'Galáctica Viajera',
        avatar: '/api/placeholder/40/40',
        verified: false
      },
      time: 'hace 5 horas',
      content: 'Hoy es mi primer día usando CosmicPortal y debo decir que la comunidad es increíble. Espero conectar con más exploradores espaciales como ustedes.',
      likes: 87,
      comments: 14,
      shares: 3
    },
    {
      id: 3,
      user: {
        name: 'Orbital Science',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      time: 'hace 1 día',
      content: 'Nuevo descubrimiento: hemos identificado un sistema estelar con potencial para albergar vida. Los detalles se publicarán pronto en nuestra página oficial. ¡Manténganse sintonizados!',
      image: '../assets/react.jpg',
      likes: 1024,
      comments: 342,
      shares: 189
    }
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
            {/* <hr className='-mt-2 mb-2'/> */}
            <div className="space-y-3">
              <div>
                <h4 className="text-gray-400 text-sm">Biografía</h4>
                <p>{userData.bio}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Intereses</h4>
                <p>Tecnología, Espacio, Exploración Digital</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Se unió</h4>
                <p>Enero 2024</p>
              </div>
            </div>
          </div>
        );
      case 'friends':
        return (
          <div className="p-4 bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Amigos ({userData.friends.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.friends.map(friend => (
                <div key={friend.id} className="flex items-center p-3 bg-gray-700 rounded-lg">
                  <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full mr-3" />
                  <div>
                    <h4 className="font-medium">{friend.name}</h4>
                    <button className="text-sm text-purple-400 hover:text-purple-300">Ver perfil</button>
                  </div>
                </div>
              ))}
            </div>
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
      <Header className="sticky top-0 z-10" />

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
                <h2 className="text-2xl font-semibold">{userData.name}</h2>
                <p className="text-gray-400">{userData.bio}</p>
              </div>
              <button
              onClick={() => setIsModalOpen(true)}
                className="-mb-8 mt-4 sm:mt-0 sm:ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white flex items-center transition-colors cursor-pointer"
              >
                <Edit size={16}/>
                
              </button>
              {/* <button 
                
                className="-mb-8 mt-4 sm:mt-0 sm:ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white flex items-center transition-colors cursor-pointer"
              >
                <UserRoundPlus size={16}/>
              </button> */}
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