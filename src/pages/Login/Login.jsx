import React from "react";
import { User, Lock, LogIn, Star } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Estrellas animadas (efecto simple) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-1 fixed w-2 h-2 rounded-full bg-white top-10 left-20 animate-pulse"></div>
        <div className="stars-2 fixed w-1 h-1 rounded-full bg-white top-20 left-80 animate-pulse"></div>
        <div className="stars-3 fixed w-3 h-3 rounded-full bg-white top-40 right-20 animate-pulse"></div>
        <div className="stars-4 fixed w-2 h-2 rounded-full bg-white bottom-10 right-40 animate-pulse"></div>
        <div className="stars-5 fixed w-1 h-1 rounded-full bg-white bottom-20 left-40 animate-pulse"></div>
      </div>
      
      {/* Formulario de login */}
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 bg-opacity-70 backdrop-blur-sm shadow-2xl border border-purple-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Acceso Espacial
          </h2>
          <p className="text-blue-300 mt-2">Ingresa a tu portal intergaláctico</p>
        </div>
        
        <form className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-purple-400" />
            </div>
            <input
              type="email"
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
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Contraseña estelar"
              
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-300">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-purple-400 hover:text-purple-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className=" relative w-full flex justify-center py-2 px-4 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer hover:scale-102 duration-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {/* <LogIn size={20} className="text-purple-300 group-hover:text-purple-200" /> */}
              </span>
              Iniciar viaje espacial
            </button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">¿Nuevo explorador?</span>
              </div>
            </div>
            
            <div className="mt-6">
              <a
                href="#"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg shadow-sm bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300 hover:border-purple-500"
              >
                <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">¿No tienes una cuenta? Regístrate</span>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  
};
export default Login;