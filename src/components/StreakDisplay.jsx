// src/components/StreakDisplay.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function StreakDisplay({ currentStreak, longestStreak }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!currentStreak || currentStreak === 0) return null;

  return (
    <div
      className="streak-display"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative', cursor: 'default' }}
    >
      <motion.div
        className="streak-chip"
        key={currentStreak}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        role="img"
        aria-label={`Racha actual: ${currentStreak} días`}
      >
        🔥 {currentStreak}
      </motion.div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="streak-tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            Racha más larga: {longestStreak} días
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
