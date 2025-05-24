import React, { useState, useRef, useEffect } from 'react';
import EmojiDisplay from '../EmojiDisplay/EmojiDisplay';
import { X } from 'lucide-react';
const backendURL = import.meta.env.VITE_BACKEND_URL;
const EditPost = ({ post, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(post.description || '');
  const [mediaType, setMediaType] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState(post.emojiData || post.emoji || null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingMedia, setExistingMedia] = useState(false);
  
  const fileInputRef = useRef(null);

  // Lista de emojis
  const emojis = [
    { id: 'happy', emoji: '😀', label: 'Feliz' },
    { id: 'sad', emoji: '😢', label: 'Triste' },
    { id: 'love', emoji: '❤️', label: 'Amoroso' },
    { id: 'laugh', emoji: '🤣', label: 'Gracioso' },
    { id: 'wow', emoji: '😮', label: 'Sorprendido' },
    { id: 'angry', emoji: '😡', label: 'Enojado' }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendURL}/getAllCategories`);
        if (!response.ok) {
          throw new Error('Error al obtener categorías');
        }
        const data = await response.json();
        setCategories(data);
        
        if (post.categoryId && data.length > 0) {
          const category = data.find(cat => parseInt(cat.id) === parseInt(post.categoryId));
          setSelectedCategory(category || data[0]);
        } else if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    const determineMediaFromPost = () => {
      if (post.content && post.contentType) {
        if (post.contentType.startsWith('image/')) {
          setMediaType('image');
        } else if (post.contentType.startsWith('video/')) {
          setMediaType('video');
        }
        
        // Crear URL a partir del contenido base64
        const url = `data:${post.contentType};base64,${post.content}`;
        setMediaFiles([{ url }]);
        setExistingMedia(true);
      }
    };
    
    fetchCategories();
    determineMediaFromPost();
  }, [post]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!editedContent.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    if (!selectedCategory) {
      alert('Debes seleccionar una categoría');
      return;
    }

    const updatedData = {
      description: editedContent,
      emoji: selectedEmoji,
      categoryId: selectedCategory.id,
    };

    if (mediaFiles.length > 0 && mediaFiles[0].file) {
      updatedData.mediaFile = mediaFiles[0].file;
    }

    if (existingMedia && mediaFiles.length === 0) {
      updatedData.removeMedia = true;
    }

    onSave(updatedData);
  };
  
  const handleRemoveMedia = () => {
    setMediaFiles([]);
    setMediaType(null);
    setExistingMedia(false);
  };

  const handleMediaButtonClick = (type) => {
    setMediaType(type);
    setShowEmojiPicker(false);
    setShowCategories(false);

    if (mediaType !== type) {
      setMediaFiles([]);
      setExistingMedia(false);
    }

    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0];
    const url = URL.createObjectURL(file);
    setMediaFiles([{ file, url }]);
    setExistingMedia(false);
  };

  const handleEmojiSelect = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowCategories(false);
  };

  const selectEmoji = (emoji) => {
    setSelectedEmoji(emoji);

    setShowEmojiPicker(false);
  };

  const removeEmoji = () => {
    setSelectedEmoji(null);
  };

  const handleCategorySelect = () => {
    setShowCategories(!showCategories);
    setShowEmojiPicker(false);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  const renderMediaPreview = () => {
    if (mediaFiles.length === 0) return null;
    
    const mediaUrl = mediaFiles[0].url;
    
    if (mediaType === 'image') {
      return (
        <div className="mt-3 mb-3 relative">
          <img 
            src={mediaUrl}
            alt="Imagen de la publicación"
            className="w-full rounded-lg max-h-96 object-contain bg-gray-900"
          />
          <button 
            type="button"
            onClick={handleRemoveMedia}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      );
    } else if (mediaType === 'video') {
      return (
        <div className="mt-3 mb-3 relative">
          <video 
            src={mediaUrl}
            controls
            className="w-full rounded-lg max-h-96"
          />
          <button 
            type="button"
            onClick={handleRemoveMedia}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      );
    }
    
    return null;
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

      {selectedCategory && (
        <div className="items-center mb-3 bg-gray-700 px-2 py-1 rounded-full text-sm inline-block">
          <span>Categoría: {selectedCategory.nombre}</span>
          <button 
            type="button"
            onClick={handleCategorySelect}
            className="ml-1 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
        </div>
      )}

      {selectedEmoji && (
        <div className="mt-3 mb-3">
          <EmojiDisplay 
            emoji={selectedEmoji} 
            showRemoveButton={true}
            onRemove={removeEmoji}
            className="w-fit"
          />
        </div>
      )}

      {showCategories && (
        <div className="mt-3 mb-3 bg-gray-700 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div 
                key={category.id}
                onClick={() => selectCategory(category)}
                className={`cursor-pointer hover:bg-gray-600 p-2 rounded-lg ${selectedCategory?.id === category.id ? 'bg-purple-700' : ''}`}
              >
                <span className="font-medium">{category.nombre}</span>
                {category.descripcion && (
                  <p className="text-xs text-gray-300 mt-1">{category.descripcion}</p>
                )}
              </div>
            ))}
          </div>
          {categories.length === 0 && (
            <p className="text-center text-gray-300 py-2">No hay categorías disponibles</p>
          )}
        </div>
      )}

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

      {renderMediaPreview()}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
        className="hidden"
        multiple={false}
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
          
          <button 
            type="button"
            onClick={handleCategorySelect}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer ml-2"
          >
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Categoría</span>
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