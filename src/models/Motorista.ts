import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMotorista extends Document {
  userId: mongoose.Types.ObjectId;
  nome: string;
  email: string;
  telefone: string;
  cnh?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MotoristaSchema = new Schema<IMotorista>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    nome: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    telefone: { type: String, required: true, trim: true },
    cnh: { type: String, trim: true },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Motorista: Model<IMotorista> =
  mongoose.models.Motorista ||
  mongoose.model<IMotorista>('Motorista', MotoristaSchema);
