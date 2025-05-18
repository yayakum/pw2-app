import React, { useState, useEffect } from "react";
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
  Image
} from "lucide-react";

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
    default:
      return `Nueva notificación de ${username}`;
  }
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Función para obtener el conteo de notificaciones no leídas
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const response = await fetch('http://localhost:3000/getUnreadNotiCount', {
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
      
      const response = await fetch('http://localhost:3000/getUserNoti', {
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
      setNotifications(data.data || []);
      
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
      
      const response = await fetch(`http://localhost:3000/deleteNoti/${id}`, {
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
      
      const response = await fetch('http://localhost:3000/deleteAllNoti', {
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
      
      const response = await fetch(`http://localhost:3000/markNotiAsRead/${id}`, {
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
      
      const response = await fetch('http://localhost:3000/markAllNotiAsRead', {
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

  // Manejar clic en notificación para ir a la publicación
  const handleNotificationClick = (notification) => {
    // Si la notificación tiene un ID de publicación, navegar a ella
    if (notification.postId) {
      // Marcar como leída primero
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
      
      // Cerrar el menú de notificaciones
      setIsOpen(false);
      
      // Navegar a la publicación (implementar según la estructura de tu aplicación)
      // Por ejemplo:
      window.location.href = `/post/${notification.postId}`;
    }
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-full hover:bg-gray-700 relative cursor-pointer hover:scale-105 duration-300 transition-all"
      >
        <Bell size={24} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center cursor-pointer">
            {unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-gray-800 text-white rounded-xl shadow-2xl border-2 border-gray-700 overflow-hidden z-50"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
              <span className="font-bold text-lg">Notificaciones</span>
              <div className="flex gap-3">
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
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`flex justify-between items-center p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors ${notification.isRead ? 'opacity-70' : ''}`}
                        >
                          <div 
                            className="flex items-start space-x-3 cursor-pointer flex-1"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {/* Avatar o icono */}
                            {notification.fromUser?.profilePic ? (
                              <img 
                                src={`data:image/jpeg;base64,${notification.fromUser.profilePic}`}
                                alt={notification.fromUser.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                                <NotificationIcon size={20} className={`${iconColor}`} />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-white'}`}>
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
                              <div className="absolute right-0 mt-1 w-36 bg-gray-900 rounded-md shadow-lg border border-gray-700 z-10">
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
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <Bell size={32} className="mx-auto mb-2 text-gray-500" />
                      <p>No hay notificaciones</p>
                    </div>
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