import React, { useState, useEffect } from 'react';
import { Image, Video, Smile, Tag, X, Check } from 'lucide-react';
import EmojiDisplay from '../EmojiDisplay/EmojiDisplay';
import { useNavigate } from 'react-router-dom';

const CreatePost = ({onPostCreated }) => {
  const [userData, setUserData] = useState(null);
  const [postText, setPostText] = useState('');
  const [mediaType, setMediaType] = useState(null); // 'image', 'video', o null
  const [mediaFiles, setMediaFiles] = useState([]); // Array de archivos seleccionados
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const getUserName = () => {
        return userData?.username || "Usuario";
    };

    const handleProfileClick = () => {
    navigate(`/Profile`);
  };

  // Cargar datos del usuario desde localStorage cuando el componente se monta
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    
    // Cargar categorías desde el backend
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/getAllCategories');
        if (!response.ok) {
          throw new Error('Error al obtener categorías');
        }
        const data = await response.json();
        setCategories(data);
        // Establecer la primera categoría como predeterminada si existe
        if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('No se pudieron cargar las categorías. Por favor, intenta de nuevo más tarde.');
      }
    };
    
    fetchCategories();
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
    setShowCategories(false);
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
      
      // Imprimir el tipo de archivo para depuración
      console.log('Tipo de archivo seleccionado:', file.type);
    }
  };

  // Manejar selección de emoji
  const handleEmojiSelect = () => {
    setShowEmojiSelector(true);
    setShowCategories(false);
  };

  // Manejar selección de categoría
  const handleCategorySelect = () => {
    setShowCategories(true);
    setShowEmojiSelector(false);
  };

  // Seleccionar emoji específico
  const selectEmoji = (emoji) => {
    setSelectedEmoji(emoji);
    setShowEmojiSelector(false);
  };

  // Seleccionar categoría específica
  const selectCategory = (category) => {
    setSelectedCategory(category);
    setShowCategories(false);
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
  
  // Determinar el tipo MIME correcto basado en la extensión del archivo
  const getMimeType = (file) => {
    if (!file) return null;
    
    // Si el navegador proporciona el tipo MIME, usarlo
    if (file.type) {
      return file.type;
    }
    
    // Si no hay tipo, intentar detectarlo por la extensión
    const fileName = file.name.toLowerCase();
    
    // Para imágenes
    if (fileName.endsWith('.png')) return 'image/png';
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'image/jpeg';
    if (fileName.endsWith('.gif')) return 'image/gif';
    if (fileName.endsWith('.bmp')) return 'image/bmp';
    if (fileName.endsWith('.webp')) return 'image/webp';
    if (fileName.endsWith('.svg')) return 'image/svg+xml';
    
    // Para videos
    if (fileName.endsWith('.mp4')) return 'video/mp4';
    if (fileName.endsWith('.webm')) return 'video/webm';
    if (fileName.endsWith('.ogg')) return 'video/ogg';
    if (fileName.endsWith('.mov')) return 'video/quicktime';
    if (fileName.endsWith('.avi')) return 'video/x-msvideo';
    if (fileName.endsWith('.flv')) return 'video/x-flv';
    
    // Valores predeterminados según el tipo de medio
    if (mediaType === 'image') return 'image/jpeg';
    if (mediaType === 'video') return 'video/mp4';
    
    return null;
  };
  
  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Publicar el contenido
  const handleSubmit = async () => {
    // Limpiar mensajes anteriores
    setError(null);
    setSuccessMessage(null);
    
    // Validar que haya descripción (obligatoria)
    if (!postText || postText.trim() === '') {
      setError('La descripción es obligatoria. Por favor escribe algo para publicar.');
      return;
    }
    
    // Validar que haya categoría seleccionada (obligatoria)
    if (!selectedCategory) {
      setError('Por favor selecciona una categoría para tu publicación');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Crear un FormData para enviar archivos
      const formData = new FormData();
      
      // Añadimos la descripción como 'description'
      formData.append('description', postText);
      formData.append('categoryId', selectedCategory.id);
      
      // Solo añadir emoji si existe
      if (selectedEmoji) {
        formData.append('emoji', JSON.stringify(selectedEmoji));
      }
      
      // Solo adjuntar archivo multimedia si existe
      if (mediaFiles.length > 0) {
        const file = mediaFiles[0].file;
        formData.append('file', file);
        
        // Obtener el tipo MIME correcto para el archivo
        const contentType = getMimeType(file);
        console.log("Tipo de contenido detectado:", contentType);
        
        // Añadir el tipo de contenido al formulario
        formData.append('contentType', contentType);
        
        // También añadir fileType para mantener compatibilidad con el backend
        formData.append('fileType', contentType);
      }
      
      // Para depuración - mostrar las entradas del FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File object (${value.type})` : value}`);
      }
      
      const response = await fetch('http://localhost:3000/createPost', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al crear publicación:", errorData);
        throw new Error(errorData.error || 'Error al crear la publicación');
      }
      
      // Mostrar mensaje de éxito
      setSuccessMessage('¡Publicación creada con éxito!');
      
      // Resetear el formulario
      setPostText('');
      setMediaFiles([]);
      setSelectedEmoji(null);
      setMediaType(null);
      setShowEmojiSelector(false);
      setShowCategories(false);
      
      // Notificar al componente padre que se ha creado una publicación
      if (onPostCreated) {
        onPostCreated();
      }
      
    } catch (err) {
      console.error('Error submitting post:', err);
      setError(err.message || 'Error al crear la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        {/* Avatar con imagen de perfil o inicial */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-purple-900 border-purple-500 cursor-pointer overflow-hidden" 
          onClick={handleProfileClick}
        >
          {userData?.profilePic ? (
            <img 
              src={`data:image;base64,${userData.profilePic}`} 
              alt={`${getUserName()} avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold">{getUserName().charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex items-center flex-wrap">
          <span className="text-gray-300 font-medium">
            {userData ? userData.username : 'Usuario'}
          </span>
          
          {/* Usar EmojiDisplay para mostrar el emoji */}
          {selectedEmoji && (
            <div className="ml-2">
              <EmojiDisplay 
                emoji={selectedEmoji} 
                showRemoveButton={true}
                onRemove={removeEmoji}
              />
            </div>
          )}
          
          {/* Mostrar categoría seleccionada */}
          {selectedCategory && (
            <div className="flex items-center ml-2 bg-gray-700 px-2 py-1 rounded-full text-sm">
              <span>Categoría: {selectedCategory.nombre}</span>
              <button 
                onClick={handleCategorySelect}
                className="ml-1 text-gray-400 hover:text-white"
              >
                <Tag size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mensajes de error y éxito */}
      {error && (
        <div className="bg-red-500 bg-opacity-70 p-3 rounded-lg mb-4 text-white text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-white">
            <X size={16} />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-500 bg-opacity-70 p-3 rounded-lg mb-4 text-white text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Check size={16} className="mr-2" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-white">
            <X size={16} />
          </button>
        </div>
      )}
      
      <textarea
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        placeholder="¿Qué descubriste hoy en el cosmos? (obligatorio)"
        className={`w-full p-3 rounded-lg bg-gray-700 border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-28`}
      />
      
      {/* Previsualización de imagen */}
      {mediaType === 'image' && mediaFiles.length > 0 && (
        <div className="mt-3 mb-3 relative">
          <img 
            src={mediaFiles[0].url} 
            alt="Imagen seleccionada" 
            className="rounded-lg max-h-64 w-full object-cover"
          />
          <button 
            onClick={removeFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
          <div className="text-xs text-gray-400 mt-1">
            Tipo de archivo: {mediaFiles[0].file.type || 'Desconocido'}
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
            <X size={16} />
          </button>
          <div className="text-xs text-gray-400 mt-1">
            Tipo de archivo: {mediaFiles[0].file.type || 'Desconocido'}
          </div>
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
      
      {/* Selector de categorías */}
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

      {/* Input oculto para archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
        className="hidden"
        multiple={false}
      />
      
      <div className="flex justify-between pt-3 border-t border-gray-700 mt-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleMediaButtonClick('image')}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer"
          >
            <Image size={18} className="text-blue-400" />
            <span>Imagen</span>
          </button>
          
          <button 
            onClick={() => handleMediaButtonClick('video')}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer"
          >
            <Video size={18} className="text-green-400" />
            <span>Video</span>
          </button>
          
          <button 
            onClick={handleEmojiSelect}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer"
          >
            <Smile size={18} className="text-yellow-400" />
            <span>Sentimientos</span>
          </button>
          
          <button 
            onClick={handleCategorySelect}
            className={`flex items-center space-x-2 text-sm p-2 rounded-md hover:bg-gray-700 cursor-pointer ${
              !selectedCategory ? 'text-red-400 animate-pulse' : 'text-purple-400 hover:text-white'
            }`}
          >
            <Tag size={18} />
            <span>Categoría</span>
            {!selectedCategory && <span className="text-xs text-red-400">*</span>}
          </button>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !postText.trim() || !selectedCategory}
          className={`px-4 py-2 rounded-md ${
            isSubmitting 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : (postText.trim() && selectedCategory) 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
      
      {/* Indicadores visuales para campos obligatorios */}
      <div className="mt-2 text-xs text-gray-400">
        <span className="text-red-400">*</span> Campos obligatorios: Descripción y categoría
      </div>
    </div>
  );
};

export default CreatePost;