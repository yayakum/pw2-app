import React, { useState } from 'react';
import { PlayCircle, X } from 'lucide-react';

const MediaGallery = ({ mediaPosts }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Abre el modal con el contenido seleccionado
  const openMediaPreview = (post) => {
    setSelectedMedia(post);
  };

  // Cierra el modal
  const closeMediaPreview = () => {
    setSelectedMedia(null);
  };

  return (
    <div>
      {/* Galería de miniaturas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {mediaPosts.map(post => (
          <div 
            key={post.id} 
            className="relative aspect-square overflow-hidden rounded-lg bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openMediaPreview(post)}
          >
            {post.contentType && post.contentType.startsWith('image/') ? (
              <img 
                src={`data:${post.contentType};base64,${post.content}`}
                alt="Imagen subida"
                className="w-full h-full object-cover"
              />
            ) : post.contentType && post.contentType.startsWith('video/') ? (
              <div className="relative w-full h-full bg-gray-900">
                <video 
                  src={`data:${post.contentType};base64,${post.content}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <PlayCircle size={40} className="text-white opacity-80" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                Sin contenido
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de vista previa */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            <button 
              onClick={closeMediaPreview}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700"
            >
              <X size={24} />
            </button>

            <div className="overflow-auto flex-grow rounded-lg bg-gray-800">
              {selectedMedia.contentType && selectedMedia.contentType.startsWith('image/') ? (
                <img 
                  src={`data:${selectedMedia.contentType};base64,${selectedMedia.content}`}
                  alt="Imagen en tamaño completo"
                  className="max-w-full h-auto max-h-[80vh] mx-auto"
                />
              ) : selectedMedia.contentType && selectedMedia.contentType.startsWith('video/') ? (
                <video 
                  src={`data:${selectedMedia.contentType};base64,${selectedMedia.content}`}
                  controls
                  autoPlay
                  className="max-w-full max-h-[80vh] mx-auto"
                />
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No se puede mostrar el contenido seleccionado
                </div>
              )}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-gray-800">
              <p className="text-sm text-gray-300">{selectedMedia.description}</p>
              <p className="text-xs text-gray-400 mt-1">{selectedMedia.time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay contenido */}
      {mediaPosts.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-400">No hay contenido multimedia para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;