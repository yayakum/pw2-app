import React, { useState } from "react";
import { User, Lock, Mail, Calendar, UploadIcon, RocketIcon } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
const backendURL = import.meta.env.VITE_BACKEND_URL;

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    // Validaciones
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }
    
    if (formData.username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }

    const allowedDomains = ['@gmail.com', '@outlook.com', '@hotmail.com'];
    const emailDomain = formData.email.toLowerCase();
    const isValidDomain = allowedDomains.some(domain => emailDomain.endsWith(domain));
    
    if (!isValidDomain) {
      setError("Solo se permiten correos de Gmail, Outlook o Hotmail");
      return;
    }

    if (formData.password.length <= 5 ) {
      setError("La contraseña debe tener más de 5 caracteres");
      return;
    }
    
    if (!/\d/.test(formData.password)) {
      setError("La contraseña debe contener al menos un número");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput.files[0]) {
        formDataToSend.append('profilePic', fileInput.files[0]);
      }
      
      const response = await fetch(`${backendURL}/register`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario");
      }
      
      setSuccessMessage(data.message || "¡Registro exitoso! Redirigiendo al inicio de sesión...");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      setPreviewImage(null);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black pt-10 pb-10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-1 fixed w-2 h-2 rounded-full bg-white top-10 left-20 animate-pulse"></div>
        <div className="stars-2 fixed w-1 h-1 rounded-full bg-white top-20 left-80 animate-pulse"></div>
        <div className="stars-3 fixed w-3 h-3 rounded-full bg-white top-40 right-20 animate-pulse"></div>
        <div className="stars-4 fixed w-2 h-2 rounded-full bg-white bottom-10 right-40 animate-pulse"></div>
        <div className="stars-5 fixed w-1 h-1 rounded-full bg-white bottom-20 left-40 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 bg-opacity-70 backdrop-blur-sm shadow-2xl border border-purple-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Registro Intergaláctico
          </h2>
          <p className="text-blue-300 mt-2">Crea tu identidad en el cosmos digital</p>

          {error && (
            <div className="mt-4 p-2 bg-red-500 bg-opacity-70 text-white rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-2 bg-green-500 bg-opacity-70 text-white rounded-md">
              {successMessage}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 flex items-center justify-center bg-gray-800">
                {previewImage ? (
                  <img src={previewImage} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-purple-400">
                    <RocketIcon width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="opacity-0 absolute inset-0 w-24 h-24 rounded-full cursor-pointer z-10" 
                onChange={handleImageChange}
              />
              <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <UploadIcon size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-purple-400" />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nombre de explorador"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-purple-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Email cósmico"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-purple-400" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Contraseña estelar"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-purple-400" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirmar contraseña estelar"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-2 px-4 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer hover:scale-102 duration-300 mt-10"
            >
              {isLoading ? "Procesando..." : "Iniciar aventura espacial"}
            </button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">¿Ya eres explorador?</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to="/"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg shadow-sm bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300 hover:border-purple-500"
              >
                <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">¿Ya tienes una cuenta? Inicia sesión</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;