import { useState } from 'react';
import '../styles/DrawingHistory.css';

const DrawingHistory = ({ coloredDrawings }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!coloredDrawings || coloredDrawings.length === 0) {
    return (
      <div className="drawing-history">
        <h3>Historial de Dibujos</h3>
        <p className="no-drawings">No hay dibujos coloreados aún. ¡Crea tu primer dibujo!</p>
      </div>
    );
  }

  const getColoredDrawings = () => {
    const colored = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('colored_')) {
        const date = key.replace('colored_', '');
        const drawing = JSON.parse(localStorage.getItem(key));
        colored.push({ date, ...drawing });
      }
    }
    return colored.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadDrawing = (imageUrl, date) => {
    const link = document.createElement('a');
    link.download = `colorworld-${date}.png`;
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const historyDrawings = getColoredDrawings();
  const displayDrawings = isExpanded ? historyDrawings : historyDrawings.slice(0, 3);

  return (
    <div className="drawing-history">
      <div className="history-header">
        <h3>Historial de Dibujos</h3>
        <span className="drawing-count">
          {historyDrawings.length} dibujo{historyDrawings.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="drawings-grid">
        {displayDrawings.map((drawing, index) => (
          <div key={`${drawing.date}-${index}`} className="drawing-card">
            <div className="drawing-image">
              <img 
                src={drawing.coloredImageUrl} 
                alt={`Dibujo del ${formatDate(drawing.date)}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="image-placeholder" style={{ display: 'none' }}>
                🎨
              </div>
            </div>
            
            <div className="drawing-info">
              <h4>{formatDate(drawing.date)}</h4>
              <p className="drawing-prompt">
                {drawing.originalPrompt || 'Dibujo coloreado'}
              </p>
              <div className="drawing-actions">
                <button 
                  className="download-btn"
                  onClick={() => downloadDrawing(drawing.coloredImageUrl, drawing.date)}
                  title="Descargar dibujo"
                >
                  📥
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {historyDrawings.length > 3 && (
        <button 
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Ver menos' : `Ver todos (${historyDrawings.length})`}
        </button>
      )}
    </div>
  );
};

export default DrawingHistory;