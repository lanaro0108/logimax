'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  nomeUsuario?: string;
  papel?: string;
}

// Cabeçalho superior com dados do perfil e logout
export function Header({ nomeUsuario = 'Usuário', papel = 'gestor' }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const inicial = nomeUsuario.charAt(0).toUpperCase();
  const papelFormatado = papel === 'gestor' ? 'Gestor de Frota' : 'Motorista';

  return (
    <header className="top-header">
      <div />
      <div className="user-badge">
        <div className="user-avatar" title={nomeUsuario}>
          {inicial || <User size={18} />}
        </div>
        <div className="user-details">
          <span className="user-name">{nomeUsuario}</span>
          <span className="user-role">{papelFormatado}</span>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary btn-sm"
          title="Encerrar Sessão"
          style={{ marginLeft: 8 }}
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
