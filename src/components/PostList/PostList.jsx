import React, { useState, useEffect } from 'react';
import Post from '../Post/Post';

const PostsList = ({ posts: initialPosts, onPostDelete }) => {
  const [posts, setPosts] = useState(initialPosts || []);

  // Actualizar los posts cuando cambian las props
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      // Asegurarse de que los datos estén en el formato correcto para renderizar
      const formattedPosts = initialPosts.map(post => {
        // Si el post ya tiene bien el formato, no modificarlo
        if (typeof post.content === 'string') {
          return post;
        }
        
        // Si necesitamos hacer ajustes al formato
        return {
          ...post,
          content: post.content || null,
          contentType: post.contentType || null,
          time: post.time || new Date(post.createdAt).toLocaleString()
        };
      });
      
      setPosts(formattedPosts);
    } else {
      setPosts([]);
    }
  }, [initialPosts]);

  // Manejar la eliminación de un post
  const handleDeletePost = (postId) => {
    // Si es "refresh", notificar al componente padre
    if (postId === "refresh") {
      if (onPostDelete) {
        onPostDelete(postId);
      }
      return;
    }
    
    // Si es un ID específico, eliminamos esa publicación del estado
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