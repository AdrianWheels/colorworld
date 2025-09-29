// Enhanced Drawing Storage Service for Frontend-Only Mode
// Provides local storage with better organization and export capabilities

class EnhancedDrawingStorage {
  constructor() {
    this.STORAGE_KEY_PREFIX = 'coloreveryday_';
    this.COLORED_DRAWINGS_KEY = 'colored_drawings';
    this.DRAWING_HISTORY_KEY = 'drawing_history';
    this.USER_SETTINGS_KEY = 'user_settings';
    this.MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit
    this.MAX_DRAWINGS = 100; // Maximum number of drawings to keep
  }

  // Get storage usage in bytes
  getStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        totalSize += localStorage[key].length;
      }
    }
    return totalSize;
  }

  // Clean old drawings if storage is getting full
  cleanupOldDrawings() {
    const allDrawings = this.getAllColoredDrawings();
    if (allDrawings.length > this.MAX_DRAWINGS) {
      // Keep only the most recent MAX_DRAWINGS
      const sortedDrawings = allDrawings.sort((a, b) => new Date(b.coloredAt) - new Date(a.coloredAt));
      const toKeep = sortedDrawings.slice(0, this.MAX_DRAWINGS);
      
      // Clear all and save only the ones to keep
      this.clearAllColoredDrawings();
      toKeep.forEach(drawing => this.saveColoredDrawing(drawing, false));
      
      console.log(`🧹 Limpieza automática: manteniendo ${toKeep.length} dibujos más recientes`);
    }
  }

  // Save colored drawing with enhanced metadata
  saveColoredDrawing(drawingData, autoCleanup = true) {
    try {
      if (autoCleanup && this.getStorageUsage() > this.MAX_STORAGE_SIZE * 0.8) {
        this.cleanupOldDrawings();
      }

      const drawingInfo = {
        id: drawingData.id || `drawing_${Date.now()}`,
        date: drawingData.date || new Date().toISOString().split('T')[0],
        coloredAt: drawingData.coloredAt || new Date().toISOString(),
        originalPrompt: drawingData.originalPrompt || 'Dibujo personalizado',
        coloredImageUrl: drawingData.coloredImageUrl,
        theme: drawingData.theme || 'General',
        brushStrokes: drawingData.brushStrokes || 0,
        timeSpent: drawingData.timeSpent || 0,
        version: '2.0'
      };

      const storageKey = `${this.STORAGE_KEY_PREFIX}${this.COLORED_DRAWINGS_KEY}_${drawingInfo.id}`;
      localStorage.setItem(storageKey, JSON.stringify(drawingInfo));
      
      // Update drawing history index
      this.updateDrawingHistory(drawingInfo);
      
      console.log(`💾 Dibujo guardado: ${drawingInfo.id}`);
      return { success: true, id: drawingInfo.id };
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.cleanupOldDrawings();
        // Try again after cleanup
        try {
          const storageKey = `${this.STORAGE_KEY_PREFIX}${this.COLORED_DRAWINGS_KEY}_${drawingData.id}`;
          localStorage.setItem(storageKey, JSON.stringify(drawingData));
          return { success: true, id: drawingData.id };
        } catch {
          return { success: false, error: 'Almacenamiento lleno. Elimina algunos dibujos antiguos.' };
        }
      }
      console.error('Error guardando dibujo:', error);
      return { success: false, error: error.message };
    }
  }

  // Update drawing history index for fast retrieval
  updateDrawingHistory(drawingInfo) {
    try {
      const historyKey = `${this.STORAGE_KEY_PREFIX}${this.DRAWING_HISTORY_KEY}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Remove existing entry if updating
      const existingIndex = history.findIndex(item => item.id === drawingInfo.id);
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }
      
      // Add new entry at the beginning
      history.unshift({
        id: drawingInfo.id,
        date: drawingInfo.date,
        coloredAt: drawingInfo.coloredAt,
        originalPrompt: drawingInfo.originalPrompt,
        theme: drawingInfo.theme
      });
      
      // Keep only recent entries in history
      const limitedHistory = history.slice(0, this.MAX_DRAWINGS);
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      
    } catch (error) {
      console.warn('Error actualizando historial:', error);
    }
  }

  // Get all colored drawings
  getAllColoredDrawings() {
    const drawings = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.STORAGE_KEY_PREFIX}${this.COLORED_DRAWINGS_KEY}_`)) {
          const drawing = JSON.parse(localStorage.getItem(key));
          drawings.push(drawing);
        }
      }
      return drawings.sort((a, b) => new Date(b.coloredAt) - new Date(a.coloredAt));
    } catch (error) {
      console.error('Error obteniendo dibujos:', error);
      return [];
    }
  }

  // Get drawings by date range
  getDrawingsByDateRange(startDate, endDate) {
    const allDrawings = this.getAllColoredDrawings();
    return allDrawings.filter(drawing => {
      const drawingDate = new Date(drawing.date);
      return drawingDate >= startDate && drawingDate <= endDate;
    });
  }

  // Get drawing by ID
  getDrawingById(drawingId) {
    try {
      const storageKey = `${this.STORAGE_KEY_PREFIX}${this.COLORED_DRAWINGS_KEY}_${drawingId}`;
      const drawingData = localStorage.getItem(storageKey);
      return drawingData ? JSON.parse(drawingData) : null;
    } catch (error) {
      console.error('Error obteniendo dibujo:', error);
      return null;
    }
  }

  // Delete drawing
  deleteDrawing(drawingId) {
    try {
      const storageKey = `${this.STORAGE_KEY_PREFIX}${this.COLORED_DRAWINGS_KEY}_${drawingId}`;
      localStorage.removeItem(storageKey);
      
      // Remove from history
      const historyKey = `${this.STORAGE_KEY_PREFIX}${this.DRAWING_HISTORY_KEY}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const updatedHistory = history.filter(item => item.id !== drawingId);
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      
      console.log(`🗑️ Dibujo eliminado: ${drawingId}`);
      return { success: true };
    } catch (error) {
      console.error('Error eliminando dibujo:', error);
      return { success: false, error: error.message };
    }
  }

  // Export all drawings as JSON
  exportAllDrawings() {
    try {
      const allDrawings = this.getAllColoredDrawings();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalDrawings: allDrawings.length,
        drawings: allDrawings,
        version: '2.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `coloreveryday-drawings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      return { success: true, count: allDrawings.length };
    } catch (error) {
      console.error('Error exportando dibujos:', error);
      return { success: false, error: error.message };
    }
  }

  // Import drawings from JSON file
  async importDrawings(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.drawings || !Array.isArray(importData.drawings)) {
        throw new Error('Archivo de importación inválido');
      }
      
      let importedCount = 0;
      for (const drawing of importData.drawings) {
        const result = this.saveColoredDrawing(drawing, false);
        if (result.success) {
          importedCount++;
        }
      }
      
      console.log(`📥 Importados ${importedCount} dibujos`);
      return { success: true, imported: importedCount, total: importData.drawings.length };
      
    } catch (error) {
      console.error('Error importando dibujos:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all colored drawings
  clearAllColoredDrawings() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.STORAGE_KEY_PREFIX}${this.COLORED_DRAWINGS_KEY}_`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear history
      const historyKey = `${this.STORAGE_KEY_PREFIX}${this.DRAWING_HISTORY_KEY}`;
      localStorage.removeItem(historyKey);
      
      console.log(`🧹 Eliminados ${keysToRemove.length} dibujos`);
      return { success: true, deleted: keysToRemove.length };
      
    } catch (error) {
      console.error('Error limpiando dibujos:', error);
      return { success: false, error: error.message };
    }
  }

  // Get storage statistics
  getStorageStats() {
    const allDrawings = this.getAllColoredDrawings();
    const usage = this.getStorageUsage();
    
    return {
      totalDrawings: allDrawings.length,
      storageUsed: usage,
      storageUsedMB: (usage / 1024 / 1024).toFixed(2),
      maxStorageMB: (this.MAX_STORAGE_SIZE / 1024 / 1024).toFixed(2),
      usagePercentage: ((usage / this.MAX_STORAGE_SIZE) * 100).toFixed(1),
      oldestDrawing: allDrawings.length > 0 ? allDrawings[allDrawings.length - 1].coloredAt : null,
      newestDrawing: allDrawings.length > 0 ? allDrawings[0].coloredAt : null
    };
  }
}

// Export singleton instance
const enhancedDrawingStorage = new EnhancedDrawingStorage();
export default enhancedDrawingStorage;