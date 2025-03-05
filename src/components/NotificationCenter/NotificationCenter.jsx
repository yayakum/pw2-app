
import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Trash2, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Star, 
  AlertCircle 
} from "lucide-react";

// Mapa de iconos para diferentes tipos de notificaciones
const notificationIcons = {
  message: MessageCircle,
  comment: MessageCircle,
  like: Heart,
  follow: UserPlus,
  favorite: Star,
  default: AlertCircle
};

const notificationsData = [
  { id: 1, type: "message", text: "Nuevo mensaje recibido" },
  { id: 2, type: "comment", text: "Alguien comentó tu publicación" },
  { id: 3, type: "follow", text: "Nuevo seguidor" },
  { id: 4, type: "like", text: "A alguien le gustó tu post" },
  { id: 5, type: "favorite", text: "Alguien agregó tu publicación a favoritos" },
];

// Mapa de colores para diferentes tipos de notificaciones
const notificationColors = {
  message: "text-blue-400",
  comment: "text-green-400",
  like: "text-red-400",
  follow: "text-purple-400",
  favorite: "text-yellow-400",
  default: "text-gray-400"
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [isOpen, setIsOpen] = useState(false);

  const removeNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-full hover:bg-gray-700 relative cursor-pointer hover:scale-105 duration-300 transition-all"
      >
        <Bell size={24} className="text-white" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center cursor-pointer">
            {notifications.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-96 bg-gray-800 text-white rounded-xl shadow-2xl border-2 border-gray-700 overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
            <span className="font-bold text-lg">Notificaciones</span>
            <button 
              onClick={clearNotifications} 
              className="text-red-400 hover:text-red-600 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 size={16} />
              <span>Borrar todas</span>
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            <AnimatePresence>
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const NotificationIcon = notificationIcons[notification.type] || notificationIcons.default;
                  const iconColor = notificationColors[notification.type] || notificationColors.default;
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex justify-between items-center p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <NotificationIcon size={24} className={`${iconColor}`} />
                        <span className="text-sm">{notification.text}</span>
                      </div>
                      <button 
                        onClick={() => removeNotification(notification.id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No hay notificaciones
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationCenter;