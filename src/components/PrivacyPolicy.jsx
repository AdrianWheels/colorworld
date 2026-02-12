import { Link } from 'react-router-dom';
import '../styles/PrivacyPolicy.css';

function PrivacyPolicy() {
    return (
        <div className="privacy-page">
            <header className="privacy-header">
                <Link to="/" className="privacy-logo-link">
                    <img src="/Letras web.png" alt="ColorEveryday" className="privacy-logo" />
                </Link>
            </header>

            <main className="privacy-content">
                <article className="privacy-card">
                    <h1>Política de Privacidad</h1>
                    <p className="privacy-updated">Última actualización: 12 de febrero de 2026</p>

                    <section>
                        <h2>1. Información General</h2>
                        <p>
                            <strong>ColorEveryday</strong> (<a href="https://coloreveryday.vercel.app" target="_blank" rel="noopener noreferrer">coloreveryday.vercel.app</a>) es una plataforma gratuita de dibujos para colorear online,
                            orientada a niños, familias y mentes creativas. Nos comprometemos a proteger la privacidad
                            de todos nuestros usuarios, especialmente la de los menores de edad.
                        </p>
                    </section>

                    <section>
                        <h2>2. Datos que Recopilamos</h2>
                        <p>
                            ColorEveryday <strong>no requiere registro ni cuenta de usuario</strong>. Los datos que recopilamos
                            son mínimos y exclusivamente anónimos:
                        </p>
                        <ul>
                            <li><strong>Google Analytics 4 (GA4)</strong>: Recopilamos datos anónimos de navegación
                                como páginas visitadas, duración de sesión, país de origen y tipo de dispositivo.
                                Estos datos no permiten identificar personalmente a ningún usuario.</li>
                            <li><strong>Almacenamiento local (localStorage)</strong>: Los dibujos coloreados se guardan
                                únicamente en el navegador del usuario. No se envían a nuestros servidores.</li>
                        </ul>
                        <p>
                            <strong>No recopilamos</strong>: nombres, emails, direcciones, datos de pago ni ningún
                            dato personal identificable.
                        </p>
                    </section>

                    <section>
                        <h2>3. Uso de Cookies</h2>
                        <p>Utilizamos únicamente:</p>
                        <ul>
                            <li><strong>Cookies de Google Analytics</strong>: para análisis anónimo de tráfico web.</li>
                            <li><strong>Cookies técnicas</strong>: necesarias para el funcionamiento del sitio.</li>
                        </ul>
                        <p>No utilizamos cookies de publicidad ni de seguimiento de terceros.</p>
                    </section>

                    <section>
                        <h2>4. Contenido de Pinterest</h2>
                        <p>
                            Nuestra sección de galería muestra imágenes que hemos publicado en Pinterest.
                            Estas imágenes son contenido propio de ColorEveryday, publicado en nuestro perfil de Pinterest
                            y mostrado a través de la API oficial de Pinterest.
                        </p>
                        <ul>
                            <li>No recopilamos datos de usuarios de Pinterest.</li>
                            <li>No realizamos seguimiento de la actividad de los usuarios en Pinterest.</li>
                            <li>Las imágenes se muestran como contenido público para su coloreado.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Protección de Menores</h2>
                        <p>
                            ColorEveryday es un sitio orientado a público infantil y familiar.
                            Seguimos los principios de <strong>COPPA</strong> (Children&apos;s Online Privacy Protection Act) y el
                            <strong> RGPD</strong> (Reglamento General de Protección de Datos):
                        </p>
                        <ul>
                            <li>No recopilamos intencionadamente datos personales de menores de 13 años.</li>
                            <li>No requerimos información personal para usar el sitio.</li>
                            <li>Los datos analíticos son completamente anónimos y agregados.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Servicios de Terceros</h2>
                        <table className="privacy-table">
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Propósito</th>
                                    <th>Datos Compartidos</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Google Analytics 4</td>
                                    <td>Análisis de tráfico web</td>
                                    <td>Datos anónimos de navegación</td>
                                </tr>
                                <tr>
                                    <td>Vercel</td>
                                    <td>Hosting del sitio web</td>
                                    <td>Logs de servidor estándar</td>
                                </tr>
                                <tr>
                                    <td>Pinterest API</td>
                                    <td>Mostrar nuestras imágenes</td>
                                    <td>Ninguno — solo lectura de contenido propio</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>7. Derechos del Usuario (RGPD)</h2>
                        <p>Como usuario, tienes derecho a:</p>
                        <ul>
                            <li><strong>Acceso</strong>: Solicitar qué datos tenemos sobre ti (en nuestro caso, ninguno personal).</li>
                            <li><strong>Rectificación</strong>: Corregir datos inexactos.</li>
                            <li><strong>Supresión</strong>: Solicitar la eliminación de tus datos.</li>
                            <li><strong>Oposición</strong>: Oponerte al tratamiento de tus datos.</li>
                            <li><strong>Portabilidad</strong>: Recibir tus datos en formato estructurado.</li>
                        </ul>
                        <p>
                            Para ejercer cualquiera de estos derechos, puedes contactarnos a través del
                            email indicado más abajo.
                        </p>
                    </section>

                    <section>
                        <h2>8. Seguridad</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas para proteger la integridad de nuestro sitio,
                            incluyendo Content Security Policy (CSP), cabeceras de seguridad HTTP y cifrado HTTPS.
                        </p>
                    </section>

                    <section>
                        <h2>9. Cambios en esta Política</h2>
                        <p>
                            Nos reservamos el derecho de actualizar esta política de privacidad. Cualquier cambio se
                            publicará en esta misma página con la fecha de actualización.
                        </p>
                    </section>

                    <section>
                        <h2>10. Contacto</h2>
                        <p>
                            Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
                        </p>
                        <p className="privacy-contact">
                            📧 <a href="mailto:mariaharor@gmail.com">mariaharor@gmail.com</a>
                        </p>
                    </section>
                </article>

                <div className="privacy-back">
                    <Link to="/" className="privacy-back-btn">🎨 Volver a Colorear</Link>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;
