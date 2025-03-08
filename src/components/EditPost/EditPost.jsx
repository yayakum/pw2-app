import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

const EditPost = ({ post, onSave, onCancel }) => {
  // Determinar el tipo de medio y URL correctamente
  const determineMediaType = () => {
    if (post.image) return 'image';
    if (post.video) return 'video';
    return null;
  };

  const getMediaUrl = () => {
    if (post.image) return post.image;
    if (post.video) return post.video;
    return null;
  };

  const [editedContent, setEditedContent] = useState(post.content);
  const [mediaType, setMediaType] = useState(determineMediaType());
  const [mediaFiles, setMediaFiles] = useState(getMediaUrl() ? [{ url: getMediaUrl() }] : []);
  const [selectedEmoji, setSelectedEmoji] = useState(post.emoji || null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Referencia para el input de archivo
  const fileInputRef = useRef(null);

  // Lista de emojis para los sentimientos
  const emojis = [
    { id: 'happy', emoji: '😀', label: 'Feliz' },
    { id: 'sad', emoji: '😢', label: 'Triste' },
    { id: 'love', emoji: '❤️', label: 'Amoroso' },
    { id: 'laugh', emoji: '🤣', label: 'Gracioso' },
    { id: 'wow', emoji: '😮', label: 'Sorprendido' },
    { id: 'angry', emoji: '😡', label: 'Enojado' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedContent.trim() || mediaFiles.length > 0 || selectedEmoji) {
      // Extraer solo la URL del medio para pasar al componente principal
      const mediaUrl = mediaFiles.length > 0 ? mediaFiles[0].url : null;
      onSave(editedContent, mediaUrl, selectedEmoji, mediaType);
    }
  };
  
  const handleRemoveMedia = () => {
    setMediaFiles([]);
    setMediaType(null);
  };
  
  // Manejar clic en botón de imagen o video
  const handleMediaButtonClick = (type) => {
    setMediaType(type);
    setShowEmojiPicker(false);
    // Si cambiamos de tipo, resetear las selecciones
    if (mediaType !== type) {
      setMediaFiles([]);
    }
    // Abrir selector de archivos
    fileInputRef.current.click();
  };
  
  // Función para manejar la carga de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Solo permitimos un archivo a la vez
    const file = files[0];
    const url = URL.createObjectURL(file);
    setMediaFiles([{ file, url }]);
  };
  
  // Manejar selección de emoji
  const handleEmojiSelect = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Seleccionar emoji específico
  const selectEmoji = (emoji) => {
    setSelectedEmoji(emoji);
    // Cerrar selector de emojis
    setShowEmojiPicker(false);
  };

  // Eliminar el emoji seleccionado
  const removeEmoji = () => {
    setSelectedEmoji(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        placeholder="¿Qué descubriste hoy en el cosmos?"
        className="w-full bg-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
        rows={4}
      />
      
      {/* Previsualización de imagen */}
      {mediaType === 'image' && mediaFiles.length > 0 && (
        <div className="mt-3 mb-3">
          <div className="relative">
            <img 
              src={mediaFiles[0].url} 
              alt="Imagen seleccionada" 
              className="rounded-lg h-48 w-full object-cover"
            />
            <button 
              type="button"
              onClick={handleRemoveMedia}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white hover:bg-red-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Previsualización de video */}
      {mediaType === 'video' && mediaFiles.length > 0 && (
        <div className="mt-3 mb-3">
          <div className="relative">
            <video 
              src={mediaFiles[0].url} 
              controls 
              className="max-h-64 w-full rounded-lg"
            />
            <button 
              type="button"
              onClick={handleRemoveMedia}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white hover:bg-red-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Emoji seleccionado */}
      {selectedEmoji && (
        <div className="flex items-center mt-3 mb-3 bg-gray-700 px-3 py-2 rounded-lg w-fit">
          <span className="text-xl mr-2">{selectedEmoji.emoji}</span>
          <span className="text-gray-300">Se siente {selectedEmoji.label.toLowerCase()}</span>
          <button 
            type="button"
            onClick={removeEmoji}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Selector de emojis */}
      {showEmojiPicker && (
        <div className="mt-3 mb-3 grid grid-cols-6 gap-2 bg-gray-700 p-3 rounded-lg">
          {emojis.map((emojiItem) => (
            <div 
              key={emojiItem.id}
              onClick={() => selectEmoji(emojiItem)}
              className="text-center cursor-pointer hover:bg-gray-600 p-2 rounded-lg flex flex-col items-center"
            >
              <span className="text-2xl">{emojiItem.emoji}</span>
              <span className="text-xs text-gray-300 mt-1">{emojiItem.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Input oculto para carga de archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
        className="hidden"
        multiple={false} // No permitir múltiples archivos
      />
      
      <div className="flex justify-between pt-3 border-t border-gray-700 mt-4">
        <div className="flex">
          <button
            type="button"
            onClick={() => handleMediaButtonClick('image')}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
            <span>Imagen</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleMediaButtonClick('video')}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer ml-2"
          >
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Video</span>
          </button>
          
          <button 
            type="button"
            onClick={handleEmojiSelect}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer ml-2"
          >
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sentimientos</span>
          </button>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md"
          >
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditPost;