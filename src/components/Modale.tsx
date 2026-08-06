import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModaleProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modale: React.FC<ModaleProps> = ({ isOpen, onClose, title, children }) => {
  // RÈGLE : Le bouton retour physique Android est intercepté et ferme les modales
  useEffect(() => {
    if (!isOpen) return;

    // Push dummy state to allow popstate interception
    window.history.pushState({ modalOpen: true }, '', window.location.pathname);

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up pushed state if the modal was closed via UI click rather than back button
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
          {/* RÈGLE : Fondu du voile 160 ms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-encre-forte/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* RÈGLE : Montée du panneau 200 ms, transform/opacity uniquement */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.20, ease: 'easeOut' }}
            className="relative bg-fond-carte w-full max-h-[85dvh] rounded-t-lg border-t border-bordure p-20 flex flex-col gap-16 z-10 shadow-lg overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-bordure pb-12">
              <h3 className="font-titres text-lg font-bold text-encre-forte">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="w-32 h-32 flex items-center justify-center rounded-full bg-fond-encart border border-bordure text-encre-douce active:bg-fond-base"
              >
                <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto pr-4 text-sm leading-relaxed">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
