import { useEffect } from 'react';

const StructuredData = ({ todayTheme, selectedDate, dayImageStatus }) => {
  useEffect(() => {
    // Remover structured data anterior si existe
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Schema.org para la aplicación web
    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ColorEveryday",
      "description": "Aplicación web para colorear dibujos generados con inteligencia artificial",
      "url": "https://coloreveryday.vercel.app",
      "applicationCategory": "Entertainment",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "creator": {
        "@type": "Organization",
        "name": "ColorEveryday",
        "url": "https://coloreveryday.vercel.app"
      },
      "datePublished": "2025-10-01",
      "inLanguage": "es-ES",
      "isAccessibleForFree": true,
      "audience": {
        "@type": "Audience",
        "audienceType": "Children"
      },
      "genre": ["Creative", "Educational", "Art"],
      "keywords": "dibujos para colorear, colorear online, dibujos niños, colorear gratis, dibujos infantiles, IA, inteligencia artificial"
    };

    // Schema.org para el dibujo actual
    const currentDate = selectedDate || new Date().toISOString().split('T')[0];
    const creativeWorkSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": `Dibujo de ${todayTheme || 'ColorEveryday'} para Colorear - ${currentDate}`,
      "description": `Dibujo de ${todayTheme || 'tema creativo'} generado con IA para colorear online gratis`,
      "dateCreated": currentDate,
      "creator": {
        "@type": "SoftwareApplication",
        "name": "Gemini AI",
        "applicationCategory": "Artificial Intelligence"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "genre": ["Art", "Educational", "Children"],
      "audience": {
        "@type": "Audience",
        "audienceType": "Children"
      },
      "isAccessibleForFree": true,
      "inLanguage": "es-ES",
      "keywords": `${todayTheme}, dibujos para colorear, colorear online, IA, inteligencia artificial`
    };

    // Agregar imagen si está disponible
    if (dayImageStatus === 'loaded') {
      const imageFileName = `${currentDate}_${todayTheme?.replace(/\s+/g, '')}_${Date.now()}`;
      creativeWorkSchema.image = `https://coloreveryday.vercel.app/generated-images/${currentDate.substring(0, 7)}/${imageFileName}.png`;
    }

    // Schema.org para la organización
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ColorEveryday",
      "url": "https://coloreveryday.vercel.app",
      "description": "Plataforma de dibujos para colorear generados con inteligencia artificial",
      "foundingDate": "2025-10-01",
      "specialty": ["Digital Art", "Educational Technology", "AI-Generated Content"],
      "audience": {
        "@type": "Audience",
        "audienceType": "Children"
      }
    };

    // Inyectar los schemas en el head
    const schemas = [webAppSchema, creativeWorkSchema, organizationSchema];
    
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `structured-data-${index}`;
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });

    // Cleanup al desmontar
    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, [todayTheme, selectedDate, dayImageStatus]);

  // Este componente no renderiza nada visible
  return null;
};

export default StructuredData;