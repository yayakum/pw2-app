import React, { useState, useRef } from 'react';
import { Bookmark, Heart, MessageCircle, Trash2, MoreHorizontal, Edit, X, Users } from 'lucide-react';
import CommentsModal from '../Comment/Comment';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import EditPost from '../EditPost/EditPost';
import EmojiDisplay from '../EmojiDisplay/EmojiDisplay';
import LikeList from '../LikeList/LikeList';
import { useNavigate } from 'react-router-dom';
const backendURL = import.meta.env.VITE_BACKEND_URL;

// Componente principal Post con integración de modal de comentarios
const Post = ({ post, onDelete }) => {
  // Estado para manejar likes
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || post.likes || 0);
  const [likeListOpen, setLikeListOpen] = useState(false);
  const navigate = useNavigate();
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
  
  // Estado para indicar si estamos procesando el like
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  // Verificar si el usuario actual es el dueño de la publicación
  const [userData] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const isOwner = userData && parseInt(userData.id) === parseInt(post.userId);

  const handleProfileClick = () => {
    if (isOwner ) {
    navigate(`/Profile`);
  } else {
    navigate(`/profile/${post.userId}`);}
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  // Función para manejar likes
  const handleLike = async () => {
    // Si ya estamos procesando un like, ignorar
    if (isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true);
      
      // Obtener el token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Optimistic UI update - actualizar inmediatamente la UI para mejor experiencia
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      
      // Determinar la URL y método según el estado actual
      const url = liked 
        ? `${backendURL}/unlikePost/${post.id}`
        : `${backendURL}/likePost/${post.id}`;
      
      const method = liked ? 'DELETE' : 'POST';
      
      // Realizar la petición al backend
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Si hay error, revertir el cambio optimista
        setLiked(liked);
        setLikeCount(liked ? likeCount : likeCount - 1);
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el like');
      }
      
      // Obtener la respuesta y actualizar con el valor real del backend
      const data = await response.json();
      setLikeCount(data.likeCount);
      
    } catch (err) {
      console.error('Error handling like:', err);
      // Solo mostrar mensaje de error al usuario en caso de errores inesperados
      if (err.message !== 'Ya has dado like a esta publicación' && 
          err.message !== 'No has dado like a esta publicación') {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setIsLikeProcessing(false);
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
      
      const response = await fetch(`${backendURL}/deletePost/${post.id}`, {
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
  const handleSaveEdit = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Siempre usamos FormData para mantener consistencia con createPost
      const formData = new FormData();
      
      // Añadir datos básicos
      formData.append('description', updatedData.description);
      
      if (updatedData.categoryId) {
        formData.append('categoryId', updatedData.categoryId);
      }
      
      // Manejar explícitamente el emoji
      if (updatedData.emoji) {
        formData.append('emoji', JSON.stringify(updatedData.emoji));
      } else {
        // Enviar una señal explícita para eliminar el emoji
        formData.append('removeEmoji', 'true');
      }
      
      // Añadir archivo multimedia si existe
      if (updatedData.mediaFile) {
        formData.append('file', updatedData.mediaFile);
      }
      
      // Si el usuario eliminó el archivo multimedia, indicarlo
      if (updatedData.removeMedia) {
        formData.append('removeMedia', 'true');
      }
      
      // Para depuración - mostrar las entradas del FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File object (${value.type})` : value}`);
      }
      
      const response = await fetch(`${backendURL}/updatePost/${post.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la publicación');
      }
      
      const updatedPost = await response.json();
      setPostEmoji(updatedPost.emojiData || updatedPost.emoji);
      
      setIsEditing(false);
      
      // Recargar la publicación
      if (onDelete) {
        setTimeout(() => onDelete("refresh"), 500);
      }
      
    } catch (err) {
      console.error('Error updating post:', err);
      alert(`Error al actualizar la publicación: ${err.message}`);
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
      const response = await fetch(`${backendURL}/getPostComments/${post.id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los comentarios');
      }
      
      const data = await response.json();
      setComments(data.data || []); // Asegurar que estamos obteniendo el arreglo de comentarios
      
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
    return post.usuario?.username || "Usuario";
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

  // Función para mostrar el modal de likes
  const showLikeList = () => {
    if (likeCount > 0) {
      setLikeListOpen(true);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md relative ">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
  className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-purple-900 border-purple-500 cursor-pointer overflow-hidden"
  onClick={handleProfileClick}
>
  {(post.usuario?.profilePic || post.profilePic) ? (
    <img 
      src={`data:image;base64,${post.usuario?.profilePic || post.profilePic}`} 
      alt={`${getUserName()} avatar`}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-white font-bold">{getUserName().charAt(0).toUpperCase()}</span>
  )}
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
              id: post.id,
              description: post.description,
              emoji: postEmoji,
              content: post.content,
              contentType: post.contentType,
              categoryId: post.categoryId
            }} 
            onSave={handleSaveEdit} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
          <>
            <p className="text-sm sm:text-base cursor-pointer" onClick={handlePostClick}>{post.description}</p>
            {/* Renderizar el contenido multimedia */}
            {renderMedia()}
          </>
        )}
      </div>
      
      <div className="flex justify-between text-sm text-gray-400 mb-3">
        <button 
          onClick={showLikeList}
          className={`hover:underline flex items-center ${likeCount > 0 ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <span>
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </span>
          {likeCount > 0 && (
            <Users size={14} className="ml-1" />
          )}
        </button>
        <button 
          onClick={openCommentsModal}
          className="hover:underline flex items-center cursor-pointer"
        >
          <span>{post._count?.comentarios || post.comments || 0} {(post._count?.comentarios || post.comments || 0) === 1 ? 'comentario' : 'comentarios'}</span>
        </button>
      </div>
      
      <div className="flex justify-between pt-3 border-t border-gray-700">
        <button 
          onClick={handleLike}
          disabled={isLikeProcessing}
          className={`flex items-center space-x-2 text-sm p-2 rounded-md hover:bg-gray-700 cursor-pointer ${
            isLikeProcessing 
              ? 'opacity-50 cursor-not-allowed' 
              : liked 
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
        {/* <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer">
          <Bookmark size={18} />
          <span>Guardar</span>
        </button> */}
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
      
      {/* Modal de lista de likes */}
      <LikeList 
        isOpen={likeListOpen}
        onClose={() => setLikeListOpen(false)}
        postId={post.id}
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