/**
 * Sistema de logging condicional para ColorEveryday
 * Solo muestra logs en desarrollo, silencioso en producción
 */

const isDevelopment = import.meta.env.DEV;

class Logger {
  static log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  static info(...args) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  static warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  static error(...args) {
    // Los errores siempre se muestran, pero sin información sensible en producción
    if (isDevelopment) {
      console.error(...args);
    } else {
      console.error('Error en la aplicación. Ver consola de desarrollo para más detalles.');
    }
  }

  static debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
}

export default Logger;