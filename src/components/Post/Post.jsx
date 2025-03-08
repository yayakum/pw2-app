import React, { useState, useRef } from 'react';
import { Bookmark, Heart, MessageCircle, Trash2, Send, CheckCircle, MoreHorizontal, Edit, X } from 'lucide-react';
import CommentsModal from '../Comment/Comment';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import EditPost from '../EditPost/EditPost';

// Componente principal Post con integración de modal de comentarios
const Post = ({ post, onDelete }) => {
  // Estado para manejar likes
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  // Estado para el menú de opciones
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  // Estado para la edición de la publicación
  const [isEditing, setIsEditing] = useState(false);
  const [postContent, setPostContent] = useState(post.content);
  const [postMedia, setPostMedia] = useState(post.image || post.video || null);
  const [postMediaType, setPostMediaType] = useState(post.image ? 'image' : (post.video ? 'video' : null));
  const [postEmoji, setPostEmoji] = useState(post.emoji || null);
  
  // Estado para el modal de comentarios
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  
  // Estado para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Función para manejar likes
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  // Funciones para el menú de opciones
  const handleEdit = () => {
    setIsEditing(true);
    setOptionsMenuOpen(false);
  };

  // Función para mostrar el modal de confirmación
  const showDeleteConfirmation = () => {
    setDeleteModalOpen(true);
    setOptionsMenuOpen(false);
  };

  // Función para manejar la confirmación de eliminación
  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    } else {
      console.log('Post eliminado:', post);
    }
    setDeleteModalOpen(false);
  };

  // Función para guardar la edición
  const handleSaveEdit = (newContent, newMedia, newEmoji, mediaType) => {
    setPostContent(newContent);
    setPostMedia(newMedia);
    setPostEmoji(newEmoji);
    setPostMediaType(mediaType);
    setIsEditing(false);
    
    console.log('Post actualizado:', {
      content: newContent,
      media: newMedia,
      mediaType: mediaType,
      emoji: newEmoji
    });
  };
  
  // Función para abrir el modal de comentarios
  const openCommentsModal = () => {
    setCommentsModalOpen(true);
  };
  
  // Función para cerrar el modal de comentarios
  const closeCommentsModal = () => {
    setCommentsModalOpen(false);
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.avatar}
            alt={`${post.user.name}'s avatar`}
            className="w-10 h-10 rounded-full border-2 border-purple-500"
          />
          <div>
            <div className="flex items-center flex-wrap">
              <h3 className="font-medium">{post.user.name}</h3>
              {post.user.verified && (
                <CheckCircle className="w-4 h-4 ml-1 text-blue-400" />
              )}
              
              {/* Mostrar sentimiento si existe */}
              {postEmoji && (
                <div className="flex items-center ml-2 bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-300">
                  <span>se siente {postEmoji.label.toLowerCase()}</span>
                  <span className="ml-1">{postEmoji.emoji}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">{post.time}</p>
          </div>
        </div>
        <div className="relative">
          <button 
            className="text-gray-400 hover:text-gray-300 cursor-pointer"
            onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
          >
            <MoreHorizontal size={20} />
          </button>
          
          <OptionsMenu 
            isOpen={optionsMenuOpen} 
            onEdit={handleEdit} 
            onDelete={showDeleteConfirmation}
            onClose={() => setOptionsMenuOpen(false)}
          />
        </div>
      </div>
      
      <div className="mb-4">
        {isEditing ? (
          <EditPost
            post={{ 
              content: postContent, 
              image: postMediaType === 'image' ? postMedia : null,
              video: postMediaType === 'video' ? postMedia : null,
              emoji: postEmoji 
            }} 
            onSave={handleSaveEdit} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
          <>
            <p className="text-sm sm:text-base">{postContent}</p>
            
            {/* Mostrar imagen si existe */}
            {postMediaType === 'image' && postMedia && (
              <div className="mt-3 mb-3">
                <img 
                  src={postMedia} 
                  alt="Imagen de la publicación"
                  className="rounded-lg w-full h-auto object-cover" 
                />
              </div>
            )}
            
            {/* Mostrar video si existe */}
            {postMediaType === 'video' && postMedia && (
              <div className="mt-3 mb-3">
                <video 
                  src={postMedia} 
                  controls
                  className="rounded-lg w-full h-auto" 
                />
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="flex justify-between text-sm text-gray-400 mb-3">
        <span>{likeCount} likes</span>
        <span>{comments.length} comentarios</span>
      </div>
      
      <div className="flex justify-between pt-3 border-t border-gray-700">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 text-sm p-2 rounded-md hover:bg-gray-700 cursor-pointer ${
            liked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>Me gusta</span>
        </button>
        <button 
          onClick={openCommentsModal}
          className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer"
        >
          <MessageCircle size={18} />
          <span>Comentar</span>
        </button>
        <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer">
          <Bookmark size={18} />
          <span>Guardar</span>
        </button>
      </div>
      
      {/* Modal de comentarios */}
      <CommentsModal 
        isOpen={commentsModalOpen} 
        onClose={closeCommentsModal} 
        postId={post.id}
        comments={comments}
      />
      
      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        postContent={postContent}
      />
    </div>
  );
};

// Componente de Menú de Opciones
const OptionsMenu = ({ onEdit, onDelete, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 top-8 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10">
      <div className="py-1">
        <button 
          onClick={onEdit}
          className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-700"
        >
          <Edit size={16} className="mr-2" />
          <span>Editar</span>
        </button>
        <button 
          onClick={onDelete}
          className="w-full flex items-center px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-700"
        >
          <Trash2 size={16} className="mr-2" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
};

// Datos simulados de ejemplo con emoji
const samplePost = {
  id: '1',
  user: {
    name: 'Carlos Sánchez',
    avatar: '/api/placeholder/40/40',
    verified: true
  },
  content: '¡Qué hermoso día para programar y crear interfaces increíbles! 🚀💻 #ReactLife',
  image: '/api/placeholder/600/400',
  video: null,
  emoji: { id: 'happy', emoji: '😀', label: 'Feliz' },
  time: 'Hace 2 horas',
  likes: 42,
  shares: 5,
  comments: [
    {
      id: '101',
      user: {
        name: 'María López',
        avatar: '/api/placeholder/40/40',
        verified: false
      },
      content: '¡Totalmente de acuerdo! El código limpio es una obra de arte 🎨',
      time: 'Hace 1 hora'
    },
    {
      id: '102',
      user: {
        name: 'Juan Pérez',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      content: '¿Qué proyecto estás desarrollando ahora?',
      time: 'Hace 45 minutos'
    }
  ]
};

// Datos de ejemplo con video
const videoSamplePost = {
  id: '2',
  user: {
    name: 'Ana Martínez',
    avatar: '/api/placeholder/40/40',
    verified: false
  },
  content: 'Mirando este increíble tutorial sobre React y Tailwind CSS',
  image: null,
  video: '/api/video-placeholder.mp4', // Aquí debería ir una URL real a un video
  emoji: { id: 'wow', emoji: '😮', label: 'Sorprendido' },
  time: 'Hace 3 horas',
  likes: 28,
  shares: 7,
  comments: []
};

// Componente de demostración
const SocialMediaPostDemo = () => {
  const handleDeletePost = (postId) => {
    console.log(`Post con ID ${postId} eliminado`);
    // Aquí irían las acciones reales para eliminar el post
  };

  return (
    <div>
      <Post post={samplePost} onDelete={handleDeletePost} />
      <Post post={videoSamplePost} onDelete={handleDeletePost} />
    </div>
  );
};

export { Post, SocialMediaPostDemo };
export default SocialMediaPostDemo;