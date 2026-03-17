import { useState } from 'react';
import { motion } from 'framer-motion';

const MAX_CHARS = 150;

export default function ProPromptBar({ onGenerate, isGenerating, t }) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
    setPrompt('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="pro-prompt-bar"
    >
      <span className="pro-prompt-bar__icon">✨</span>
      <input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder={t('app.proPrompt.inputPlaceholder')}
        disabled={isGenerating}
        className="pro-prompt-bar__input"
        maxLength={MAX_CHARS}
      />
      <span className="pro-prompt-bar__count">
        {prompt.length}/{MAX_CHARS}
      </span>
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="pro-prompt-bar__btn"
      >
        {isGenerating ? t('app.proPrompt.ctaLoading') : t('app.proPrompt.cta')}
      </button>
    </motion.div>
  );
}
