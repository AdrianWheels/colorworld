import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Tiles } from './Tiles';
import '../styles/PrivacyPolicy.css';

function PrivacyPolicy() {
    const { t } = useTranslation();
    return (
        <div className="privacy-page">
            <Tiles rows={100} cols={40} tileSize="lg" />
            <header className="privacy-header">
                <Link to="/" className="privacy-logo-link">
                    <img src="/Letras web.png" alt="ColorEveryday" className="privacy-logo" />
                </Link>
            </header>

            <main className="privacy-content">
                <article className="privacy-card">
                    <h1>{t('privacy.title')}</h1>
                    <p className="privacy-updated">{t('privacy.updated')}</p>

                    <section>
                        <h2>{t('privacy.sections.general.title')}</h2>
                        <p>
                            <Trans i18nKey="privacy.sections.general.content">
                                <strong>ColorEveryday</strong> (<a href="https://coloreveryday.vercel.app" target="_blank" rel="noopener noreferrer">coloreveryday.vercel.app</a>) es una plataforma gratuita de dibujos para colorear online, orientada a niños, familias y mentes creativas. Nos comprometemos a proteger la privacidad de todos nuestros usuarios, especialmente la de los menores de edad.
                            </Trans>
                        </p>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.data.title')}</h2>
                        <p>
                            <Trans i18nKey="privacy.sections.data.content">
                                ColorEveryday <strong>no requiere registro ni cuenta de usuario</strong>. Los datos que recopilamos son mínimos y exclusivamente anónimos:
                            </Trans>
                        </p>
                        <ul>
                            <li><Trans i18nKey="privacy.sections.data.list.0"><strong>Google Analytics 4 (GA4)</strong>: Recopilamos datos anónimos de navegación como páginas visitadas, duración de sesión, país de origen y tipo de dispositivo. Estos datos no permiten identificar personalmente a ningún usuario.</Trans></li>
                            <li><Trans i18nKey="privacy.sections.data.list.1"><strong>Almacenamiento local (localStorage)</strong>: Los dibujos coloreados se guardan únicamente en el navegador del usuario. No se envían a nuestros servidores.</Trans></li>
                        </ul>
                        <p>
                            <Trans i18nKey="privacy.sections.data.footer">
                                <strong>No recopilamos</strong>: nombres, emails, direcciones, datos de pago ni ningún dato personal identificable.
                            </Trans>
                        </p>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.cookies.title')}</h2>
                        <p>{t('privacy.sections.cookies.content')}</p>
                        <ul>
                            <li><Trans i18nKey="privacy.sections.cookies.list.0"><strong>Cookies de Google Analytics</strong>: para análisis anónimo de tráfico web.</Trans></li>
                            <li><Trans i18nKey="privacy.sections.cookies.list.1"><strong>Cookies técnicas</strong>: necesarias para el funcionamiento del sitio.</Trans></li>
                        </ul>
                        <p>{t('privacy.sections.cookies.footer')}</p>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.pinterest.title')}</h2>
                        <p>{t('privacy.sections.pinterest.content')}</p>
                        <ul>
                            <li>{t('privacy.sections.pinterest.list.0')}</li>
                            <li>{t('privacy.sections.pinterest.list.1')}</li>
                            <li>{t('privacy.sections.pinterest.list.2')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.minors.title')}</h2>
                        <p>
                            <Trans i18nKey="privacy.sections.minors.content">
                                ColorEveryday es un sitio orientado a público infantil y familiar. Seguimos los principios de <strong>COPPA</strong> (Children&apos;s Online Privacy Protection Act) y el <strong> RGPD</strong> (Reglamento General de Protección de Datos):
                            </Trans>
                        </p>
                        <ul>
                            <li>{t('privacy.sections.minors.list.0')}</li>
                            <li>{t('privacy.sections.minors.list.1')}</li>
                            <li>{t('privacy.sections.minors.list.2')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.services.title')}</h2>
                        <table className="privacy-table">
                            <thead>
                                <tr>
                                    <th>{t('privacy.sections.services.table.headers.0')}</th>
                                    <th>{t('privacy.sections.services.table.headers.1')}</th>
                                    <th>{t('privacy.sections.services.table.headers.2')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {t('privacy.sections.services.table.rows', { returnObjects: true }).map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.name}</td>
                                        <td>{row.purpose}</td>
                                        <td>{row.data}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.rights.title')}</h2>
                        <p>{t('privacy.sections.rights.content')}</p>
                        <ul>
                            <li><Trans i18nKey="privacy.sections.rights.list.0"><strong>Acceso</strong>: Solicitar qué datos tenemos sobre ti (en nuestro caso, ninguno personal).</Trans></li>
                            <li><Trans i18nKey="privacy.sections.rights.list.1"><strong>Rectificación</strong>: Corregir datos inexactos.</Trans></li>
                            <li><Trans i18nKey="privacy.sections.rights.list.2"><strong>Supresión</strong>: Solicitar la eliminación de tus datos.</Trans></li>
                            <li><Trans i18nKey="privacy.sections.rights.list.3"><strong>Oposición</strong>: Oponerte al tratamiento de tus datos.</Trans></li>
                            <li><Trans i18nKey="privacy.sections.rights.list.4"><strong>Portabilidad</strong>: Recibir tus datos en formato estructurado.</Trans></li>
                        </ul>
                        <p>{t('privacy.sections.rights.footer')}</p>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.security.title')}</h2>
                        <p>{t('privacy.sections.security.content')}</p>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.changes.title')}</h2>
                        <p>{t('privacy.sections.changes.content')}</p>
                    </section>

                    <section>
                        <h2>{t('privacy.sections.contact.title')}</h2>
                        <p>{t('privacy.sections.contact.content')}</p>
                        <p className="privacy-contact">
                            📧 <a href={`mailto:${t('privacy.sections.contact.email')}`}>{t('privacy.sections.contact.email')}</a>
                        </p>
                    </section>
                </article>

                <div className="privacy-back">
                    <Link to="/" className="privacy-back-btn">{t('privacy.back')}</Link>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;
