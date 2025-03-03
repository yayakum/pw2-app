import React from 'react';
import { Search, Bell, MessageSquare, Users, Home, Bookmark, Settings, ChevronDown, MoreHorizontal, Heart, MessageCircle, Share2, User } from 'lucide-react';
import Header from '../../components/Header/Header';

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
      image: '/api/placeholder/600/400',
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
      <Header className="sticky top-0 z-10"></Header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
        {/* Sidebar izquierdo */}
        <aside className="w-full md:w-1/4 md:pr-4 mb-6 md:mb-0 hidden md:block">
          <div className="p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md sticky top-24">
            <nav className="space-y-1">
              <a href="#" className="flex items-center space-x-3 p-2 rounded-md bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-70 text-white">
                <Home size={20} />
                <span>Inicio</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
                <User size={20} />
                <span>Perfil</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
                <Users size={20} />
                <span>Amigos</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
                <MessageCircle size={20} />
                <span>Mensajes</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
                <Bookmark size={20} />
                <span>Guardados</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition">
                <Settings size={20} />
                <span>Configuración</span>
              </a>
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="font-medium text-lg mb-4">Exploradores Activos</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="relative">
                    <img src="/api/placeholder/40/40" alt="Online User" className="w-8 h-8 rounded-full" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800"></span>
                  </div>
                  <span className="ml-3">Nebula Walker</span>
                </li>
                <li className="flex items-center">
                  <div className="relative">
                    <img src="/api/placeholder/40/40" alt="Online User" className="w-8 h-8 rounded-full" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800"></span>
                  </div>
                  <span className="ml-3">Stellar Nomad</span>
                </li>
                <li className="flex items-center">
                  <div className="relative">
                    <img src="/api/placeholder/40/40" alt="Online User" className="w-8 h-8 rounded-full" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800"></span>
                  </div>
                  <span className="ml-3">Luna Explorer</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
        
        {/* Feed central */}
        <section className="w-full md:w-2/4 md:px-4">
          {/* Crear publicación */}
          <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/api/placeholder/50/50"
                alt="User avatar"
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
              <input
                type="text"
                placeholder="¿Qué descubriste hoy en el cosmos?"
                className="w-full p-3 rounded-full bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-700">
              <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
                <span>Imagen</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Video</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Sentimientos</span>
              </button>
            </div>
          </div>
          
          {/* Publicaciones */}
          {posts.map(post => (
            <div key={post.id} className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.user.avatar}
                    alt={`${post.user.name}'s avatar`}
                    className="w-10 h-10 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{post.user.name}</h3>
                      {post.user.verified && (
                        <svg className="w-4 h-4 ml-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{post.time}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm sm:text-base">{post.content}</p>
              </div>
              
              {post.image && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post image"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <span>{post.likes} likes</span>
                <span>{post.comments} comentarios · {post.shares} compartidos</span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-700">
                <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700">
                  <Heart size={18} />
                  <span>Me gusta</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700">
                  <MessageCircle size={18} />
                  <span>Comentar</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700">
                  <Share2 size={18} />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          ))}
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