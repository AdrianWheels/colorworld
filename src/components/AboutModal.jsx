import './AboutModal.css';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <h2>Sobre ColorEveryday</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className="about-content">
          <div className="about-section">
            <h3>🎨 Qué es ColorEveryday</h3>
            <p>
              ColorEveryday es una aplicación web innovadora que genera dibujos únicos para colorear 
              cada día utilizando inteligencia artificial avanzada. Creamos contenido fresco y original 
              perfecto para niños, familias y cualquier persona que disfrute del arte digital.
            </p>
          </div>

          <div className="about-section">
            <h3>🚀 Tecnología IA</h3>
            <p>
              Utilizamos Gemini AI de Google para generar dibujos originales y creativos. 
              Cada ilustración es única y está diseñada específicamente para ser coloreada online, 
              combinando creatividad artificial con diversión humana.
            </p>
          </div>

          <div className="about-section">
            <h3>✨ Características</h3>
            <ul>
              <li><strong>Contenido Diario:</strong> Nuevo dibujo cada día del año</li>
              <li><strong>100% Gratis:</strong> Sin registros ni suscripciones</li>
              <li><strong>Multiplataforma:</strong> Funciona en cualquier dispositivo</li>
              <li><strong>Guardar y Compartir:</strong> Exporta tus creaciones fácilmente</li>
              <li><strong>Herramientas Avanzadas:</strong> Pinceles, colores y deshacer ilimitado</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>🎯 Nuestra Misión</h3>
            <p>
              Democratizar la creatividad digital combinando inteligencia artificial con expresión 
              artística humana. Creemos que todos merecen acceso gratuito a contenido creativo 
              de calidad que inspire y entretenga.
            </p>
          </div>

          <div className="about-section about-footer">
            <p>
              <strong>ColorEveryday</strong> - Donde la IA encuentra la creatividad humana
            </p>
            <p className="about-date">© 2025 - Hecho con ❤️ y tecnología</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;