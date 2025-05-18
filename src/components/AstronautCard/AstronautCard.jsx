import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Star } from 'lucide-react';

const AstronautCard = ({ astronaut, isProfile = false }) => {
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(astronaut.isFollowing || false);

    // Función para manejar el seguimiento
    const handleFollow = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            const response = await fetch(`http://localhost:3000/followUser/${astronaut.id}`, {
                method: 'POST',
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

    // Obtener iniciales para usar como avatar si no hay imagen
    const getInitials = (username) => {
        return username ? username.charAt(0).toUpperCase() : 'A';
    };

    return (
        <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4 shadow-lg mb-3 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Avatar con color fijo */}
                    {astronaut.profilePic ? (
                        <img 
                            src={`data:image/jpeg;base64,${astronaut.profilePic}`} 
                            alt={`${astronaut.username || 'Astronauta'}`} 
                            className="w-12 h-12 rounded-full"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500">
                            <span className="text-white font-bold">{getInitials(astronaut.username)}</span>
                        </div>
                    )}
                    
                    {/* Información del usuario */}
                    <div>
                        <h3 className="font-bold text-white">{astronaut.username || 'Astronauta Cósmico'}</h3>
                        <div className="flex items-center text-sm text-gray-400">
                            <span className="mr-4">
                                Desde {astronaut.createdAt 
                                    ? new Date(astronaut.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                                    : 'marzo de 2025'}
                            </span>
                            
                            {astronaut.followers !== undefined && (
                                <div className="flex items-center">
                                    <Star size={14} className="text-yellow-400 mr-1" />
                                    <span>
                                        {astronaut.followers} {astronaut.followers === 1 ? 'seguidor' : 'seguidores'}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Bio si existe */}
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
                            {isFollowing ? 'Siguiendo' : 'Seguir'}
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