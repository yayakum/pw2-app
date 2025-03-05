import React, { useState } from 'react';
import { Bookmark, Heart, MessageCircle, Trash2, Send, CheckCircle } from 'lucide-react';

// Componente de Comentario Individual
const Comment = ({ comment }) => {
  return (
    <div className="flex items-start space-x-3 mb-4">
      {/* Avatar del usuario */}
      <img 
        src={comment.user.avatar} 
        alt={`${comment.user.name}'s avatar`} 
        className="w-8 h-8 rounded-full border border-gray-600"
      />
      
      {/* Contenido del comentario */}
      <div className="bg-gray-700 rounded-lg p-3 flex-grow">
        <div className="flex items-center mb-1">
          <h4 className="font-medium text-sm mr-2">{comment.user.name}</h4>
          {comment.user.verified && (
            <CheckCircle className="w-4 h-4 text-blue-400" />
          )}
        </div>
        <p className="text-sm">{comment.content}</p>
        
        {/* Metadatos del comentario */}
        <div className="flex items-center text-xs text-gray-400 mt-2 space-x-3">
          <span>{comment.time}</span>
          <button className="hover:text-white">Responder</button>
        </div>
      </div>
    </div>
  );
};

// Componente de Entrada de Comentarios
const CommentInput = ({ onSubmitComment, currentUser, onCancel }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmitComment({
        user: currentUser,
        content: commentText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: currentUser.verified
      });
      setCommentText('');
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3 mt-4">
      <img 
        src={currentUser.avatar} 
        alt={`${currentUser.name}'s avatar`} 
        className="w-10 h-10 rounded-full border border-gray-600"
      />
      <div className="flex-grow relative">
        <input 
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="w-full bg-gray-700 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500"
        >
          <Send size={18} />
        </button>
      </div>
      <button 
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-400 hover:text-white"
      >
        Cancelar
      </button>
    </form>
  );
};

const Post = ({ post }) => {
  // Estado para manejar los comentarios
  const [comments, setComments] = useState(post.comments || []);
  
  // Estado para mostrar/ocultar input de comentarios
  const [showCommentInput, setShowCommentInput] = useState(false);
  
  // Estado para manejar likes
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  // Usuario actual 
  const currentUser = {
    name: 'María Rodríguez',
    avatar: '/api/placeholder/40/40',
    verified: true
  };

  // Función para agregar un nuevo comentario
  const handleSubmitComment = (newComment) => {
    setComments([...comments, newComment]);
  };

  // Función para manejar likes
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
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
                <CheckCircle className="w-4 h-4 ml-1 text-blue-400" />
              )}
            </div>
            <p className="text-xs text-gray-400">{post.time}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-red-600 cursor-pointer">
          <Trash2 size={20} />
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
        <span>{likeCount} likes</span>
        <span>{comments.length} comentarios · {post.shares} compartidos</span>
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
          onClick={() => setShowCommentInput(!showCommentInput)}
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

      {/* Sección de Comentarios */}
      <div className="mt-4 border-t border-gray-700 pt-4">
        {/* Mostrar Comentarios */}
        {comments.length > 0 && (
          <div className="mb-4">
            {comments.map((comment, index) => (
              <Comment key={index} comment={comment} />
            ))}
          </div>
        )}
        
        {/* Entrada de Comentarios */}
        {showCommentInput && (
          <CommentInput 
            onSubmitComment={handleSubmitComment} 
            currentUser={currentUser} 
            onCancel={() => setShowCommentInput(false)}
          />
        )}
      </div>
    </div>
  );
};

// Datos simulados de ejemplo
const samplePost = {
  user: {
    name: 'Carlos Sánchez',
    avatar: '/api/placeholder/40/40',
    verified: true
  },
  content: '¡Qué hermoso día para programar y crear interfaces increíbles! 🚀💻 #ReactLife',
  image: '/api/placeholder/600/400',
  time: 'Hace 2 horas',
  likes: 42,
  shares: 5,
  comments: [
    {
      user: {
        name: 'Ana Martínez',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      content: '¡Increíble proyecto! Me encanta cómo has estructurado los componentes.',
      time: '1 hora',
    },
    {
      user: {
        name: 'Pedro López',
        avatar: '/api/placeholder/40/40',
        verified: false
      },
      content: '¿Puedes compartir más detalles sobre tu proceso de diseño?',
      time: '45 min',
    }
  ]
};

// Componente de demostración
const SocialMediaPostDemo = () => {
  return <Post post={samplePost} />;
};

export { Post, Comment, CommentInput, SocialMediaPostDemo };
export default SocialMediaPostDemo;