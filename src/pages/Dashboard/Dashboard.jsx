import React from 'react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostsList from '../../components/PostList/PostList';

const Dashboard = () => {
  // Datos simulados para las publicaciones
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
      image: '/api/placeholder/600/400',
      likes: 245,
      comments: 58,
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

  // Datos simulados para sugerencias de amigos
  const friendSuggestions = [
    { id: 1, name: 'Nova Explorer', mutualFriends: 5, avatar: '/api/placeholder/50/50' },
    { id: 2, name: 'Estrella Wanderer', mutualFriends: 3, avatar: '/api/placeholder/50/50' },
    { id: 3, name: 'Cosmos Journey', mutualFriends: 8, avatar: '/api/placeholder/50/50' }
  ];

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
          <CreatePost />
          
          {/* Componente de lista de publicaciones */}
          <PostsList posts={posts} />
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