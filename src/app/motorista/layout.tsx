import React from 'react';
import { redirect } from 'next/navigation';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { Header } from '@/components/Header';

export const dynamic = 'force-dynamic';

// Layout protegido da área do motorista
export default async function MotoristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obterUsuarioAutenticado();

  if (!usuario) {
    redirect('/login');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          backgroundColor: '#12345A',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="LogiMax Logo" style={{ height: 38 }} />
        <Header nomeUsuario={usuario.nome} papel={usuario.role} />
      </header>
      <main className="page-body">{children}</main>
    </div>
  );
}
