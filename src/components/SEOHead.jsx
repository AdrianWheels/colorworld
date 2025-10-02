import { useEffect } from 'react';

const SEOHead = ({ 
  title = "ColorEveryday - Dibujos para Colorear", 
  description = "Dibujos para colorear online gratis generados con IA. Nuevos dibujos cada día para niños. Colorea, guarda y comparte tus creaciones. Halloween, animales, fantasía y más temas.",
  keywords = "dibujos para colorear, colorear online, dibujos niños, colorear gratis, dibujos infantiles, halloween colorear, dibujos IA, colorear digital",
  ogImage = "https://coloreveryday.vercel.app/og-image.png",
  currentTheme = "",
  currentDate = ""
}) => {
  
  useEffect(() => {
    // Actualizar título
    document.title = title;
    
    // Función para crear o actualizar meta tag
    const setMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Meta tags básicos SEO
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', 'ColorEveryday');
    setMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large');
    
    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:site_name', 'ColorEveryday', true);
    setMetaTag('og:locale', 'es_ES', true);
    
    // Twitter Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
    setMetaTag('twitter:site', '@ColorEveryday');
    
    // Meta tags adicionales
    setMetaTag('application-name', 'ColorEveryday');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
    
    // Meta tags dinámicos basados en el tema actual
    if (currentTheme) {
      const dynamicDescription = `Colorea este hermoso dibujo de ${currentTheme} generado con IA. Herramientas gratuitas para colorear online. Guarda y comparte tu creación.`;
      setMetaTag('description', dynamicDescription);
      setMetaTag('og:description', dynamicDescription, true);
      setMetaTag('twitter:description', dynamicDescription);
      
      // Título dinámico
      const dynamicTitle = `Dibujo de ${currentTheme} para Colorear${currentDate ? ' - ' + currentDate : ''} | ColorEveryday`;
      document.title = dynamicTitle;
      setMetaTag('og:title', dynamicTitle, true);
      setMetaTag('twitter:title', dynamicTitle);
    }

  }, [title, description, keywords, ogImage, currentTheme, currentDate]);

  return null; // Este componente no renderiza nada visual
};

export default SEOHead;