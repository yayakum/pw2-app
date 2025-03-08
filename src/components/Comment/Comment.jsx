import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Edit, Trash2, CheckCircle } from 'lucide-react';

// Componente para editar un comentario
const EditCommentForm = ({ comment, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(comment.content);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Enfocar el textarea cuando se abre el formulario de edición
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedContent.trim()) {
      onSave(editedContent);
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
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-2 py-1 text-xs text-white bg-purple-600 hover:bg-purple-700 rounded-md"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

// Componente de comentario individual
const Comment = ({ comment, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentContent, setCommentContent] = useState(comment.content);

  const handleSaveEdit = (newContent) => {
    setCommentContent(newContent);
    setIsEditing(false);
    if (onEdit) {
      onEdit(comment.id, newContent);
    }
  };

  return (
    <div className="py-3 border-b border-gray-700 last:border-0">
      <div className="flex items-start space-x-3">
        <img
          src={comment.user.avatar}
          alt={`${comment.user.name}'s avatar`}
          className="w-8 h-8 rounded-full border border-purple-500"
        />
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">{comment.user.name}</span>
            {comment.user.verified && (
              <CheckCircle className="w-3 h-3 ml-1 text-blue-400" />
            )}
            <span className="text-xs text-gray-400 ml-2">{comment.time}</span>
          </div>
          
          {isEditing ? (
            <EditCommentForm
              comment={{ content: commentContent }}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <p className="text-sm">{commentContent}</p>
          )}
          
          {!isEditing && (
            <div className="flex mt-1 space-x-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Editar
              </button>
              <button 
                onClick={() => onDelete(comment.id)}
                className="text-xs text-gray-400 hover:text-red-400"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Comentarios
const CommentsModal = ({ isOpen, onClose, postId, comments: initialComments }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

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

  // Si el modal no está abierto, no renderizar
  if (!isOpen) return null;

  // Función para agregar un nuevo comentario
  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        time: 'Ahora mismo',
        user: {
          name: 'Usuario Actual',
          avatar: '/api/placeholder/40/40',
          verified: false
        }
      };

      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  // Función para eliminar un comentario
  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  // Función para editar un comentario
  const handleEditComment = (commentId, newContent) => {
    setComments(
      comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent } 
          : comment
      )
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm shadow-2xl flex items-center justify-center z-50 px-4">
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
          {comments.length === 0 ? (
            <p className="text-center text-gray-400 my-8">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          ) : (
            comments.map(comment => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
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
              className="flex-1 bg-gray-700 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className={`bg-purple-600 rounded-r-lg px-3 flex items-center justify-center ${
                !newComment.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
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