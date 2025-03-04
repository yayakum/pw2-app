import React from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';

const Post = ({ post }) => {
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
  );
};

export default Post;