import React, { useState, useEffect } from 'react';
import Post from '../Post/Post';

const PostsList = ({ posts: initialPosts, onPostDelete }) => {
  const [posts, setPosts] = useState(initialPosts || []);

  // Actualizar los posts cuando cambian las props
  useEffect(() => {
    setPosts(initialPosts || []);
  }, [initialPosts]);

  // Manejar la eliminación de un post
  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    
    // Notificar al componente padre si existe la función
    if (onPostDelete) {
      onPostDelete(postId);
    }
  };

  return (
    <div>
      {posts.length === 0 ? (
        <div className="p-8 rounded-lg bg-gray-800 bg-opacity-60 shadow-md text-center">
          <h3 className="text-xl font-medium mb-4">No hay publicaciones para mostrar</h3>
          <p className="text-gray-400">
            Las publicaciones que veas aparecerán aquí.
          </p>
        </div>
      ) : (
        posts.map(post => (
          <Post key={post.id} post={post} onDelete={handleDeletePost} />
        ))
      )}
    </div>
  );
};

export default PostsList;