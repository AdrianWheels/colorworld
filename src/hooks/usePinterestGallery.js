import { useState, useEffect, useCallback } from 'react';
import pinterestService from '../services/pinterestService';

/**
 * Custom hook for managing Pinterest gallery state and navigation
 */
export function usePinterestGallery(boardSlug = null) {
    const [galleryData, setGalleryData] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load gallery data on mount
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await pinterestService.loadGalleryData();
                if (cancelled) return;

                setGalleryData(data);

                // If a board slug is provided, auto-select that board
                // Otherwise, clear selection to show collections grid
                if (boardSlug) {
                    const board = data.boards.find(b => b.slug === boardSlug);
                    setSelectedBoard(board || null);
                } else {
                    setSelectedBoard(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadData();
        return () => { cancelled = true; };
    }, [boardSlug]);

    // Select a board
    const selectBoard = useCallback((board) => {
        setSelectedBoard(board);
    }, []);

    // Go back to board grid
    const clearBoard = useCallback(() => {
        setSelectedBoard(null);
    }, []);

    return {
        galleryData,
        boards: galleryData?.boards || [],
        selectedBoard,
        isLoading,
        error,
        selectBoard,
        clearBoard,
        lastSynced: galleryData?.lastSynced || null,
    };
}
