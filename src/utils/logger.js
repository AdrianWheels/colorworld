/**
 * Sistema de logging condicional para ColorEveryday
 * Solo muestra logs en desarrollo, silencioso en producción
 */

// Detección más robusta del entorno
const isDevelopment = import.meta.env.DEV || 
                      import.meta.env.MODE === 'development' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.port !== '';

// En producción, forzar a false si estamos en dominio de producción
const isProduction = window.location.hostname.includes('.vercel.app') || 
                     window.location.hostname.includes('coloreveryday') ||
                     import.meta.env.PROD === true;

const showLogs = isDevelopment && !isProduction;

class Logger {
  static log(...args) {
    if (showLogs) {
      console.log(...args);
    }
  }

  static info(...args) {
    if (showLogs) {
      console.info(...args);
    }
  }

  static warn(...args) {
    if (showLogs) {
      console.warn(...args);
    }
  }

  static error(...args) {
    // Los errores siempre se muestran, pero sin información sensible en producción
    if (showLogs) {
      console.error(...args);
    } else {
      console.error('Error en la aplicación. Ver consola de desarrollo para más detalles.');
    }
  }

  static debug(...args) {
    if (showLogs) {
      console.debug(...args);
    }
  }
}

export default Logger;