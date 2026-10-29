import mongoose, { Schema, Document, Model } from 'mongoose';

export type StatusViagem = 'agendada' | 'em_curso' | 'finalizada';

export interface IViagem extends Document {
  veiculoId: mongoose.Types.ObjectId;
  motoristaId: mongoose.Types.ObjectId;
  origem: string;
  destino: string;
  status: StatusViagem;
  kmInicial?: number;
  kmFinal?: number;
  dataInicio?: Date;
  dataFim?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ViagemSchema = new Schema<IViagem>(
  {
    veiculoId: {
      type: Schema.Types.ObjectId,
      ref: 'Veiculo',
      required: true,
    },
    motoristaId: {
      type: Schema.Types.ObjectId,
      ref: 'Motorista',
      required: true,
    },
    origem: { type: String, required: true, trim: true },
    destino: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['agendada', 'em_curso', 'finalizada'],
      default: 'agendada',
      required: true,
    },
    kmInicial: { type: Number },
    kmFinal: { type: Number },
    dataInicio: { type: Date },
    dataFim: { type: Date },
  },
  { timestamps: true }
);

export const Viagem: Model<IViagem> =
  mongoose.models.Viagem || mongoose.model<IViagem>('Viagem', ViagemSchema);
