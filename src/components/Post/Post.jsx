import React, { useState, useRef } from 'react';
import { Bookmark, Heart, MessageCircle, Trash2, MoreHorizontal, Edit, X } from 'lucide-react';
import CommentsModal from '../Comment/Comment';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import EditPost from '../EditPost/EditPost';
import EmojiDisplay from '../EmojiDisplay/EmojiDisplay';

// Componente principal Post con integración de modal de comentarios
const Post = ({ post, onDelete }) => {
  // Estado para manejar likes
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || post.likes || 0);

  // Estado para el menú de opciones
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  // Estado para la edición de la publicación
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para los emojis
  const [postEmoji, setPostEmoji] = useState(post.emojiData || post.emoji || null);
  
  // Estado para el modal de comentarios
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  
  // Estado para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Verificar si el usuario actual es el dueño de la publicación
  const [userData] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const isOwner = userData && parseInt(userData.id) === parseInt(post.userId);

  // Función para manejar likes
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const url = liked 
        ? `http://localhost:3000/unlikePost/${post.id}`
        : `http://localhost:3000/likePost/${post.id}`;
      
      const method = liked ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al procesar el like');
      }
      
      // Actualizar el estado local
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      
    } catch (err) {
      console.error('Error handling like:', err);
      // Mantener el estado anterior en caso de error
    }
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
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`http://localhost:3000/deletePost/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la publicación');
      }
      
      // Cerrar el modal y notificar al componente padre
      setDeleteModalOpen(false);
      
      if (onDelete) {
        onDelete(post.id);
      }
      
    } catch (err) {
      console.error('Error deleting post:', err);
      setDeleteError(err.message || 'Error al eliminar la publicación');
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para guardar la edición
  const handleSaveEdit = async (newContent, newEmoji) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Crear un objeto para enviar los datos
      const postData = {
        description: newContent
      };
      
      if (newEmoji) {
        postData.emoji = JSON.stringify(newEmoji);
      }
      
      const response = await fetch(`http://localhost:3000/updatePost/${post.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la publicación');
      }
      
      // Actualizar el estado local con los datos de respuesta
      const updatedPost = await response.json();
      
      setPostEmoji(updatedPost.emojiData || updatedPost.emoji);
      setIsEditing(false);
      
      // Recargar la publicación (Idealmente esto debería ser manejado a nivel de componente padre)
      if (onDelete) {
        setTimeout(() => onDelete("refresh"), 500);
      }
      
    } catch (err) {
      console.error('Error updating post:', err);
      // Mantener el estado anterior en caso de error
    }
  };
  
  // Función para abrir el modal de comentarios
  const openCommentsModal = () => {
    setCommentsModalOpen(true);
  };
  
  // Función para cerrar el modal de comentarios
  const closeCommentsModal = () => {
    setCommentsModalOpen(false);
  };

  // Función para cargar los comentarios de una publicación
  const loadComments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/getPostComments/${post.id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los comentarios');
      }
      
      const data = await response.json();
      setComments(data);
      
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };
  
  // Cargar comentarios al abrir el modal
  React.useEffect(() => {
    if (commentsModalOpen) {
      loadComments();
    }
  }, [commentsModalOpen]);

  // Obtener nombre de usuario
  const getUserName = () => {
    return post.user?.name || post.usuario?.username || "Usuario";
  };

  // Renderiza el contenido multimedia según el tipo
  const renderMedia = () => {
    // Si no hay contenido o tipo de contenido, no renderizamos nada
    if (!post.content || !post.contentType) {
      return null;
    }

    // Verificamos si el contenido es una imagen
    if (post.contentType.startsWith('image/')) {
      return (
        <div className="mt-3 mb-3">
          <img 
            src={`data:${post.contentType};base64,${post.content}`}
            alt="Imagen de la publicación"
            className="w-full rounded-lg max-h-96 object-contain bg-gray-900"
          />
        </div>
      );
    }
    
    // Verificamos si el contenido es un video
    if (post.contentType.startsWith('video/')) {
      return (
        <div className="mt-3 mb-3">
          <video 
            src={`data:${post.contentType};base64,${post.content}`}
            controls
            className="w-full rounded-lg max-h-96"
          />
        </div>
      );
    }
    
    // Si no es un tipo reconocido, no mostramos nada
    return null;
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Imagen de avatar reemplazada por un div de placeholder fijo */}
          <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500">
            <span className="text-white font-bold">{getUserName().charAt(0).toUpperCase()}</span>
          </div>
          
          <div>
            <div className="flex items-center flex-wrap">
              <h3 className="font-medium">{getUserName()}</h3>
              
              {/* Usar el componente EmojiDisplay para mostrar el emoji */}
              {postEmoji && (
                <div className="ml-2">
                  <EmojiDisplay emoji={postEmoji} />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">{post.time || new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>
        {isOwner && (
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
        )}
      </div>
      
      <div className="mb-4">
        {isEditing ? (
          <EditPost
            post={{ 
              description: post.description,
              emoji: postEmoji 
            }} 
            onSave={handleSaveEdit} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
          <>
            <p className="text-sm sm:text-base">{post.description}</p>
            {/* Renderizar el contenido multimedia */}
            {renderMedia()}
          </>
        )}
      </div>
      
      <div className="flex justify-between text-sm text-gray-400 mb-3">
        <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        <span>{post._count?.comentarios || post.comments || 0} {(post._count?.comentarios || post.comments || 0) === 1 ? 'comentario' : 'comentarios'}</span>
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
        onCommentAdded={loadComments}
      />
      
      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        postContent={post.description}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

// Componente de Menú de Opciones
const OptionsMenu = ({ onEdit, onDelete, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  // Manejar clics fuera del menú para cerrarlo
  const handleOutsideClick = (e) => {
    if (e.target.closest('.options-menu')) return;
    onClose();
  };
  
  React.useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  return (
    <div className="options-menu absolute right-0 top-8 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10">
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

export default Post;