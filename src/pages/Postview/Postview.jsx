import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Header from '../../components/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import Post from '../../components/Post/Post';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const Postview = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
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

    useEffect(() => {
    const fetchPost = async () => {
    try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }
        
        if (!postId) {
            throw new Error('ID de publicación no proporcionado');
        }
        
        const response = await fetch(`${backendURL}/getPostById/${postId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Publicación no encontrada');
            }
            throw new Error('Error al obtener la publicación');
        }
        
        const postData = await response.json();
        
        const formattedPost = {
            id: postData.id,
            userId: postData.userId,
            description: postData.description,
            content: postData.content,
            contentType: postData.contentType,
            createdAt: postData.createdAt,
            usuario: postData.usuario,
            time: formatTimestamp(postData.createdAt),
            likes: postData._count?.likes || 0,
            comments: postData._count?.likes || 0,
            hasLiked: postData.hasLiked || false,
            emojiData: postData.emojiData,
            categoryId: postData.categoryId,
            categoria: postData.categoria,
            _count: postData._count,
            comentarios: postData.comentarios || []
        };
        
        setPost(formattedPost);
        
        } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };
    
    fetchPost();
    }, [postId]);

    const handlePostDelete = (deletedPostId) => {
        if (deletedPostId === post?.id) {
            navigate('/Dashboard', { 
                state: { message: 'Publicación eliminada correctamente' }
            });
        } else if (deletedPostId === "refresh") {
        window.location.reload();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
                <Header className="sticky top-0 z-10" />
                <div className="container mx-auto px-4 py-12 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="ml-4">Cargando publicación...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
            <Header className="sticky top-0 z-10" />
            <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="mb-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Volver
                </button>
                </div>
                <div className="bg-red-500 bg-opacity-70 text-white p-6 rounded-lg text-center">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">No se pudo cargar la publicación</h2>
                <p className="mb-4">{error}</p>
                <div className="flex gap-4 justify-center">
                    <button 
                    onClick={() => navigate(-1)}
                    className="bg-white text-red-500 px-4 py-2 rounded-md font-medium cursor-pointer"
                    >
                    Volver
                    </button>
                    <button 
                    onClick={() => window.location.reload()}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-gray-700"
                    >
                    Reintentar
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-gray-200 bg-fixed">
        <Header className="sticky top-0 z-10" />
        <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row relative">
            <LeftSidebar />
            <section className="w-full md:w-2/3 md:px-4">
            <div className="mb-4">
                <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                <ArrowLeft size={20} className="mr-2" />
                Volver
                </button>
            </div>
            {post && (
                <div className="max-w-2xl mx-auto">
                <Post 
                    post={post} 
                    onDelete={handlePostDelete}
                />
                </div>
            )}
            </section>
        </main>
        </div>
    );
};

export default Postview;