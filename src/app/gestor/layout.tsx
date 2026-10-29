import React from 'react';
import { redirect } from 'next/navigation';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export const dynamic = 'force-dynamic';

// Layout protegido da área administrativa do gestor
export default async function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obterUsuarioAutenticado();

  if (!usuario) {
    redirect('/login');
  }

  if (usuario.role !== 'gestor') {
    redirect('/motorista/viagens');
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header nomeUsuario={usuario.nome} papel={usuario.role} />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
