import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, postContent }) => {
  if (!isOpen) return null;

  // Prevenir que los clics dentro del modal cierren el modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm shadow-2xl flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg w-full max-w-md p-5 border border-gray-700 shadow-lg"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <AlertTriangle size={20} className="text-red-500 mr-2" />
            Confirmar eliminación
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-2">¿Estás seguro de que deseas eliminar esta publicación?</p>
          <div className="bg-gray-700 p-3 rounded-md text-sm text-gray-300 max-h-20 overflow-y-auto">
            {postContent}
          </div>
          <p className="text-gray-400 text-sm mt-2">Esta acción no se puede deshacer.</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;