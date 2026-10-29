'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}

// Componente modal reutilizável com fechamento por ESC e clique externo
export function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  useEffect(() => {
    function tratarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
    }
    if (aberto) {
      window.addEventListener('keydown', tratarTecla);
    }
    return () => window.removeEventListener('keydown', tratarTecla);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{titulo}</h3>
          <button className="close-btn" onClick={onFechar} title="Fechar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
