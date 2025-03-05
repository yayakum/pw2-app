import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Search } from 'lucide-react';
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
    messages: [
      { id: 1, sender: 'Nebula Walker', text: 'Hola, ¿cómo estás?' },
      { id: 2, sender: 'You', text: '¡Genial! Cuenta más.' },
      { id: 3, sender: 'Nebula Walker', text: 'Descubrí una nueva nebulosa.' }
    ]
  },
  { 
    id: 2, 
    name: 'Stellar Nomad', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Preparando mi próximo viaje...',
    messages: [
      { id: 1, sender: 'Stellar Nomad', text: 'Hey, ¿listo para la aventura?' },
      { id: 2, sender: 'You', text: 'Siempre estoy listo!' }
    ]
  },
  { 
    id: 3, 
    name: 'Luna Explorer', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Nuevos datos de la misión...',
    messages: [
      { id: 1, sender: 'Luna Explorer', text: 'Tengo información importante.' },
      { id: 2, sender: 'You', text: 'Te escucho.' }
    ]
  }
];

const Chats = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
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
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedUser) {
      selectedUser.messages.push({
        id: selectedUser.messages.length + 1,
        sender: 'You',
        text: messageInput.trim()
      });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-gray-400">{user.lastMessage}</p>
                        </div>
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
                        className={`flex ${
                          message.sender === 'You' 
                            ? 'justify-end' 
                            : 'justify-start'
                        }`}
                      >
                        <div 
                          className={`p-3 rounded-lg max-w-[70%] ${
                            message.sender === 'You'
                              ? 'bg-purple-700 text-white'
                              : 'bg-gray-700 text-gray-200'
                          }`}
                        >
                          {message.text}
                        </div>
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
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      className="flex-grow p-2 rounded-full bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-purple-700 hover:bg-purple-600 rounded-full p-2 cursor-pointer"
                    >
                      <Send size={20} />
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