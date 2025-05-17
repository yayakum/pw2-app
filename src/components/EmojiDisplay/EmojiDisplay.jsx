import React from 'react';
import { X } from 'lucide-react';

/**
 * Componente para mostrar un emoji con su sentimiento
 * 
 * @param {Object} emoji - Objeto con datos del emoji
 * @param {boolean} showRemoveButton - Indica si se muestra el botón para eliminar
 * @param {Function} onRemove - Función para eliminar el emoji
 * @param {string} className - Clases adicionales
 */
const EmojiDisplay = ({ emoji, showRemoveButton = false, onRemove = () => {}, className = "" }) => {
  // Si no hay emoji, no mostrar nada
  if (!emoji) return null;

  // Intentar parsear el emoji si es una cadena JSON
  let emojiData = emoji;
  if (typeof emoji === 'string') {
    try {
      emojiData = JSON.parse(emoji);
    } catch (e) {
      console.error("Error al parsear emoji:", e);
      return null;
    }
  }

  // Si después de parsear no tenemos un objeto con emoji y label, no mostrar nada
  if (!emojiData || !emojiData.emoji || !emojiData.label) return null;

  return (
    <div className={`flex items-center bg-gray-700 px-2 py-1 rounded-full text-sm ${className}`}>
      <span>se siente {emojiData.label.toLowerCase()}</span>
      <span className="ml-1">{emojiData.emoji}</span>
      
      {showRemoveButton && (
        <button 
          onClick={onRemove}
          className="ml-1 text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default EmojiDisplay;