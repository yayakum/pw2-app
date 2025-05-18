import React from 'react';
import AstronautCard from '../AstronautCard/AstronautCard';

const AstronautsList = ({ astronauts, loading, error, onRetry }) => {
  return (
    <div className="mb-6 p-4 rounded-lg bg-gray-800 bg-opacity-60 shadow-md">
      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {/* Manejo de errores */}
      {error && !loading && (
        <div className="bg-red-500 bg-opacity-60 p-4 rounded-lg mb-6">
          <p className="text-white">{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-white text-red-500 rounded-md hover:bg-gray-100"
            onClick={onRetry}
          >
            Intentar de nuevo
          </button>
        </div>
      )}
      
      {/* Sin resultados */}
      {!loading && !error && (!astronauts || astronauts.length === 0) && (
        <div className="p-8 rounded-lg bg-gray-700 bg-opacity-60 text-center">
          <h3 className="text-xl font-medium mb-4">No se encontraron astronautas</h3>
          <p className="text-gray-400">
            Intenta ajustar la búsqueda o busca algo diferente.
          </p>
        </div>
      )}
      
      {/* Lista de astronautas */}
{!loading && !error && astronauts && astronauts.length > 0 && (
  <div className="flex flex-col space-y-2">
    {astronauts.map(astronaut => (
      <AstronautCard 
        key={astronaut.id} 
        astronaut={astronaut} 
      />
    ))}
  </div>
)}
    </div>
  );
};

export default AstronautsList;