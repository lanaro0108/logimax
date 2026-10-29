import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardKpiProps {
  rotulo: string;
  valor: number | string;
  icone: LucideIcon;
  variante?: 'primary' | 'accent' | 'success' | 'danger';
}

// Card de métrica para exibição no dashboard
export function CardKpi({
  rotulo,
  valor,
  icone: Icone,
  variante = 'primary',
}: CardKpiProps) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${variante}`}>
        <Icone size={26} />
      </div>
      <div className="kpi-info">
        <span className="kpi-label">{rotulo}</span>
        <div className="kpi-value">{valor}</div>
      </div>
    </div>
  );
}
