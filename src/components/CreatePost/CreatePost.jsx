import React from 'react';

const CreatePost = () => {
  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src="/api/placeholder/50/50"
          alt="User avatar"
          className="w-12 h-12 rounded-full border-2 border-purple-500"
        />
        <span className="text-gray-300 font-medium">Nombre de Usuario</span>
      </div>
      <textarea
        placeholder="¿Qué descubriste hoy en el cosmos?"
        className="w-full p-3 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600  min-h-28"
      />
      <div className="flex justify-between pt-3 border-t border-gray-700 mt-4">
        <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
          </svg>
          <span>Imagen</span>
        </button>
        <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Video</span>
        </button>
        <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 cursor-pointer">
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sentimientos</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
