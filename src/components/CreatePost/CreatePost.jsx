import React, { useState, useEffect } from 'react';

const CreatePost = () => {
  const [userData, setUserData] = useState(null);
  const [postText, setPostText] = useState('');
  const [mediaType, setMediaType] = useState(null); // 'image', 'video', or 'emoji'
  const [mediaFiles, setMediaFiles] = useState([]); // Array de archivos seleccionados
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false); // Nueva variable para controlar el selector de emojis

  // Cargar datos del usuario desde localStorage cuando el componente se monta
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Referencia para el input de archivos
  const fileInputRef = React.useRef(null);

  // Lista de emojis para los sentimientos
  const emojis = [
    { id: 'happy', emoji: '😀', label: 'Feliz' },
    { id: 'sad', emoji: '😢', label: 'Triste' },
    { id: 'love', emoji: '❤️', label: 'Amoroso' },
    { id: 'laugh', emoji: '🤣', label: 'Gracioso' },
    { id: 'wow', emoji: '😮', label: 'Sorprendido' },
    { id: 'angry', emoji: '😡', label: 'Enojado' }
  ];

  // Manejar clic en botón de imagen o video
  const handleMediaButtonClick = (type) => {
    setMediaType(type);
    setShowEmojiSelector(false);
    // Si cambiamos de tipo, resetear las selecciones
    if (mediaType !== type) {
      setMediaFiles([]);
    }
    // Abrir selector de archivos
    fileInputRef.current.click();
  };

  // Manejar selección de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Tanto para video como para imagen, solo permitimos uno
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setMediaFiles([{ file, url }]);
    }
  };

  // Manejar selección de emoji
  const handleEmojiSelect = () => {
    // Ahora solo cambiamos la visibilidad del selector de emojis sin afectar los archivos
    setShowEmojiSelector(true);
    // No modificamos mediaFiles aquí
  };

  // Seleccionar emoji específico
  const selectEmoji = (emoji) => {
    setSelectedEmoji(emoji);
    // Cerrar selector de emojis
    setShowEmojiSelector(false);
  };

  // Eliminar archivo específico
  const removeFile = () => {
    setMediaFiles([]);
    setMediaType(null);
  };

  // Eliminar el emoji seleccionado
  const removeEmoji = () => {
    setSelectedEmoji(null);
  };

  // Publicar el contenido
  const handleSubmit = () => {
    // Aquí iría la lógica para enviar el post al backend
    console.log({
      userId: userData ? userData.id : null,
      text: postText,
      files: mediaFiles.map(item => item.file),
      emoji: selectedEmoji
    });
    
    // Resetear el formulario
    setPostText('');
    setMediaFiles([]);
    setSelectedEmoji(null);
    setMediaType(null);
    setShowEmojiSelector(false);
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src="/api/placeholder/50/50"
          alt="User avatar"
          className="w-12 h-12 rounded-full border-2 border-purple-500"
        />
        <div className="flex items-center flex-wrap">
          <span className="text-gray-300 font-medium">
            {userData ? userData.username : 'Usuario'}
          </span>
          
          {/* Mostrar sentimiento si está seleccionado */}
          {selectedEmoji && (
            <div className="flex items-center ml-2 bg-gray-700 px-2 py-1 rounded-full text-sm">
              <span>se siente {selectedEmoji.label.toLowerCase()}</span>
              <span className="ml-1">{selectedEmoji.emoji}</span>
              <button 
                onClick={removeEmoji}
                className="ml-1 text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <textarea
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        placeholder="¿Qué descubriste hoy en el cosmos?"
        className="w-full p-3 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-28"
      />
      
      {/* Previsualización de imagen */}
      {mediaType === 'image' && mediaFiles.length > 0 && (
        <div className="mt-3 mb-3">
          <div className="relative">
            <img 
              src={mediaFiles[0].url} 
              alt="Imagen seleccionada" 
              className="rounded-lg max-h-64 w-full object-cover"
            />
            <button 
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Previsualización de video */}
      {mediaType === 'video' && mediaFiles.length > 0 && (
        <div className="relative mt-3 mb-3">
          <video 
            src={mediaFiles[0].url} 
            controls 
            className="max-h-64 w-full rounded-lg"
          />
          <button 
            onClick={removeFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Selector de emojis */}
      {showEmojiSelector && (
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

      {/* Input oculto para archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
        className="hidden"
        multiple={false} // Ya no permitimos múltiples archivos
      />
      
      <div className="flex justify-between pt-3 border-t border-gray-700 mt-4">
        <div className="flex">
          <button 
            onClick={() => handleMediaButtonClick('image')}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
            <span>Imagen</span>
          </button>
          
          <button 
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
            onClick={handleEmojiSelect}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer ml-2"
          >
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sentimientos</span>
          </button>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={!postText && mediaFiles.length === 0 && !selectedEmoji}
          className={`px-4 py-2 rounded-md ${
            postText || mediaFiles.length > 0 || selectedEmoji 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Publicar
        </button>
      </div>
    </div>
  );
};

export default CreatePost;