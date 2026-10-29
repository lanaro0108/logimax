'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Users, Navigation, AlertTriangle, Wrench, CheckCircle } from 'lucide-react';
import { CardKpi } from '@/components/CardKpi';

interface Estatisticas {
  totalVeiculos: number;
  totalMotoristas: number;
  viagensEmCurso: number;
  alertasManutencao: number;
  veiculosComAlerta: Array<{
    _id: string;
    placa: string;
    modelo: string;
    kmAtual: number;
    kmUltimaManutencao: number;
  }>;
}

export default function GestorDashboardPage() {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  async function carregarEstatisticas() {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (res.ok) setStats(data.dados);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  async function handleRegistrarManutencao(veiculoId: string) {
    const res = await fetch(`/api/veiculos/${veiculoId}/manutencao`, {
      method: 'POST',
    });
    if (res.ok) {
      setMensagemSucesso('Manutenção preventiva registrada com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 4000);
      carregarEstatisticas();
    }
  }

  if (carregando) return <p>Carregando indicadores da frota...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel Geral de Operações</h1>
          <p className="page-subtitle">Indicadores consolidados da frota e monitoramento preventivo</p>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Grid de KPIs */}
      <div className="kpi-grid">
        <CardKpi
          rotulo="Total de Veículos"
          valor={stats?.totalVeiculos ?? 0}
          icone={Truck}
          variante="primary"
        />
        <CardKpi
          rotulo="Motoristas Cadastrados"
          valor={stats?.totalMotoristas ?? 0}
          icone={Users}
          variante="accent"
        />
        <CardKpi
          rotulo="Viagens em Trânsito"
          valor={stats?.viagensEmCurso ?? 0}
          icone={Navigation}
          variante="success"
        />
        <CardKpi
          rotulo="Alertas de Manutenção"
          valor={stats?.alertasManutencao ?? 0}
          icone={AlertTriangle}
          variante="danger"
        />
      </div>

      {/* Alertas Críticos de Manutenção Preventiva */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Wrench size={22} color="#EF4444" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#12345A' }}>
            Alertas de Manutenção Preventiva (10.000+ km rodados)
          </h2>
        </div>

        {(!stats?.veiculosComAlerta || stats.veiculosComAlerta.length === 0) ? (
          <div className="table-container" style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>
            Nenhum veículo atingiu a quilometragem limite de manutenção no momento. Todos os odômetros estão em conformidade.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>KM Atual</th>
                  <th>Última Revisão</th>
                  <th>KM Rodados Desde Revisão</th>
                  <th style={{ textAlign: 'right' }}>Ação Preventiva</th>
                </tr>
              </thead>
              <tbody>
                {stats.veiculosComAlerta.map((v) => {
                  const kmRodados = v.kmAtual - (v.kmUltimaManutencao || 0);
                  return (
                    <tr key={v._id}>
                      <td><strong>{v.placa}</strong></td>
                      <td>{v.modelo}</td>
                      <td>{v.kmAtual.toLocaleString('pt-BR')} km</td>
                      <td>{(v.kmUltimaManutencao || 0).toLocaleString('pt-BR')} km</td>
                      <td>
                        <span className="badge alerta-manutencao">
                          +{kmRodados.toLocaleString('pt-BR')} km rodados
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleRegistrarManutencao(v._id)}
                          className="btn-primary btn-sm"
                        >
                          <Wrench size={14} />
                          <span>Registrar Revisão</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
