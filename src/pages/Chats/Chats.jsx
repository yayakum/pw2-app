import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Search, Edit, Trash2, Check } from 'lucide-react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { Bell, MessageSquare, ChevronDown, LogOut } from 'lucide-react';

// Simulated users data
const users = [
  { 
    id: 1, 
    name: 'Nebula Walker', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Descubrí algo increíble hoy...',
    unreadCount: 2,
    messages: [
      { id: 1, sender: 'Nebula Walker', text: 'Hola, ¿cómo estás?', timestamp: '10:30', read: true },
      { id: 2, sender: 'You', text: '¡Genial! Cuenta más.', timestamp: '10:32', read: true },
      { id: 3, sender: 'Nebula Walker', text: 'Descubrí una nueva nebulosa.', timestamp: '10:45', read: false },
      { id: 4, sender: 'Nebula Walker', text: '¿Te gustaría ver las imágenes?', timestamp: '10:46', read: false }
    ]
  },
  { 
    id: 2, 
    name: 'Stellar Nomad', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Preparando mi próximo viaje...',
    unreadCount: 1,
    messages: [
      { id: 1, sender: 'Stellar Nomad', text: 'Hey, ¿listo para la aventura?', timestamp: '09:15', read: true },
      { id: 2, sender: 'You', text: 'Siempre estoy listo!', timestamp: '09:20', read: true },
      { id: 3, sender: 'Stellar Nomad', text: 'Salimos mañana a las 6.', timestamp: '11:30', read: false }
    ]
  },
  { 
    id: 3, 
    name: 'Luna Explorer', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Nuevos datos de la misión...',
    unreadCount: 0,
    messages: [
      { id: 1, sender: 'Luna Explorer', text: 'Tengo información importante.', timestamp: '08:45', read: true },
      { id: 2, sender: 'You', text: 'Te escucho.', timestamp: '08:50', read: true }
    ]
  }
];

const Chats = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);

  // Filtrar usuarios cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        user => user.name.toLowerCase().includes(query) || 
                user.lastMessage.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery]);

  // Con flex-direction: column-reverse, el scroll automático ya está manejado
  // pero mantenemos el ref para casos donde necesitemos interactuar
  useEffect(() => {
    // Ya no necesitamos scrollIntoView con column-reverse
    // El contenedor mantiene automáticamente la posición en la parte inferior
  }, [selectedUser?.messages]);

  const handleUserSelect = (user) => {
    // Marcar todos los mensajes como leídos al abrir la conversación
    if (user) {
      const updatedUser = {...user};
      updatedUser.messages = updatedUser.messages.map(msg => ({
        ...msg,
        read: true
      }));
      updatedUser.unreadCount = 0;
      
      // Actualizar el usuario en la lista
      const updatedUsers = users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      
      // Actualizar el estado global
      setFilteredUsers(
        searchQuery.trim() === '' 
          ? updatedUsers 
          : updatedUsers.filter(u => 
              u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              u.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            )
      );
      
      setSelectedUser(updatedUser);
    } else {
      setSelectedUser(null);
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setEditingMessage(null);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedUser) {
      // Obtener la hora actual
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const timestamp = `${hours}:${minutes}`;
      
      selectedUser.messages.push({
        id: selectedUser.messages.length + 1,
        sender: 'You',
        text: messageInput.trim(),
        timestamp: timestamp,
        read: true
      });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingMessage) {
        handleSaveEdit();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (selectedUser) {
      // En lugar de eliminar el mensaje, lo marcamos como eliminado
      const updatedMessages = selectedUser.messages.map(message => 
        message.id === messageId 
          ? { ...message, deleted: true } 
          : message
      );
      
      setSelectedUser({
        ...selectedUser,
        messages: updatedMessages
      });
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && selectedUser && editingMessage) {
      const updatedMessages = selectedUser.messages.map(message =>
        message.id === editingMessage
          ? { ...message, text: editText.trim() }
          : message
      );
      
      setSelectedUser({
        ...selectedUser,
        messages: updatedMessages
      });
      
      setEditingMessage(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex flex-grow container mx-auto px-4 py-6 ">
        {/* Left Sidebar */}
        <LeftSidebar />
        
        {/* Chat Content */}
        <div className="-mb-1 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md w-max flex-grow ml-4 ">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex items-center">
            {selectedUser && (
              <button 
                onClick={handleBackToList} 
                className="mr-4 hover:bg-gray-700 rounded-full p-2 cursor-pointer"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h2 className="text-xl font-semibold">
              {selectedUser ? selectedUser.name : 'Chats'}
            </h2>
          </div>

          {/* Chat Content */}
          <div className="flex-grow overflow-hidden flex flex-col h-[500px] max-h-[500px] -mb-3">
            {!selectedUser ? (
              // User List
              <div className="p-4 h-full flex flex-col">
                {/* Buscador de chats */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-200"
                  />
                </div>
                
                <h3 className="text-lg font-medium mb-4">Exploradores</h3>
                <div className="overflow-y-auto flex-grow">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
                      >
                        <div className="relative">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-12 h-12 rounded-full mr-4" 
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800"></span>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className={`text-sm ${user.unreadCount > 0 ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                            {user.lastMessage}
                          </p>
                        </div>
                        {/* Indicador de mensajes no leídos */}
                        {user.unreadCount > 0 && (
                          <div className="flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 ml-2">
                            {user.unreadCount}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 p-4">No se encontraron resultados</p>
                  )}
                </div>
              </div>
            ) : (
              // Chat Conversation
              <div className="flex flex-col h-full">
                <div className="flex-grow overflow-y-auto p-4 flex flex-col-reverse overflow-x-hidden" style={{ scrollbarWidth: 'thin' }}>
                  <div className="space-y-3 space-y-reverse flex flex-col-reverse w-full">
                    {[...selectedUser.messages].reverse().map(message => (
                      <div 
                        key={message.id} 
                        className={`flex flex-col ${
                          message.sender === 'You' 
                            ? 'items-end' 
                            : 'items-start'
                        }`}
                      >
                        <div className="max-w-[70%]">
                          {editingMessage === message.id ? (
                            <div className="bg-gray-700 p-2 rounded-lg">
                              <input 
                                type="text" 
                                value={editText} 
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full p-1 bg-gray-600 text-white rounded border border-gray-500"
                                autoFocus
                              />
                              <div className="flex justify-end mt-2 space-x-2">
                                <button 
                                  onClick={cancelEdit}
                                  className="text-gray-400 hover:text-white"
                                >
                                  Cancelar
                                </button>
                                <button 
                                  onClick={handleSaveEdit}
                                  className="text-purple-400 hover:text-purple-300"
                                >
                                  Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className={`p-3 rounded-lg ${
                                message.deleted 
                                  ? 'bg-gray-700 bg-opacity-40 italic text-gray-400' 
                                  : message.sender === 'You'
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-gray-700 text-gray-200'
                              }`}
                            >
                              {message.deleted ? (
                                <div className="flex items-center">
                                  <span>Este mensaje ha sido eliminado</span>
                                </div>
                              ) : (
                                <div className="flex flex-col break-words">
                                  <div className="flex-grow">{message.text}</div>
                                  {/* Hora del mensaje ahora debajo del texto */}
                                  <div className="text-xs opacity-70 mt-1 text-right">
                                    {message.timestamp}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Botones de editar/eliminar debajo del mensaje y solo para mensajes propios que no están eliminados */}
                        {message.sender === 'You' && !message.deleted && !editingMessage && (
                          <div className="flex space-x-2 mt-1">
                            <button 
                              onClick={() => handleEditMessage(message)}
                              className="bg-gray-800 p-1 rounded hover:bg-gray-700 transition flex items-center space-x-1"
                            >
                              <Edit size={14} className="text-purple-400" />
                              <span className="text-xs text-purple-400">Editar</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(message.id)}
                              className="bg-gray-800 p-1 rounded hover:bg-gray-700 transition flex items-center space-x-1"
                            >
                              <Trash2 size={14} className="text-red-400" />
                              <span className="text-xs text-red-400">Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text"
                      value={editingMessage ? editText : messageInput}
                      onChange={(e) => editingMessage ? setEditText(e.target.value) : setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={editingMessage ? "Edita tu mensaje..." : "Escribe un mensaje..."}
                      className="flex-grow p-2 rounded-full bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button 
                      onClick={editingMessage ? handleSaveEdit : handleSendMessage}
                      className="bg-purple-700 hover:bg-purple-600 rounded-full p-2 cursor-pointer"
                    >
                      {editingMessage ? <Check size={20} /> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;