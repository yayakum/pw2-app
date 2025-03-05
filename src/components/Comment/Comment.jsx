import React, { useState } from 'react';
import { Send, UserCircle } from 'lucide-react';

// Individual Comment Component
const Comment = ({ comment }) => {
  return (
    <div className="flex items-start space-x-3 mb-4">
      {/* User Avatar */}
      <img 
        src={comment.user.avatar || '/default-avatar.png'} 
        alt={`${comment.user.name}'s avatar`} 
        className="w-8 h-8 rounded-full border border-gray-600"
      />
      
      {/* Comment Content */}
      <div className="bg-gray-700 rounded-lg p-3 flex-grow">
        <div className="flex items-center mb-1">
          <h4 className="font-medium text-sm mr-2">{comment.user.name}</h4>
          {comment.user.verified && (
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="text-sm">{comment.content}</p>
        
        {/* Comment metadata */}
        <div className="flex items-center text-xs text-gray-400 mt-2 space-x-3">
          <span>{comment.time}</span>
          <button className="hover:text-white">Responder</button>
        </div>
      </div>
    </div>
  );
};

// Comment Input Component
const CommentInput = ({ onSubmitComment, currentUser }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmitComment({
        user: currentUser,
        content: commentText,
        time: new Date().toLocaleString()
      });
      setCommentText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3 mt-4">
      <img 
        src={currentUser.avatar || '/default-avatar.png'} 
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
    </form>
  );
};

// Updated Post Component with Comments Section
const Post = ({ post }) => {
  const [comments, setComments] = useState(post.comments || []);
  
  // Mock current user (you would replace this with actual user context)
  const currentUser = {
    name: 'Usuario Actual',
    avatar: '/default-avatar.png',
    verified: false
  };

  const handleSubmitComment = (newComment) => {
    setComments([...comments, newComment]);
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
      {/* Existing Post Component Code */}
      {/* ... previous Post component code remains the same ... */}
      
      {/* Comments Section */}
      <div className="mt-4 border-t border-gray-700 pt-4">
        {/* Display Comments */}
        {comments.length > 0 && (
          <div className="mb-4">
            {comments.map((comment, index) => (
              <Comment key={index} comment={comment} />
            ))}
          </div>
        )}
        
        {/* Comment Input */}
        <CommentInput 
          onSubmitComment={handleSubmitComment} 
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
};

export { Post, Comment, CommentInput };
export default Post;