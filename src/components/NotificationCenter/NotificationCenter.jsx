import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Trash2, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Star, 
  AlertCircle,
  MoreVertical,
  Check,
  CheckCheck,
  Image,
  Volume2,
  VolumeX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';

const backendURL = import.meta.env.VITE_BACKEND_URL;

// Mapa de iconos para diferentes tipos de notificaciones
const notificationIcons = {
  message: MessageCircle,
  comment: MessageCircle,
  like: Heart,
  follow: UserPlus,
  new_post: Image,
  favorite: Star,
  default: AlertCircle
};

// Mapa de colores para diferentes tipos de notificaciones
const notificationColors = {
  message: "text-blue-400",
  comment: "text-green-400",
  like: "text-red-400",
  follow: "text-purple-400",
  new_post: "text-blue-400",
  favorite: "text-yellow-400",
  default: "text-gray-400"
};

// Función para formatear el tiempo de notificación
const formatNotificationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }
};

// Función para generar texto de notificación basado en el tipo
const getNotificationText = (notification) => {
  const username = notification.fromUser?.username || "Alguien";
  
  switch (notification.type) {
    case 'like':
      return `A ${username} le gustó tu publicación`;
    case 'comment':
      return `${username} comentó en tu publicación`;
    case 'follow':
      return `${username} comenzó a seguirte`;
    case 'new_post':
      return `${username} hizo una nueva publicación`;
    case 'message':
      return `${username} te envió un mensaje`;
    default:
      return `Nueva notificación de ${username}`;
  }
};

// Función para reproducir sonido de notificación
const playNotificationSound = () => {
  try {
    // Crear un sonido simple usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('No se pudo reproducir el sonido de notificación');
  }
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImages, setProfileImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [socket, setSocket] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newNotifications, setNewNotifications] = useState(new Set()); // Para trackear notificaciones nuevas
  const bellRef = useRef(null);

  // Configurar Socket.IO para notificaciones en tiempo real
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(backendURL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Conectado para notificaciones en tiempo real');
    });

    // Escuchar nuevas notificaciones con animaciones mejoradas
    newSocket.on('new_notification', (notificationData) => {
      console.log('Nueva notificación recibida:', notificationData);
      
      // Animar el icono de la campana
      if (bellRef.current) {
        bellRef.current.style.animation = 'none';
        bellRef.current.offsetHeight; // Trigger reflow
        bellRef.current.style.animation = 'bellShake 0.5s ease-in-out';
      }
      
      // Reproducir sonido si está habilitado
      if (soundEnabled) {
        playNotificationSound();
      }
      
      // Actualizar el contador de notificaciones no leídas
      setUnreadCount(prev => prev + 1);
      
      // Si el panel está abierto, refrescar las notificaciones
      if (isOpen) {
        fetchNotifications();
      }
      
      // Marcar como nueva notificación para animación especial
      if (notificationData.id) {
        setNewNotifications(prev => new Set(prev).add(notificationData.id));
        // Remover la marca después de 3 segundos
        setTimeout(() => {
          setNewNotifications(prev => {
            const newSet = new Set(prev);
            newSet.delete(notificationData.id);
            return newSet;
          });
        }, 3000);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor de notificaciones');
    });

    newSocket.on('error', (error) => {
      console.error('Error en socket de notificaciones:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen, soundEnabled]);

  // CSS para la animación de la campana
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bellShake {
        0%, 100% { transform: rotate(0deg); }
        10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
        20%, 40%, 60%, 80% { transform: rotate(10deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Cargar el conteo de notificaciones no leídas al iniciar
  useEffect(() => {
    fetchUnreadCount();
    
    // Actualizar el conteo cada minuto
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Cargar notificaciones cuando se abre el panel
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Función para cargar la imagen de perfil de un usuario específico
  const fetchUserProfileImage = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Marcar como cargando
      setLoadingImages(prev => ({ ...prev, [userId]: true }));

      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const isCurrentUser = parseInt(userId) === parseInt(currentUserId);
      
      const url = isCurrentUser 
        ? `${backendURL}/profile`
        : `${backendURL}/profile/${userId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setProfileImages(prev => ({
          ...prev,
          [userId]: userData.profilePic
        }));
        return userData.profilePic;
      }
    } catch (error) {
      console.error('Error fetching user profile image:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [userId]: false }));
    }
    return null;
  };

  // Función para manejar errores de imagen
  const handleImageError = (userId) => {
    setProfileImages(prev => ({ ...prev, [userId]: null }));
  };

  // Función para obtener el conteo de notificaciones no leídas
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const response = await fetch(`${backendURL}/getUnreadNotiCount`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener notificaciones no leídas');
      }
      
      const data = await response.json();
      setUnreadCount(data.unreadCount);
      
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Función para obtener las notificaciones
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${backendURL}/getUserNoti`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener notificaciones');
      }
      
      const data = await response.json();
      const notificationsData = data.data || [];
      setNotifications(notificationsData);
      
      // Cargar imágenes de perfil para cada usuario de las notificaciones
      const uniqueUserIds = [...new Set(
        notificationsData
          .map(notification => notification.fromUserId || notification.fromUser?.id)
          .filter(Boolean)
      )];
      
      for (const userId of uniqueUserIds) {
        if (userId && !profileImages[userId]) {
          fetchUserProfileImage(userId);
        }
      }
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una notificación
  const removeNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Optimistic UI update
      setNotifications(notifications.filter((notification) => notification.id !== id));
      setOpenMenuId(null);
      
      const response = await fetch(`${backendURL}/deleteNoti/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Revertir el cambio si hay error
        fetchNotifications();
        throw new Error('Error al eliminar la notificación');
      }
      
      // Actualizar el conteo
      fetchUnreadCount();
      
    } catch (err) {
      console.error('Error removing notification:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Función para eliminar todas las notificaciones
  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Optimistic UI update
      setNotifications([]);
      
      const response = await fetch(`${backendURL}/deleteAllNoti`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Revertir el cambio si hay error
        fetchNotifications();
        throw new Error('Error al eliminar todas las notificaciones');
      }
      
      // Actualizar el conteo
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Error clearing notifications:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Función para marcar una notificación como leída
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Optimistic UI update
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      setOpenMenuId(null);
      
      const response = await fetch(`${backendURL}/markNotiAsRead/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Revertir el cambio si hay error
        fetchNotifications();
        throw new Error('Error al marcar como leída');
      }
      
      // Actualizar el conteo
      fetchUnreadCount();
      
    } catch (err) {
      console.error('Error marking notification as read:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Optimistic UI update
      setNotifications(
        notifications.map((notification) => ({ ...notification, isRead: true }))
      );
      
      const response = await fetch(`${backendURL}/markAllNotiAsRead`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Revertir el cambio si hay error
        fetchNotifications();
        throw new Error('Error al marcar todas como leídas');
      }
      
      // Actualizar el conteo
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Error marking all as read:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Función para alternar el menú
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Manejar clic en notificación para navegar según el tipo
  const handleNotificationClick = (notification) => {
    // Marcar como leída primero si no está leída
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Cerrar el menú de notificaciones
    setIsOpen(false);
    
    // Navegar según el tipo de notificación
    switch (notification.type) {
      case 'message':
        // Navegar al chat con el usuario que envió el mensaje
        if (notification.fromUserId) {
          navigate('/chats', { 
            state: { 
              selectedUserId: notification.fromUserId,
              selectedUsername: notification.fromUser?.username 
            }
          });
        }
        break;
      case 'like':
      case 'comment':
      case 'new_post':
        // Navegar a la publicación si existe
        if (notification.postId) {
          navigate(`/post/${notification.postId}`);
        }
        break;
      case 'follow':
        // Navegar al perfil del usuario
        if (notification.fromUserId) {
          navigate(`/profile/${notification.fromUserId}`);
        }
        break;
      default:
        console.log('Tipo de notificación no manejado:', notification.type);
    }
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-full hover:bg-gray-700 relative cursor-pointer hover:scale-105 duration-300 transition-all"
      >
        <Bell 
          ref={bellRef}
          size={24} 
          className="text-white" 
        />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center cursor-pointer"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-gray-800 text-white rounded-xl shadow-2xl border-2 border-gray-700 overflow-hidden z-50"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
              <span className="font-bold text-lg">Notificaciones</span>
              <div className="flex gap-3 items-center">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1 rounded transition-colors ${soundEnabled ? 'text-blue-400 hover:text-blue-600' : 'text-gray-500 hover:text-gray-400'}`}
                  title={soundEnabled ? 'Silenciar notificaciones' : 'Activar sonido'}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button 
                  onClick={markAllAsRead} 
                  className="text-blue-400 hover:text-blue-600 transition-colors flex items-center space-x-1 cursor-pointer"
                  disabled={loading || notifications.length === 0}
                >
                  <CheckCheck size={16} />
                  <span>Marcar</span>
                </button>
                <button 
                  onClick={clearNotifications} 
                  className="text-red-400 hover:text-red-600 transition-colors flex items-center space-x-1 cursor-pointer"
                  disabled={loading || notifications.length === 0}
                >
                  <Trash2 size={16} />
                  <span>Borrar</span>
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-gray-400">Cargando notificaciones...</p>
                </div>
              )}
              
              {error && (
                <div className="p-4 text-center text-red-400">
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <p>{error}</p>
                  <button 
                    onClick={fetchNotifications}
                    className="mt-2 px-4 py-1 bg-gray-700 rounded-md text-white hover:bg-gray-600"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              
              {!loading && !error && (
                <AnimatePresence>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const NotificationIcon = notificationIcons[notification.type] || notificationIcons.default;
                      const iconColor = notificationColors[notification.type] || notificationColors.default;
                      const notificationText = getNotificationText(notification);
                      const isNew = newNotifications.has(notification.id);
                      
                      // Obtener el userId del fromUser
                      const fromUserId = notification.fromUserId || notification.fromUser?.id;
                      const userProfileImage = profileImages[fromUserId];
                      const isLoadingImage = loadingImages[fromUserId];
                      const userName = notification.fromUser?.username || "Usuario";
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            backgroundColor: isNew ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                          }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className={`flex justify-between items-center p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors ${notification.isRead ? 'opacity-70' : ''} ${isNew ? 'border-l-4 border-blue-500' : ''}`}
                        >
                          <div 
                            className="flex items-start space-x-3 cursor-pointer flex-1"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {/* Avatar del usuario */}
                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-600 relative">
                              {isLoadingImage ? (
                                <div className="animate-pulse bg-gray-600 w-full h-full rounded-full"></div>
                              ) : userProfileImage ? (
                                <img 
                                  src={`data:image/jpeg;base64,${userProfileImage}`}
                                  alt={userName}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={() => handleImageError(fromUserId)}
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-purple-900 flex items-center justify-center border border-purple-500">
                                  {fromUserId ? (
                                    <span className="text-white font-bold text-sm">
                                      {userName.charAt(0).toUpperCase()}
                                    </span>
                                  ) : (
                                    <NotificationIcon size={20} className={`${iconColor}`} />
                                  )}
                                </div>
                              )}
                              {/* Indicador de nueva notificación */}
                              {isNew && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                                />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-white'} ${isNew ? 'font-semibold' : ''}`}>
                                {notificationText}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatNotificationTime(notification.createdAt)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(notification.id)} 
                              className="text-gray-400 hover:text-white transition-colors cursor-pointer rounded-full p-1 hover:bg-gray-600"
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            {openMenuId === notification.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-0 mt-1 w-36 bg-gray-900 rounded-md shadow-lg border border-gray-700 z-10"
                              >
                                {!notification.isRead && (
                                  <button 
                                    onClick={() => markAsRead(notification.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-blue-400 flex items-center gap-2"
                                  >
                                    <Check size={14} />
                                    Marcar leída
                                  </button>
                                )}
                                <button 
                                  onClick={() => removeNotification(notification.id)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400 flex items-center gap-2"
                                >
                                  <Trash2 size={14} />
                                  Eliminar
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center text-gray-400"
                    >
                      <Bell size={32} className="mx-auto mb-2 text-gray-500" />
                      <p>No hay notificaciones</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;