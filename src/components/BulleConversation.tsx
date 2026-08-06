import React from 'react';
import { motion } from 'framer-motion';

interface BulleConversationProps {
  sender: 'user' | 'ia';
  text: string;
}

export const BulleConversation: React.FC<BulleConversationProps> = ({ sender, text }) => {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} // RÈGLE : Fondu + translation verticale de 8 px, 180 ms
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`max-w-[85%] rounded-lg p-16 select-none ${
        isUser
          ? 'bg-primaire text-texte-sur-fonce self-end rounded-br-none'
          : 'bg-fond-carte text-encre-forte border border-bordure self-start rounded-bl-none'
      }`}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </motion.div>
  );
};
