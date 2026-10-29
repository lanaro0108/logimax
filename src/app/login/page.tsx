'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagemSeed, setMensagemSeed] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || 'Falha ao autenticar');
        return;
      }

      const role = data.dados?.usuario?.role;
      if (role === 'gestor') {
        router.push('/gestor/dashboard');
      } else {
        router.push('/motorista/viagens');
      }
      router.refresh();
    } catch {
      setErro('Erro de conexão com o servidor');
    } finally {
      setCarregando(false);
    }
  }

  async function handleSeed() {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch('/api/auth/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMensagemSeed('Contas de teste criadas com sucesso!');
        setEmail('gestor@logimax.com');
        setSenha('senha123');
      } else {
        setErro(data.erro || 'Erro ao inicializar dados');
      }
    } catch {
      setErro('Falha na requisição');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 10px 25px -5px rgba(18, 52, 90, 0.1)',
          border: '1px solid #E2E8F0',
          padding: 36,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="LogiMax Logo"
            style={{ height: 48, margin: '0 auto 12px' }}
          />
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Acesso Corporativo de Gerenciamento de Frotas
          </p>
        </div>

        {erro && (
          <div className="alert-box danger">
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        {mensagemSeed && (
          <div className="alert-box success">
            <CheckCircle size={18} />
            <span>{mensagemSeed}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="input-email">E-mail</label>
            <div style={{ position: 'relative' }}>
              <input
                id="input-email"
                type="email"
                required
                placeholder="seu.email@logimax.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="input-senha">Senha</label>
            <input
              id="input-senha"
              type="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={carregando}
            style={{ width: '100%', marginTop: 8 }}
          >
            {carregando ? 'Autenticando...' : 'Entrar na Plataforma'}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid #E2E8F0',
            fontSize: '0.8125rem',
            color: '#64748B',
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <strong>Ambiente SENAI — Credenciais Rápidas:</strong>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setEmail('gestor@logimax.com');
                  setSenha('senha123');
                }}
              >
                Preencher Gestor
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setEmail('carlos@logimax.com');
                  setSenha('senha123');
                }}
              >
                Preencher Motorista
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeed}
            className="btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={carregando}
          >
            Resetar / Inicializar Dados de Teste
          </button>
        </div>
      </div>
    </div>
  );
}
