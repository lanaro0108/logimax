import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  nome: string;
  email: string;
  senha: string;
  role: 'gestor' | 'motorista';
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    nome: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: { type: String, required: true },
    role: {
      type: String,
      enum: ['gestor', 'motorista'],
      default: 'motorista',
      required: true,
    },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
