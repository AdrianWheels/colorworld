import React, { useState, useEffect } from 'react';
import enhancedDrawingStorage from '../services/enhancedDrawingStorage.js';
import { notify } from '../utils/notifications.js';
import '../styles/DrawingManager.css';

const DrawingManager = ({ isOpen, onClose }) => {
  const [drawings, setDrawings] = useState([]);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'theme', 'name'
  
  useEffect(() => {
    if (isOpen) {
      loadDrawings();
      loadStats();
    }
  }, [isOpen]);

  const loadDrawings = () => {
    const allDrawings = enhancedDrawingStorage.getAllColoredDrawings();
    setDrawings(allDrawings);
  };

  const loadStats = () => {
    const storageStats = enhancedDrawingStorage.getStorageStats();
    setStats(storageStats);
  };

  const handleDeleteDrawing = (drawingId) => {
    if (notify.confirm('¿Estás seguro de que quieres eliminar este dibujo?')) {
      const result = enhancedDrawingStorage.deleteDrawing(drawingId);
      if (result.success) {
        loadDrawings();
        loadStats();
        notify.success('Dibujo eliminado exitosamente');
      } else {
        notify.error('Error al eliminar el dibujo');
      }
    }
  };

  const handleExportAll = () => {
    const result = enhancedDrawingStorage.exportAllDrawings();
    if (result.success) {
      notify.success(`Exportados ${result.count} dibujos exitosamente`);
    } else {
      notify.error('Error al exportar dibujos');
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      enhancedDrawingStorage.importDrawings(file).then(result => {
        if (result.success) {
          notify.success(`Importados ${result.imported} de ${result.total} dibujos`);
          loadDrawings();
          loadStats();
        } else {
          notify.error('Error al importar dibujos');
        }
      });
    }
  };

  const handleClearAll = () => {
    if (notify.confirm('¿Estás seguro de que quieres eliminar TODOS los dibujos? Esta acción no se puede deshacer.')) {
      const result = enhancedDrawingStorage.clearAllColoredDrawings();
      if (result.success) {
        notify.success(`Eliminados ${result.deleted} dibujos`);
        loadDrawings();
        loadStats();
      } else {
        notify.error('Error al limpiar dibujos');
      }
    }
  };

  const downloadDrawing = (drawing) => {
    const link = document.createElement('a');
    link.download = `coloreveryday-${drawing.date}-${drawing.id}.png`;
    link.href = drawing.coloredImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedDrawings = [...drawings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.coloredAt) - new Date(a.coloredAt);
      case 'theme':
        return a.theme.localeCompare(b.theme);
      case 'name':
        return a.originalPrompt.localeCompare(b.originalPrompt);
      default:
        return 0;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="drawing-manager-overlay">
      <div className="drawing-manager">
        <div className="manager-header">
          <h2>🎨 Gestión de Dibujos</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {stats && (
          <div className="storage-stats">
            <div className="stat-item">
              <span className="stat-label">Dibujos:</span>
              <span className="stat-value">{stats.totalDrawings}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Almacenamiento:</span>
              <span className="stat-value">{stats.storageUsedMB} MB / {stats.maxStorageMB} MB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Uso:</span>
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ width: `${stats.usagePercentage}%` }}
                ></div>
                <span className="usage-text">{stats.usagePercentage}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="manager-controls">
          <div className="control-group">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Ordenar por fecha</option>
              <option value="theme">Ordenar por tema</option>
              <option value="name">Ordenar por nombre</option>
            </select>
            
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <option value="grid">Vista en cuadrícula</option>
              <option value="list">Vista en lista</option>
            </select>
          </div>

          <div className="action-buttons">
            <button onClick={handleExportAll} className="export-btn">
              📤 Exportar Todo
            </button>
            
            <label className="import-btn">
              📥 Importar
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportFile}
                style={{ display: 'none' }}
              />
            </label>
            
            <button onClick={handleClearAll} className="clear-btn">
              🗑️ Limpiar Todo
            </button>
          </div>
        </div>

        <div className={`drawings-container ${viewMode}`}>
          {sortedDrawings.length === 0 ? (
            <div className="no-drawings">
              <p>No hay dibujos guardados aún</p>
              <p>¡Crea tu primer dibujo y guárdalo!</p>
            </div>
          ) : (
            sortedDrawings.map((drawing) => (
              <div key={drawing.id} className="drawing-item">
                {viewMode === 'grid' ? (
                  <>
                    <div className="drawing-preview">
                      <img 
                        src={drawing.coloredImageUrl} 
                        alt={drawing.originalPrompt}
                        loading="lazy"
                      />
                    </div>
                    <div className="drawing-info">
                      <h4>{drawing.originalPrompt}</h4>
                      <p className="drawing-date">{formatDate(drawing.coloredAt)}</p>
                      <div className="drawing-actions">
                        <button 
                          onClick={() => downloadDrawing(drawing)}
                          className="download-btn"
                          title="Descargar"
                        >
                          📥
                        </button>
                        <button 
                          onClick={() => handleDeleteDrawing(drawing.id)}
                          className="delete-btn"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="list-preview">
                      <img 
                        src={drawing.coloredImageUrl} 
                        alt={drawing.originalPrompt}
                        loading="lazy"
                      />
                    </div>
                    <div className="list-info">
                      <h4>{drawing.originalPrompt}</h4>
                      <p className="drawing-meta">
                        <span>📅 {formatDate(drawing.coloredAt)}</span>
                        <span>🎨 {drawing.theme}</span>
                        {drawing.timeSpent && <span>⏱️ {Math.round(drawing.timeSpent / 1000)}s</span>}
                      </p>
                    </div>
                    <div className="list-actions">
                      <button 
                        onClick={() => downloadDrawing(drawing)}
                        className="download-btn"
                      >
                        📥 Descargar
                      </button>
                      <button 
                        onClick={() => handleDeleteDrawing(drawing.id)}
                        className="delete-btn"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawingManager;