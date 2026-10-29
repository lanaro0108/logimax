'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Truck, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface VeiculoItem {
  _id: string;
  placa: string;
  modelo: string;
  ano: number;
  kmAtual: number;
  kmUltimaManutencao: number;
  precisaManutencao: boolean;
}

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<VeiculoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Estados do formulário
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [kmAtual, setKmAtual] = useState(0);

  async function carregarVeiculos() {
    try {
      const res = await fetch('/api/veiculos');
      const data = await res.json();
      if (res.ok) setVeiculos(data.dados?.veiculos || []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarVeiculos();
  }, []);

  function abrirModalCriar() {
    setEditandoId(null);
    setPlaca('');
    setModelo('');
    setAno(new Date().getFullYear());
    setKmAtual(0);
    setErro('');
    setModalAberto(true);
  }

  function abrirModalEditar(v: VeiculoItem) {
    setEditandoId(v._id);
    setPlaca(v.placa);
    setModelo(v.modelo);
    setAno(v.ano);
    setKmAtual(v.kmAtual);
    setErro('');
    setModalAberto(true);
  }

  async function salvarVeiculo(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    const url = editandoId ? `/api/veiculos/${editandoId}` : '/api/veiculos';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa, modelo, ano, kmAtual }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Falha ao salvar veículo');
        return;
      }
      setSucesso(editandoId ? 'Veículo atualizado!' : 'Veículo cadastrado!');
      setTimeout(() => setSucesso(''), 4000);
      setModalAberto(false);
      carregarVeiculos();
    } catch {
      setErro('Erro na conexão com o servidor');
    }
  }

  async function excluirVeiculo(id: string, placaVeic: string) {
    if (!confirm(`Confirma a exclusão do veículo ${placaVeic}?`)) return;
    setErro('');
    try {
      const res = await fetch(`/api/veiculos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Erro ao excluir veículo');
        return;
      }
      setSucesso('Veículo excluído com sucesso!');
      setTimeout(() => setSucesso(''), 4000);
      carregarVeiculos();
    } catch {
      setErro('Erro ao processar exclusão');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Veículos</h1>
          <p className="page-subtitle">Cadastre, edite e monitore a quilometragem da frota</p>
        </div>
        <button onClick={abrirModalCriar} className="btn-primary">
          <Plus size={18} />
          <span>Novo Veículo</span>
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

      <div className="table-container">
        {carregando ? (
          <p style={{ padding: 24, color: '#64748B' }}>Carregando frota...</p>
        ) : veiculos.length === 0 ? (
          <p style={{ padding: 24, color: '#64748B', textAlign: 'center' }}>
            Nenhum veículo cadastrado. Clique no botão acima para adicionar.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Modelo</th>
                <th>Ano</th>
                <th>Quilometragem Atual</th>
                <th>Manutenção</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v._id}>
                  <td><strong>{v.placa}</strong></td>
                  <td>{v.modelo}</td>
                  <td>{v.ano}</td>
                  <td>{v.kmAtual.toLocaleString('pt-BR')} km</td>
                  <td>
                    {v.precisaManutencao ? (
                      <span className="badge alerta-manutencao">
                        <Wrench size={12} /> Revisão Pendente
                      </span>
                    ) : (
                      <span className="badge ok">Em Dia</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => abrirModalEditar(v)}
                      className="btn-secondary btn-sm"
                      style={{ marginRight: 8 }}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => excluirVeiculo(v._id, v.placa)}
                      className="btn-danger btn-sm"
                      title="Excluir"
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

      {/* Modal de Cadastro / Edição */}
      <Modal
        aberto={modalAberto}
        titulo={editandoId ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarVeiculo}>
          <div className="modal-body">
            {erro && (
              <div className="alert-box danger" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{erro}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="form-placa">Placa</label>
              <input
                id="form-placa"
                type="text"
                required
                maxLength={8}
                placeholder="Ex: ABC-1234 ou ABC1D23"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                disabled={!!editandoId}
              />
              <span className="form-help">Formato brasileiro padrão tradicional ou Mercosul</span>
            </div>

            <div className="form-group">
              <label htmlFor="form-modelo">Modelo do Veículo</label>
              <input
                id="form-modelo"
                type="text"
                required
                placeholder="Ex: Scania R450 ou Volvo FH"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="form-ano">Ano de Fabricação</label>
                <input
                  id="form-ano"
                  type="number"
                  required
                  min={1980}
                  max={new Date().getFullYear() + 1}
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-km">Quilometragem (KM)</label>
                <input
                  id="form-km"
                  type="number"
                  required
                  min={0}
                  value={kmAtual}
                  onChange={(e) => setKmAtual(Number(e.target.value))}
                />
              </div>
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
              {editandoId ? 'Salvar Alterações' : 'Cadastrar Veículo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
