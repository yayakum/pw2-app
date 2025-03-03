import React, { useState } from 'react';
import { Edit, Plus, Image, Send, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe, Users, Calendar, MapPin, Briefcase, AtSign } from 'lucide-react';

const UserProfile = ({ 
  userName = "Astronauta Cósmico",
  userBio = "Explorador de galaxias digitales | Navegante del ciberespacio | Coleccionista de estrellas virtuales",
  profileImage = "/api/placeholder/128/128",
  coverImage = "/api/placeholder/1000/350",
  posts = [] 
}) => {
  const [newPostText, setNewPostText] = useState('');
  
  // Datos de ejemplo para las publicaciones si no se proporcionan
  const defaultPosts = [
    {
      id: 1,
      text: "Acabo de descubrir un nuevo sistema solar en el borde de la galaxia virtual. Las vistas son impresionantes. ¡Vengan a explorar!",
      image: "/api/placeholder/600/400",
      likes: 42,
      comments: 15,
      shares: 7,
      date: "Hace 2 horas"
    },
    {
      id: 2,
      text: "Hoy comienza mi viaje por el cinturón de asteroides digitales. ¿Alguien quiere unirse a la expedición?",
      likes: 23,
      comments: 8,
      shares: 3,
      date: "Hace 1 día"
    }
  ];

  const displayPosts = posts.length > 0 ? posts : defaultPosts;

  const handlePostSubmit = (e) => {
    e.preventDefault();
    console.log("Nueva publicación:", newPostText);
    // Aquí irá la lógica para enviar la publicación a tu backend
    setNewPostText('');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Cover Photo */}
      <div className="relative h-80">
        <img 
          src={coverImage} 
          alt="Portada cósmica" 
          className="w-full h-full object-cover" 
        />
        <button className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-70 p-2 rounded-full hover:bg-opacity-100 transition-all">
          <Edit size={20} className="text-white" />
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-purple-800 rounded-xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-36 h-36 rounded-full border-4 border-purple-600 shadow-lg" 
              />
              <button className="absolute bottom-2 right-2 bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-all">
                <Edit size={16} className="text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                {userName}
              </h1>
              <p className="text-blue-300 mt-1">{userBio}</p>
              
              {/* User Stats */}
              <div className="flex items-center text-sm text-gray-400 mt-2 space-x-4">
                <span className="flex items-center">
                  <Users size={16} className="mr-1" />
                  1.2K Seguidores
                </span>
                <span className="flex items-center">
                  <Globe size={16} className="mr-1" />
                  42 Planetas visitados
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-medium">
                Editar perfil
              </button>
              <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-purple-700">
                <Plus size={18} className="inline mr-1" /> Agregar
              </button>
            </div>
          </div>

          {/* Profile Nav */}
          <div className="mt-6 border-t border-gray-800 pt-4">
            <div className="flex flex-wrap gap-2 md:gap-6">
              <a href="#" className="px-3 py-2 hover:bg-gray-800 rounded-lg text-blue-300 border-b-2 border-blue-500">Publicaciones</a>
              <a href="#" className="px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-400">Sobre mí</a>
              <a href="#" className="px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-400">Amigos</a>
              <a href="#" className="px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-400">Fotos</a>
              <a href="#" className="px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-400">Videos</a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar - About */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-purple-800 rounded-xl shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Sobre mí</h2>
              
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <Briefcase className="mr-3 text-purple-400" size={18} />
                  <span>Astronauta Digital en <strong>Cosmic Labs</strong></span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-3 text-purple-400" size={18} />
                  <span>Vive en <strong>Nebulosa Andrómeda</strong></span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-3 text-purple-400" size={18} />
                  <span>Se unió en <strong>Marzo 2023</strong></span>
                </div>
                <div className="flex items-center">
                  <AtSign className="mr-3 text-purple-400" size={18} />
                  <span><strong>@astronauta_cosmico</strong></span>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm">
                Editar información
              </button>
            </div>
            
            <div className="mt-4 bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-purple-800 rounded-xl shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Amigos Cósmicos</h2>
              
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => (
                  <a href="#" key={id} className="block group">
                    <img 
                      src={`/api/placeholder/60/60?text=${id}`} 
                      alt={`Friend ${id}`} 
                      className="w-full aspect-square object-cover rounded-lg border border-gray-700 group-hover:border-purple-500 transition-all" 
                    />
                  </a>
                ))}
              </div>
              
              <button className="w-full mt-4 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm">
                Ver todos los amigos
              </button>
            </div>
          </div>

          {/* Main Content - Posts */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-purple-800 rounded-xl shadow-lg p-4">
              <form onSubmit={handlePostSubmit}>
                <div className="flex items-center mb-4">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border border-purple-600" 
                  />
                  <input 
                    type="text" 
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="¿Qué descubrimiento cósmico quieres compartir?" 
                    className="ml-3 flex-grow bg-gray-800 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                  />
                </div>
                
                <div className="flex justify-between border-t border-gray-800 pt-3">
                  <button type="button" className="flex items-center text-gray-400 hover:text-blue-400">
                    <Image size={20} className="mr-2" />
                    <span>Foto</span>
                  </button>
                  <button type="submit" className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-1 rounded-full">
                    <Send size={18} className="mr-2" />
                    <span>Publicar</span>
                  </button>
                </div>
              </form>
            </div>
            
            {/* Posts */}
            {displayPosts.map(post => (
              <div key={post.id} className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-purple-800 rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full border border-purple-600" 
                    />
                    <div className="ml-3">
                      <h3 className="font-bold text-blue-300">{userName}</h3>
                      <p className="text-xs text-gray-400">{post.date} · <Globe size={12} className="inline" /></p>
                    </div>
                  </div>
                  <button className="text-gray-400 p-1 hover:bg-gray-800 rounded-full">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-200">{post.text}</p>
                  {post.image && (
                    <div className="mt-3">
                      <img 
                        src={post.image} 
                        alt="Post" 
                        className="w-full rounded-lg" 
                      />
                    </div>
                  )}
                </div>
                
                {/* Engagement stats */}
                <div className="flex justify-between text-xs text-gray-400 mt-3 pb-2 border-b border-gray-800">
                  <div>
                    <ThumbsUp size={12} className="inline mr-1 text-blue-400" /> 
                    {post.likes}
                  </div>
                  <div>
                    {post.comments} comentarios · {post.shares} compartidos
                  </div>
                </div>
                
                {/* Engagement buttons */}
                <div className="flex justify-between mt-2">
                  <button className="flex items-center justify-center w-1/3 py-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg">
                    <ThumbsUp size={18} className="mr-2" />
                    <span>Me gusta</span>
                  </button>
                  <button className="flex items-center justify-center w-1/3 py-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg">
                    <MessageCircle size={18} className="mr-2" />
                    <span>Comentar</span>
                  </button>
                  <button className="flex items-center justify-center w-1/3 py-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg">
                    <Share2 size={18} className="mr-2" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;