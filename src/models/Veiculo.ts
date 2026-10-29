import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVeiculo extends Document {
  placa: string;
  modelo: string;
  ano: number;
  kmAtual: number;
  kmUltimaManutencao: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Regex para padrão tradicional (ABC-1234) ou Mercosul (ABC1D23)
export const REGEX_PLACA = /^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/;

const VeiculoSchema = new Schema<IVeiculo>(
  {
    placa: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [REGEX_PLACA, 'Formato de placa inválido. Use ABC-1234 ou ABC1D23.'],
    },
    modelo: { type: String, required: true, trim: true },
    ano: {
      type: Number,
      required: true,
      min: [1980, 'Ano inválido'],
      max: [new Date().getFullYear() + 1, 'Ano não pode ser futuro'],
    },
    kmAtual: {
      type: Number,
      required: true,
      min: [0, 'Quilometragem não pode ser negativa'],
      default: 0,
    },
    kmUltimaManutencao: {
      type: Number,
      default: 0,
      min: [0, 'Quilometragem não pode ser negativa'],
    },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Veiculo: Model<IVeiculo> =
  mongoose.models.Veiculo || mongoose.model<IVeiculo>('Veiculo', VeiculoSchema);
