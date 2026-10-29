'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface MotoristaItem {
  _id: string;
  nome: string;
  email: string;
  telefone: string;
  cnh?: string;
}

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<MotoristaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cnh, setCnh] = useState('');
  const [senha, setSenha] = useState('');

  async function carregarMotoristas() {
    try {
      const res = await fetch('/api/motoristas');
      const data = await res.json();
      if (res.ok) setMotoristas(data.dados?.motoristas || []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMotoristas();
  }, []);

  function abrirModalCriar() {
    setEditandoId(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCnh('');
    setSenha('');
    setErro('');
    setModalAberto(true);
  }

  function abrirModalEditar(m: MotoristaItem) {
    setEditandoId(m._id);
    setNome(m.nome);
    setEmail(m.email);
    setTelefone(m.telefone);
    setCnh(m.cnh || '');
    setSenha('');
    setErro('');
    setModalAberto(true);
  }

  async function salvarMotorista(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    const url = editandoId ? `/api/motoristas/${editandoId}` : '/api/motoristas';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, cnh, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Falha ao salvar motorista');
        return;
      }
      setSucesso(editandoId ? 'Motorista atualizado!' : 'Motorista e credencial cadastrados!');
      setTimeout(() => setSucesso(''), 4000);
      setModalAberto(false);
      carregarMotoristas();
    } catch {
      setErro('Erro na conexão com o servidor');
    }
  }

  async function excluirMotorista(id: string, nomeMot: string) {
    if (!confirm(`Confirma a exclusão do motorista ${nomeMot}?`)) return;
    setErro('');
    try {
      const res = await fetch(`/api/motoristas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Erro ao excluir motorista');
        return;
      }
      setSucesso('Motorista excluído com sucesso!');
      setTimeout(() => setSucesso(''), 4000);
      carregarMotoristas();
    } catch {
      setErro('Erro ao processar exclusão');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Motoristas</h1>
          <p className="page-subtitle">Controle de equipe de campo e geração de credenciais de acesso</p>
        </div>
        <button onClick={abrirModalCriar} className="btn-primary">
          <Plus size={18} />
          <span>Novo Motorista</span>
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
          <p style={{ padding: 24, color: '#64748B' }}>Carregando motoristas...</p>
        ) : motoristas.length === 0 ? (
          <p style={{ padding: 24, color: '#64748B', textAlign: 'center' }}>
            Nenhum motorista cadastrado no momento.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>E-mail (Login)</th>
                <th>Telefone</th>
                <th>CNH</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {motoristas.map((m) => (
                <tr key={m._id}>
                  <td><strong>{m.nome}</strong></td>
                  <td>{m.email}</td>
                  <td>{m.telefone}</td>
                  <td>{m.cnh || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => abrirModalEditar(m)}
                      className="btn-secondary btn-sm"
                      style={{ marginRight: 8 }}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => excluirMotorista(m._id, m.nome)}
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
        titulo={editandoId ? 'Editar Motorista' : 'Cadastrar Novo Motorista'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarMotorista}>
          <div className="modal-body">
            {erro && (
              <div className="alert-box danger" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{erro}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="form-nome">Nome Completo</label>
              <input
                id="form-nome"
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="form-email">E-mail Institucional (Login)</label>
              <input
                id="form-email"
                type="email"
                required
                placeholder="joao@logimax.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!editandoId}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="form-telefone">Telefone / WhatsApp</label>
                <input
                  id="form-telefone"
                  type="text"
                  required
                  placeholder="(19) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-cnh">CNH (Opcional)</label>
                <input
                  id="form-cnh"
                  type="text"
                  placeholder="Número da CNH"
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value)}
                />
              </div>
            </div>

            {!editandoId && (
              <div className="form-group">
                <label htmlFor="form-senha">Senha Inicial de Acesso</label>
                <input
                  id="form-senha"
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <span className="form-help">Esta senha será usada pelo motorista no aplicativo</span>
              </div>
            )}
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
              {editandoId ? 'Salvar Alterações' : 'Cadastrar Motorista'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
