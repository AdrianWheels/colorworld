import { useEffect } from 'react';

/**
 * Hook personalizado para manejar los meta tags dinámicos de SEO
 * Actualiza título, meta description y Open Graph basado en el tema actual
 */
export const useDynamicSEO = (todayTheme, selectedDate) => {
  useEffect(() => {
    if (!todayTheme || !selectedDate) return;

    const currentDate = new Date(selectedDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Crear títulos optimizados para SEO
    const pageTitle = `Dibujo de ${todayTheme} para Colorear - ${currentDate} | ColorEveryday`;
    const metaDescription = `Colorea online este hermoso dibujo de ${todayTheme} generado con IA para el ${currentDate}. Gratis, sin registro. Guarda y comparte tu creación. ¡Nuevo dibujo cada día!`;

    // Actualizar título de la página
    document.title = pageTitle;

    // Función helper para actualizar meta tags
    const updateMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Actualizar meta description
    updateMetaTag('description', metaDescription);

    // Actualizar Open Graph
    updateMetaTag('og:title', pageTitle, true);
    updateMetaTag('og:description', metaDescription, true);
    updateMetaTag('og:url', `https://coloreveryday.vercel.app/?date=${selectedDate}`, true);

    // Actualizar Twitter Cards
    updateMetaTag('twitter:title', `Dibujo de ${todayTheme} para Colorear`);
    updateMetaTag('twitter:description', `¡Colorea este dibujo de ${todayTheme} generado con IA! Gratis en ColorEveryday.`);

    // Actualizar keywords dinámicamente
    const keywords = [
      'dibujos para colorear',
      'colorear online',
      `dibujos ${todayTheme.toLowerCase()}`,
      `colorear ${todayTheme.toLowerCase()}`,
      'dibujos infantiles',
      'colorear gratis',
      'dibujos IA',
      'inteligencia artificial',
      'colorear digital',
      'dibujos niños'
    ].join(', ');
    
    updateMetaTag('keywords', keywords);

    // Actualizar canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = `https://coloreveryday.vercel.app/?date=${selectedDate}`;
    }

  }, [todayTheme, selectedDate]);

  // Función para generar alt text optimizado para imágenes
  const generateAltText = (theme, date) => {
    return `Dibujo de ${theme} para colorear online gratis - ${date} - ColorEveryday`;
  };

  return {
    generateAltText
  };
};