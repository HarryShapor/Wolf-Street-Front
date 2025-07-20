import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{minWidth:220, maxWidth:380}}>
      <div
        className="bg-gradient-to-br from-white to-light-card dark:from-dark-card dark:to-[#181926] border-2 border-light-accent dark:border-dark-accent rounded-2xl shadow-2xl px-6 py-4 text-light-fg dark:text-dark-fg transition-all duration-300"
        style={{ pointerEvents: 'auto' }}
      >
        {title && <div className="text-xl font-bold mb-2 text-light-accent dark:text-dark-accent">{title}</div>}
        {children}
      </div>
    </div>
  );
};

export default Modal; 