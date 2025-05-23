import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Search, Edit, Trash2, Check, Users, MessageSquare } from 'lucide-react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
const backendURL = import.meta.env.VITE_BACKEND_URL;

const Chats = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' o 'contacts'
  
  // Obtener datos del usuario del localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user ? user.id : null;
  const token = localStorage.getItem('token');

  // Redirigir al login si no hay usuario autenticado
  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Inicializar conexión Socket.IO
  useEffect(() => {
    if (!userId || !token) return;

    const newSocket = io(`${backendURL}`, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Conectado al servidor Socket.IO');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Error de conexión:', err.message);
    });

    newSocket.on('receive_message', (message) => {
      // Si el mensaje es de/para el usuario seleccionado actualmente
      if (selectedUser && 
         (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
        setMessages((prevMessages) => [...prevMessages, message]);
        
        // Si el mensaje es recibido, marcarlo como leído
        if (message.senderId === selectedUser.id) {
          newSocket.emit('mark_messages_read', { senderId: selectedUser.id });
        }
      }
      
      // Actualizar la lista de conversaciones
      fetchConversations();
    });

    newSocket.on('message_updated', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    });

    newSocket.on('message_deleted', ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== parseInt(messageId))
      );
    });

    newSocket.on('user_status', ({ userId, online }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: online }));
    });

    newSocket.on('error', (error) => {
      console.error('Error del servidor:', error.message);
      // Aquí podrías mostrar una notificación al usuario
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, token, selectedUser]);

  // Obtener conversaciones
  const fetchConversations = async () => {
    if (!userId || !token) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${backendURL}/getUserConversations`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error('Error al obtener conversaciones');
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener seguidores
  const fetchFollowers = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${backendURL}/getUserFollowers/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error('Error al obtener seguidores: ' + (errorData.error || response.statusText));
      }
      
      const data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        const formattedFollowers = data.data.map(item => ({
          id: item.seguidor.id,
          name: item.seguidor.username,
          avatar: item.seguidor.profilePic 
            ? `data:image/jpeg;base64,${item.seguidor.profilePic}` 
            : '/api/placeholder/40/40',
          bio: item.seguidor.bio || 'Sin biografía',
          isFollowing: item.seguidor.isFollowing,
        }));
        
        setFollowers(formattedFollowers);
      }
    } catch (error) {
      console.error('Error al obtener seguidores:', error);
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener seguidos
  const fetchFollowing = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${backendURL}/getUserFollowing/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error('Error al obtener seguidos: ' + (errorData.error || response.statusText));
      }
      
      const data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        const formattedFollowing = data.data.map(item => ({
          id: item.seguido.id,
          name: item.seguido.username,
          avatar: item.seguido.profilePic 
            ? `data:image/jpeg;base64,${item.seguido.profilePic}` 
            : '/api/placeholder/40/40',
          bio: item.seguido.bio || 'Sin biografía',
          isFollowing: true,
        }));
        
        setFollowing(formattedFollowing);
      }
    } catch (error) {
      console.error('Error al obtener seguidos:', error);
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (userId && token) {
      fetchConversations();
      fetchFollowers();
      fetchFollowing();
    }
  }, [userId]);

  // Combinar seguidores y seguidos para la lista de contactos
  useEffect(() => {
    const combined = [...followers, ...following];
    // Eliminar duplicados (un usuario puede ser seguidor y seguido)
    const uniqueUsers = combined.filter((user, index, self) =>
      index === self.findIndex(u => u.id === user.id)
    );
    
    // Filtrar para excluir usuarios que ya están en las conversaciones
    const contactsWithoutConversations = uniqueUsers.filter(contact => 
      !conversations.some(conv => conv.id === contact.id)
    );
    
    setFilteredItems(contactsWithoutConversations);
  }, [followers, following, conversations]);

  // Filtrar usuarios o conversaciones según la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') return;
    
    if (activeTab === 'conversations') {
      const filtered = conversations.filter(conv => 
        conv.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // No actualizamos aquí porque usaremos el filtro directamente en el renderizado
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = filteredItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.bio && item.bio.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, activeTab]);

  // Obtener mensajes de una conversación
  const fetchMessages = async (otherUserId, page = 1) => {
    if (!userId || !token) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${backendURL}/getConversationMessages/${otherUserId}?page=${page}&limit=20`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error('Error al obtener mensajes');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        // Primer carga: reemplazar mensajes
        setMessages(data.data.reverse()); // Revertimos para mostrar los más antiguos primero
      } else {
        // Carga más mensajes: añadir al principio
        setMessages(prev => [...data.data.reverse(), ...prev]);
      }
      
      setTotalPages(data.pagination.pages);
      setCurrentPage(data.pagination.page);
      
      // Marcar mensajes como leídos
      if (socket && otherUserId) {
        socket.emit('mark_messages_read', { senderId: otherUserId });
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un usuario para chatear
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCurrentPage(1);
    fetchMessages(user.id, 1);
  };

  // Regresar a la lista de conversaciones/contactos
  const handleBackToList = () => {
    setSelectedUser(null);
    setEditingMessage(null);
    setMessages([]);
  };

  // Enviar un mensaje
  const handleSendMessage = () => {
    if (messageInput.trim() && selectedUser && socket) {
      socket.emit('send_message', {
        receiverId: selectedUser.id,
        content: messageInput.trim()
      });
      
      setMessageInput('');
    }
  };

  // Manejar pulsación de Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingMessage) {
        handleSaveEdit();
      } else {
        handleSendMessage();
      }
    }
  };

  // Eliminar un mensaje
  const handleDeleteMessage = (messageId) => {
    if (socket) {
      socket.emit('delete_message', { messageId });
    }
  };

  // Editar un mensaje
  const handleEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditText(message.content);
  };

  // Guardar edición de mensaje
  const handleSaveEdit = () => {
    if (editText.trim() && socket && editingMessage) {
      socket.emit('edit_message', {
        messageId: editingMessage,
        content: editText.trim()
      });
      
      setEditingMessage(null);
      setEditText('');
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  // Cargar más mensajes antiguos
  const loadMoreMessages = () => {
    if (selectedUser && currentPage < totalPages) {
      fetchMessages(selectedUser.id, currentPage + 1);
    }
  };

  // Auto-scroll al enviar mensajes
  useEffect(() => {
    if (messages.length > 0 && currentPage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
      <Header />
      
      <div className="flex flex-grow container mx-auto px-4 py-6">
        <LeftSidebar />
        
        <div className="-mb-1 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md w-max flex-grow ml-4">
          <div className="p-4 border-b border-gray-700 flex items-center">
            {selectedUser ? (
              <>
                <button 
                  onClick={handleBackToList} 
                  className="mr-4 hover:bg-gray-700 rounded-full p-2 cursor-pointer"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-semibold flex items-center">
                  <span>{selectedUser.name}</span>
                  <span className={`ml-2 h-2 w-2 rounded-full ${
                    onlineUsers[selectedUser.id] ? 'bg-green-500' : 'bg-gray-500'
                  }`}></span>
                </h2>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Mensajes</h2>
                <div className="ml-auto flex">
                  <button 
                    onClick={() => setActiveTab('conversations')}
                    className={`flex items-center px-3 py-1 rounded-l-lg ${
                      activeTab === 'conversations'
                        ? 'bg-purple-700'
                        : 'bg-gray-700'
                    }`}
                  >
                    <MessageSquare size={16} className="mr-1" />
                    <span>Chats</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('contacts')}
                    className={`flex items-center px-3 py-1 rounded-r-lg ${
                      activeTab === 'contacts'
                        ? 'bg-purple-700'
                        : 'bg-gray-700'
                    }`}
                  >
                    <Users size={16} className="mr-1" />
                    <span>Contactos</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex-grow overflow-hidden flex flex-col h-[500px] max-h-[500px] -mb-3">
            {!selectedUser ? (
              // Lista de Conversaciones o Contactos
              <div className="p-4 h-full flex flex-col">
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder={activeTab === 'conversations' 
                      ? "Buscar en conversaciones..." 
                      : "Buscar contactos..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-200"
                  />
                </div>
                
                <div className="overflow-y-auto flex-grow">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : activeTab === 'conversations' ? (
                    // Pestaña de conversaciones
                    conversations.length > 0 ? (
                      // Filtrar conversaciones según la búsqueda
                      conversations
                        .filter(conv => 
                          searchQuery === '' || 
                          conv.username.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(conv => (
                          <div 
                            key={conv.id} 
                            className="flex items-center p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
                            onClick={() => handleUserSelect({
                              id: conv.id,
                              name: conv.username,
                              avatar: conv.profilePic ? `data:image/jpeg;base64,${conv.profilePic}` : '/api/placeholder/40/40'
                            })}
                          >
                            <div className="relative">
                              <img 
                                src={conv.profilePic ? `data:image/jpeg;base64,${conv.profilePic}` : '/api/placeholder/40/40'} 
                                alt={conv.username} 
                                className="w-12 h-12 rounded-full mr-4" 
                              />
                              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                onlineUsers[conv.id] ? 'bg-green-500' : 'bg-gray-500'
                              } border-2 border-gray-800`}></span>
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h4 className="font-semibold">{conv.username}</h4>
                                <span className="text-xs text-gray-400">
                                  {new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-400 truncate max-w-[200px]">
                                  {conv.lastMessage}
                                </p>
                                {conv.unreadCount > 0 && (
                                  <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center mt-4">
                        <p className="text-gray-400 mb-4">No tienes conversaciones aún</p>
                        <button 
                          onClick={() => setActiveTab('contacts')} 
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                        >
                          Iniciar una nueva conversación
                        </button>
                      </div>
                    )
                  ) : (
                    // Pestaña de contactos (seguidores y seguidos)
                    filteredItems.length > 0 ? (
                      filteredItems
                        .filter(item => 
                          searchQuery === '' || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.bio && item.bio.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
                            onClick={() => handleUserSelect(item)}
                          >
                            <div className="relative">
                              <img 
                                src={item.avatar} 
                                alt={item.name} 
                                className="w-12 h-12 rounded-full mr-4" 
                              />
                              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                onlineUsers[item.id] ? 'bg-green-500' : 'bg-gray-500'
                              } border-2 border-gray-800`}></span>
                            </div>
                            
                            <div className="flex-grow">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-gray-400">
                                {item.bio || 'Sin biografía'}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-gray-400 p-4">
                        No se encontraron contactos. Sigue a más usuarios para chatear con ellos.
                      </p>
                    )
                  )}
                </div>
              </div>
            ) : (
              // Chat Conversation
              <div className="flex flex-col h-full">
                {currentPage < totalPages && (
                  <div className="text-center p-2">
                    <button 
                      onClick={loadMoreMessages}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      Cargar mensajes anteriores
                    </button>
                  </div>
                )}
                
                <div className="flex-grow overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
                  {loading && currentPage > 1 ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : null}
                  
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex flex-col ${
                          message.senderId === userId 
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
                                message.senderId === userId
                                  ? 'bg-purple-700 text-white'
                                  : 'bg-gray-700 text-gray-200'
                              }`}
                            >
                              <div className="flex flex-col break-words">
                                <div className="flex-grow">{message.content}</div>
                                <div className="text-xs opacity-70 mt-1 text-right flex items-center justify-end">
                                  <span>{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  {message.senderId === userId && (
                                    <span className="ml-1">{message.isRead ? '✓✓' : '✓'}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Botones de editar/eliminar para mensajes propios */}
                        {/* {message.senderId === userId && !editingMessage && (
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
                        )} */}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquare size={48} className="mb-2 opacity-50" />
                      <p>No hay mensajes aún</p>
                      <p className="text-sm">¡Envía el primer mensaje!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
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