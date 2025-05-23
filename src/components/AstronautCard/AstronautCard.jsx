import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const AstronautCard = ({ astronaut, isProfile = false }) => {
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(astronaut.isFollowing || false);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUserName = () => {
        return astronaut?.username || "Usuario";
    };

    // Cargar la imagen de perfil del usuario
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Si ya tenemos la imagen en el objeto astronaut, usarla
                if (astronaut.profilePic) {
                    setProfileImage(astronaut.profilePic);
                    setLoading(false);
                    return;
                }

                // Si no, hacer fetch para obtener la imagen
                const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
                const isCurrentUser = astronaut.id === parseInt(currentUserId);
                
                const url = isCurrentUser 
                    ? 'http://localhost:3000/profile'
                    : `http://localhost:3000/profile/${astronaut.id}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setProfileImage(userData.profilePic);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [astronaut.id, astronaut.profilePic]);

    // Función para manejar el seguimiento
    const handleFollow = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            
            // Usar la URL y método adecuados según el estado actual
            const url = isFollowing 
                ? `http://localhost:3000/unfollowUser/${astronaut.id}`
                : `http://localhost:3000/followUser/${astronaut.id}`;
                
            const method = isFollowing ? 'DELETE' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al seguir/dejar de seguir al usuario');
            }
            
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    // Navegar al perfil del astronauta
    const navigateToProfile = () => {
        navigate(`/Profile/${astronaut.id}`);
    };

    return (
        <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4 shadow-lg mb-3 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Avatar del usuario */}
                    <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500 cursor-pointer overflow-hidden">
                        {loading ? (
                            <div className="animate-pulse bg-gray-600 w-full h-full rounded-full"></div>
                        ) : profileImage ? (
                            <img 
                                src={`data:image/jpeg;base64,${profileImage}`}
                                alt={getUserName()}
                                className="w-full h-full object-cover rounded-full"
                                onError={() => setProfileImage(null)}
                            />
                        ) : (
                            <span className="text-white font-bold">{getUserName().charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    
                    {/* Información del usuario */}
                    <div>
                        <h3 className="font-bold text-white">{astronaut.username || 'Astronauta Cósmico'}</h3>
                        <div className="flex items-center text-sm text-gray-400">
                            <span className="mr-4">
                                Desde {astronaut.createdAt 
                                    ? new Date(astronaut.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                                    : 'marzo de 2025'}
                            </span>
                        </div>

                        {astronaut.bio && (
                            <p className="text-sm text-gray-300 mt-1">{astronaut.bio}</p>
                        )}
                    </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex space-x-2">
                    {!isProfile && (
                        <button
                            onClick={handleFollow}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isFollowing 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                        >
                            {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                        </button>
                    )}
                    
                    <button
                        onClick={navigateToProfile}
                        className="px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center"
                    >
                        <User size={14} className="mr-1" />
                        Ver perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AstronautCard;