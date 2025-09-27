import React from 'react';
import '../styles/GeminiGenerator.css';

const GeminiGenerator = ({ 
  onGenerate, 
  isGenerating = false,
  selectedDate 
}) => {
  const handleGenerate = () => {
    onGenerate(selectedDate);
  };

  return (
    <div className="gemini-generator">
      <div className="generator-content">
        <h3 className="generator-title">🤖 Generador con IA</h3>
        <p className="generator-description">
          Genera un animal único para colorear usando Gemini AI
        </p>
        
        <button 
          onClick={handleGenerate}
          className="gemini-btn"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="loading-spinner">🔄</span>
              Generando con IA...
            </>
          ) : (
            <>
              🎨 Generar Animal para Colorear
            </>
          )}
        </button>
        
        {isGenerating && (
          <div className="generating-status">
            <div className="status-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Creando tu animal personalizado...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiGenerator;