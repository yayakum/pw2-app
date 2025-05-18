import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Edit, Trash2, CheckCircle, MoreVertical, AlertCircle } from 'lucide-react';

// Componente para editar un comentario
const EditCommentForm = ({ comment, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Enfocar el textarea cuando se abre el formulario de edición
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editedContent.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSave(editedContent);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-1">
      <textarea
        ref={textareaRef}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="w-full bg-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
        rows={2}
        disabled={isSubmitting}
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-2 py-1 text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !editedContent.trim()}
          className={`px-2 py-1 text-xs text-white rounded-md ${
            isSubmitting || !editedContent.trim()
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

// Componente de comentario individual
const Comment = ({ comment, onDelete, onEdit, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);

  // Determinar si el usuario actual es el autor del comentario
  const isAuthor = currentUserId && comment.userId === parseInt(currentUserId);
  
  // Función para formatear la fecha
  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
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

  // Manejar clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSaveEdit = async (newContent) => {
    try {
      await onEdit(comment.id, newContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
      alert(`Error al editar el comentario: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(`Error al eliminar el comentario: ${error.message}`);
      setIsDeleting(false);
    }
  };

  // Obtener avatar del usuario
  const getUserAvatar = () => {
    if (comment.usuario && comment.usuario.profilePic) {
      return `data:image/jpeg;base64,${comment.usuario.profilePic}`;
    }
    return '/api/placeholder/40/40';
  };

  // Obtener nombre del usuario
  const getUserName = () => {
    return comment.usuario?.username || 'Usuario';
  };

  return (
    <div className="py-3 border-b border-gray-700 last:border-0">
      <div className="flex items-start space-x-3">
        {/* Avatar del usuario */}
        <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center border border-purple-500 overflow-hidden">
          {comment.usuario?.profilePic ? (
            <img
              src={getUserAvatar()}
              alt={`${getUserName()}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold">{getUserName().charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium">{getUserName()}</span>
              <span className="text-xs text-gray-400 ml-2">
                {formatCommentDate(comment.createdAt)}
              </span>
            </div>
            
            {/* Menú de opciones (solo visible para el autor) */}
            {isAuthor && !isEditing && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                >
                  <MoreVertical size={16} />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 top-6 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10 w-24">
                    <button 
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 text-gray-300 flex items-center"
                    >
                      <Edit size={14} className="mr-2" />
                      <span>Editar</span>
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 text-red-400 flex items-center ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 size={14} className="mr-2" />
                      <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isEditing ? (
            <EditCommentForm
              comment={{ content: comment.content }}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Comentarios
const CommentsModal = ({ isOpen, onClose, postId, comments: initialComments, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Cargar el ID del usuario actual
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id);
    }
  }, []);

  // Cargar comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  // Efecto para cerrar el modal al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Enfocar el input cuando se abre el modal
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Función para obtener los comentarios
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/getPostComments/${postId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener comentarios');
      }
      
      const data = await response.json();
      
      // El controlador devuelve un objeto con una propiedad "data" que contiene los comentarios
      setComments(data.data || []);
      
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('No se pudieron cargar los comentarios. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si el modal no está abierto, no renderizar
  if (!isOpen) return null;

  // Función para agregar un nuevo comentario
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`http://localhost:3000/createComment/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el comentario');
      }
      
      // Limpiar el campo de comentario
      setNewComment('');
      
      // Recargar los comentarios para mostrar el nuevo
      await fetchComments();
      
      // Notificar al componente padre
      if (onCommentAdded) {
        onCommentAdded();
      }
      
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para eliminar un comentario
  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`http://localhost:3000/deleteComment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el comentario');
      }
      
      // Actualizar la lista de comentarios
      setComments(comments.filter(comment => comment.id !== commentId));
      
      // Notificar al componente padre
      if (onCommentAdded) {
        onCommentAdded();
      }
      
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  // Función para editar un comentario
  const handleEditComment = async (commentId, newContent) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`http://localhost:3000/updateComment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el comentario');
      }
      
      // Obtener el comentario actualizado
      const updatedComment = await response.json();
      
      // Actualizar el comentario en la lista
      setComments(
        comments.map(comment => 
          comment.id === commentId 
            ? updatedComment
            : comment
        )
      );
      
    } catch (err) {
      console.error('Error editing comment:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm shadow-2xl flex items-center justify-center z-50 px-4 bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-medium">Comentarios</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Lista de comentarios */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-2 text-gray-400">Cargando comentarios...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-red-400">
              <AlertCircle size={32} />
              <p className="mt-2">{error}</p>
              <button 
                onClick={fetchComments}
                className="mt-3 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Reintentar
              </button>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-400 my-8">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          ) : (
            comments.map(comment => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
        
        {/* Formulario para agregar comentario */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handleAddComment} className="flex">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              disabled={isSubmitting}
              className="flex-1 bg-gray-700 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className={`rounded-r-lg px-3 flex items-center justify-center ${
                !newComment.trim() || isSubmitting
                  ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;