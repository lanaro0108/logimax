'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface ViagemItem {
  _id: string;
  origem: string;
  destino: string;
  status: 'agendada' | 'em_curso' | 'finalizada';
  kmInicial?: number;
  kmFinal?: number;
  veiculoId: { _id: string; placa: string; modelo: string };
  motoristaId: { _id: string; nome: string };
  createdAt: string;
}

export default function ViagensPage() {
  const [viagens, setViagens] = useState<ViagemItem[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Formulário
  const [veiculoId, setVeiculoId] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');

  async function carregarDados() {
    try {
      const url = filtroStatus ? `/api/viagens?status=${filtroStatus}` : '/api/viagens';
      const [resViagens, resVeic, resMot] = await Promise.all([
        fetch(url),
        fetch('/api/veiculos'),
        fetch('/api/motoristas'),
      ]);
      const dataViagens = await resViagens.json();
      const dataVeic = await resVeic.json();
      const dataMot = await resMot.json();

      if (resViagens.ok) setViagens(dataViagens.dados?.viagens || []);
      if (resVeic.ok) setVeiculos(dataVeic.dados?.veiculos || []);
      if (resMot.ok) setMotoristas(dataMot.dados?.motoristas || []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [filtroStatus]);

  function abrirModalCriar() {
    setVeiculoId(veiculos[0]?._id || '');
    setMotoristaId(motoristas[0]?._id || '');
    setOrigem('');
    setDestino('');
    setErro('');
    setModalAberto(true);
  }

  async function criarViagem(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    try {
      const res = await fetch('/api/viagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ veiculoId, motoristaId, origem, destino }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Falha ao agendar viagem');
        return;
      }
      setSucesso('Nova viagem agendada com sucesso!');
      setTimeout(() => setSucesso(''), 4000);
      setModalAberto(false);
      carregarDados();
    } catch {
      setErro('Erro na conexão com o servidor');
    }
  }

  async function excluirViagem(id: string) {
    if (!confirm('Deseja excluir esta viagem?')) return;
    setErro('');
    try {
      const res = await fetch(`/api/viagens/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Erro ao excluir viagem');
        return;
      }
      setSucesso('Viagem excluída com sucesso!');
      setTimeout(() => setSucesso(''), 4000);
      carregarDados();
    } catch {
      setErro('Erro ao processar exclusão');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Viagens</h1>
          <p className="page-subtitle">Atribuição de rotas, alocação de veículos e rastreamento de status</p>
        </div>
        <button onClick={abrirModalCriar} className="btn-primary">
          <Plus size={18} />
          <span>Nova Viagem</span>
        </button>
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

      {/* Barra de Filtros */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#12345A' }}>Filtrar por Status:</span>
        <button
          onClick={() => setFiltroStatus('')}
          className={`btn-secondary btn-sm ${!filtroStatus ? 'btn-primary' : ''}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFiltroStatus('agendada')}
          className={`btn-secondary btn-sm ${filtroStatus === 'agendada' ? 'btn-primary' : ''}`}
        >
          Agendadas
        </button>
        <button
          onClick={() => setFiltroStatus('em_curso')}
          className={`btn-secondary btn-sm ${filtroStatus === 'em_curso' ? 'btn-primary' : ''}`}
        >
          Em Curso
        </button>
        <button
          onClick={() => setFiltroStatus('finalizada')}
          className={`btn-secondary btn-sm ${filtroStatus === 'finalizada' ? 'btn-primary' : ''}`}
        >
          Finalizadas
        </button>
      </div>

      <div className="table-container">
        {carregando ? (
          <p style={{ padding: 24, color: '#64748B' }}>Carregando viagens...</p>
        ) : viagens.length === 0 ? (
          <p style={{ padding: 24, color: '#64748B', textAlign: 'center' }}>
            Nenhuma viagem encontrada com o filtro selecionado.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rota (Origem → Destino)</th>
                <th>Veículo</th>
                <th>Motorista</th>
                <th>Status</th>
                <th>KM Inicial</th>
                <th>KM Final</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {viagens.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Navigation size={14} color="#12345A" />
                      <strong>{v.origem}</strong> → {v.destino}
                    </div>
                  </td>
                  <td>{v.veiculoId ? `${v.veiculoId.placa} (${v.veiculoId.modelo})` : '—'}</td>
                  <td>{v.motoristaId ? v.motoristaId.nome : '—'}</td>
                  <td>
                    <span className={`badge ${v.status}`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{v.kmInicial !== undefined ? `${v.kmInicial.toLocaleString('pt-BR')} km` : '—'}</td>
                  <td>{v.kmFinal !== undefined ? `${v.kmFinal.toLocaleString('pt-BR')} km` : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => excluirViagem(v._id)}
                      className="btn-danger btn-sm"
                      title={v.status === 'finalizada' ? 'Viagens finalizadas não podem ser excluídas' : 'Excluir viagem'}
                      disabled={v.status === 'finalizada'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Criação de Viagem */}
      <Modal
        aberto={modalAberto}
        titulo="Agendar Nova Viagem"
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={criarViagem}>
          <div className="modal-body">
            {erro && (
              <div className="alert-box danger" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{erro}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="select-veiculo">Veículo da Frota</label>
              <select
                id="select-veiculo"
                required
                value={veiculoId}
                onChange={(e) => setVeiculoId(e.target.value)}
              >
                <option value="">Selecione um veículo...</option>
                {veiculos.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.placa} — {v.modelo} ({v.kmAtual.toLocaleString('pt-BR')} km)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="select-motorista">Motorista Responsável</label>
              <select
                id="select-motorista"
                required
                value={motoristaId}
                onChange={(e) => setMotoristaId(e.target.value)}
              >
                <option value="">Selecione um motorista...</option>
                {motoristas.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nome} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="form-origem">Local de Origem</label>
              <input
                id="form-origem"
                type="text"
                required
                placeholder="Ex: Garagem Central - Americana/SP"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="form-destino">Local de Destino</label>
              <input
                id="form-destino"
                type="text"
                required
                placeholder="Ex: Centro de Distribuição - Santos/SP"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setModalAberto(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Agendar Viagem
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
