'use client';

import React, { useState, useEffect } from 'react';
import { Play, CheckSquare, Navigation, Truck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface ViagemMotorista {
  _id: string;
  origem: string;
  destino: string;
  status: 'agendada' | 'em_curso' | 'finalizada';
  kmInicial?: number;
  kmFinal?: number;
  dataInicio?: string;
  dataFim?: string;
  veiculoId: {
    _id: string;
    placa: string;
    modelo: string;
    kmAtual: number;
  };
}

export default function MinhasViagensPage() {
  const [viagens, setViagens] = useState<ViagemMotorista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState<ViagemMotorista | null>(null);
  const [kmFinal, setKmFinal] = useState<number | string>('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarMinhasViagens() {
    try {
      const res = await fetch('/api/viagens');
      const data = await res.json();
      if (res.ok) setViagens(data.dados?.viagens || []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMinhasViagens();
  }, []);

  async function handleIniciarViagem(id: string) {
    setErro('');
    try {
      const res = await fetch(`/api/viagens/${id}/iniciar`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Falha ao iniciar viagem');
        return;
      }
      setSucesso('Viagem iniciada! Dirija com segurança.');
      setTimeout(() => setSucesso(''), 4000);
      carregarMinhasViagens();
    } catch {
      setErro('Erro na conexão com o servidor');
    }
  }

  function abrirModalFinalizar(v: ViagemMotorista) {
    setViagemSelecionada(v);
    setKmFinal(v.veiculoId?.kmAtual || 0);
    setErro('');
    setModalFinalizarAberto(true);
  }

  async function handleFinalizarViagem(e: React.FormEvent) {
    e.preventDefault();
    if (!viagemSelecionada) return;
    setErro('');

    const kmAtual = viagemSelecionada.veiculoId?.kmAtual || 0;
    if (Number(kmFinal) < kmAtual) {
      setErro(`A quilometragem final não pode ser menor que a atual (${kmAtual.toLocaleString('pt-BR')} km).`);
      return;
    }

    try {
      const res = await fetch(`/api/viagens/${viagemSelecionada._id}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kmFinal: Number(kmFinal) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Falha ao finalizar viagem');
        return;
      }
      setSucesso('Viagem finalizada com sucesso e quilometragem do veículo atualizada!');
      setTimeout(() => setSucesso(''), 4000);
      setModalFinalizarAberto(false);
      carregarMinhasViagens();
    } catch {
      setErro('Erro na conexão com o servidor');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minhas Viagens Atribuídas</h1>
          <p className="page-subtitle">Acompanhe seu itinerário, inicie rotas e informe a quilometragem final</p>
        </div>
      </div>

      {erro && (
        <div className="alert-box danger">
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      {sucesso && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{sucesso}</span>
        </div>
      )}

      {carregando ? (
        <p style={{ color: '#64748B' }}>Carregando suas viagens...</p>
      ) : viagens.length === 0 ? (
        <div className="table-container" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
          <Navigation size={40} color="#12345A" style={{ marginBottom: 12, opacity: 0.5 }} />
          <h3>Você não possui viagens atribuídas no momento.</h3>
          <p style={{ marginTop: 6, fontSize: '0.875rem' }}>
            Aguarde o gestor da frota alocar uma nova rota para você.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {viagens.map((v) => (
            <div
              key={v._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 24,
                boxShadow: '0 1px 3px rgba(18, 52, 90, 0.06)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className={`badge ${v.status}`}>
                    {v.status === 'em_curso' ? 'Em Curso' : v.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    ID: {v._id.slice(-6)}
                  </span>
                </div>

                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#12345A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Navigation size={18} />
                  <span>{v.origem}</span>
                  <span style={{ color: '#FFB020' }}>→</span>
                  <span>{v.destino}</span>
                </div>

                <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.875rem', color: '#64748B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={16} />
                    <span>
                      Veículo: <strong>{v.veiculoId?.placa}</strong> ({v.veiculoId?.modelo})
                    </span>
                  </div>
                  <div>
                    Odômetro Atual do Veículo: <strong>{(v.veiculoId?.kmAtual || 0).toLocaleString('pt-BR')} km</strong>
                  </div>
                  {v.kmInicial !== undefined && (
                    <div>KM Inicial da Viagem: <strong>{v.kmInicial.toLocaleString('pt-BR')} km</strong></div>
                  )}
                  {v.kmFinal !== undefined && (
                    <div>KM Final da Viagem: <strong>{v.kmFinal.toLocaleString('pt-BR')} km</strong></div>
                  )}
                </div>
              </div>

              {/* Ações de transição de status */}
              <div style={{ display: 'flex', gap: 10 }}>
                {v.status === 'agendada' && (
                  <button
                    onClick={() => handleIniciarViagem(v._id)}
                    className="btn-accent"
                  >
                    <Play size={16} />
                    <span>Iniciar Viagem</span>
                  </button>
                )}

                {v.status === 'em_curso' && (
                  <button
                    onClick={() => abrirModalFinalizar(v)}
                    className="btn-primary"
                  >
                    <CheckSquare size={16} />
                    <span>Finalizar Viagem</span>
                  </button>
                )}

                {v.status === 'finalizada' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontWeight: 600, fontSize: '0.875rem' }}>
                    <CheckCircle size={18} />
                    <span>Viagem Concluída</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Finalização de Viagem com Odômetro */}
      <Modal
        aberto={modalFinalizarAberto}
        titulo="Finalizar Viagem e Informar Quilometragem"
        onFechar={() => setModalFinalizarAberto(false)}
      >
        <form onSubmit={handleFinalizarViagem}>
          <div className="modal-body">
            {erro && (
              <div className="alert-box danger" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{erro}</span>
              </div>
            )}

            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: 16,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: '0.875rem',
              }}
            >
              <div style={{ marginBottom: 6 }}>
                Veículo: <strong>{viagemSelecionada?.veiculoId?.placa}</strong> ({viagemSelecionada?.veiculoId?.modelo})
              </div>
              <div>
                Quilometragem Atual Registrada:{' '}
                <strong style={{ color: '#12345A' }}>
                  {(viagemSelecionada?.veiculoId?.kmAtual || 0).toLocaleString('pt-BR')} km
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="input-km-final">Quilometragem Final no Odômetro (KM)</label>
              <input
                id="input-km-final"
                type="number"
                required
                min={viagemSelecionada?.veiculoId?.kmAtual || 0}
                value={kmFinal}
                onChange={(e) => setKmFinal(Number(e.target.value))}
                autoFocus
              />
              <span className="form-help">
                O valor deve ser maior ou igual à quilometragem atual do veículo.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setModalFinalizarAberto(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Concluir e Atualizar Veículo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
