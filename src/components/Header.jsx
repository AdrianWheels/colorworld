import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../styles/Header.css';

const Header = ({ children }) => {
    const { t, i18n } = useTranslation();
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="main-header glass"
        >
            <div className="header-content">
                <Link to="/" className="logo-container">
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        src="/Letras web.png"
                        alt="ColorEveryday"
                        className="main-logo"
                    />
                </Link>

                <nav className="main-nav">
                    <NavLink to="/galeria" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        {({ isActive }) => (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="nav-item"
                            >
                                <img src="/Icons/web/gallery.png" alt="Gallery" className="nav-icon" />
                                {t('app.header.gallery')}
                            </motion.div>
                        )}
                    </NavLink>

                    <NavLink to="/calendario" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        {({ isActive }) => (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="nav-item"
                            >
                                <img src="/Icons/web/calendar.png" alt="Calendar" className="nav-icon" />
                                {t('app.header.calendar')}
                            </motion.div>
                        )}
                    </NavLink>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
                        className="nav-link lang-pill"
                        title={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                    >
                        {i18n.language === 'es' ? 'EN' : 'ES'}
                    </motion.button>
                </nav>

                {children && <div className="header-extras">{children}</div>}
            </div>
        </motion.header>
    );
};

export default Header;
