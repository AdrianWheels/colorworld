import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import { Tiles } from './Tiles';
import { usePinterestGallery } from '../hooks/usePinterestGallery';
import pinterestService from '../services/pinterestService';
import '../styles/PinterestGallery.css';

function PinterestGallery() {
    const { boardSlug } = useParams();
    const navigate = useNavigate();
    const {
        boards,
        selectedBoard,
        isLoading,
        error,
        selectBoard,
    } = usePinterestGallery(boardSlug);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 24; // 6 columns x 4 rows

    // Reset page when board changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedBoard]);

    // Sync URL with board selection
    useEffect(() => {
        if (boards.length > 0) {
            if (boardSlug) {
                // If URL has a slug, strictly follow it
                const board = boards.find(b => b.slug === boardSlug);
                if (board && board.slug !== selectedBoard?.slug) {
                    selectBoard(board);
                }
            } else if (!selectedBoard && !isLoading) {
                // If no slug and no selection, select first board
                selectBoard(boards[0]);
            }
        }
    }, [boardSlug, boards, selectedBoard, selectBoard, isLoading]);

    const handleBoardClick = (board) => {
        selectBoard(board);
        navigate(`/galeria/${board.slug}`);
    };

    const handlePinClick = (pin) => {
        navigate(`/colorear/${pin.id}`);
    };

    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="gallery-page">
                <Tiles rows={40} cols={30} tileSize="lg" />
                <Header />
                <div className="gallery-loading">
                    <div className="gallery-spinner"></div>
                    <p>Cargando galería...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gallery-page">
                <Tiles rows={40} cols={30} tileSize="lg" />
                <Header />
                <div className="gallery-error">
                    <p>❌ Error cargando la galería: {error}</p>
                    <Link to="/" className="gallery-back-btn">🎨 Volver a Inicio</Link>
                </div>
            </div>
        );
    }

    // Calcular pines para la página actual
    const currentPins = selectedBoard ? selectedBoard.pins : [];
    const totalPages = Math.ceil(currentPins.length / ITEMS_PER_PAGE);
    const displayedPins = currentPins.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="gallery-page">
            <Tiles rows={40} cols={30} tileSize="lg" />
            <Header />


            <div className="gallery-nav-bar">
                <div className="gallery-nav-scroll">
                    {boards.map((board) => (
                        <button
                            key={board.slug}
                            className={`gallery-nav-tab ${selectedBoard?.slug === board.slug ? 'active' : ''}`}
                            onClick={() => handleBoardClick(board)}
                        >
                            {board.name}
                        </button>
                    ))}
                </div>
            </div>

            <motion.main
                className="gallery-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                key={selectedBoard?.slug} // Re-animate when board changes
            >
                {selectedBoard && (
                    <>
                        <div className="pins-grid compact-grid">
                            {displayedPins.map((pin) => {
                                const displayUrl = pinterestService.getDisplayImageUrl(pin);
                                return (
                                    <button
                                        key={pin.id}
                                        className="pin-card compact-card"
                                        onClick={() => handlePinClick(pin)}
                                        title={pin.title || 'Colorear este dibujo'}
                                    >
                                        <div className="pin-card-image">
                                            {displayUrl ? (
                                                <img
                                                    src={displayUrl}
                                                    alt={pin.altText || pin.title || 'Dibujo para colorear'}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="pin-card-placeholder">🎨</div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="gallery-pagination">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={handlePrevPage}
                                    className="pagination-btn"
                                >
                                    ← Anterior
                                </button>
                                <span className="pagination-info">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={handleNextPage}
                                    className="pagination-btn"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </motion.main>
        </div>
    );
}

export default PinterestGallery;
