'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Truck, Users, MapPin, LogOut } from 'lucide-react';

const itensNavegacao = [
  { href: '/gestor/dashboard', rotulo: 'Dashboard', icone: LayoutDashboard },
  { href: '/gestor/veiculos', rotulo: 'Veículos', icone: Truck },
  { href: '/gestor/motoristas', rotulo: 'Motoristas', icone: Users },
  { href: '/gestor/viagens', rotulo: 'Viagens', icone: MapPin },
];

// Barra lateral de navegação administrativa
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-container">
          {/* Logotipo oficial LogiMax */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LogiMax Logo" />
        </div>
      </div>

      <nav className="sidebar-nav">
        {itensNavegacao.map((item) => {
          const Icone = item.icone;
          const ativo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${ativo ? 'active' : ''}`}
            >
              <Icone size={20} />
              <span>{item.rotulo}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={16} />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
