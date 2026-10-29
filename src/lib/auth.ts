import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'logimax_secret_jwt_key_senai_2026_dev';
const COOKIE_NOME = 'logimax_token';

export interface PayloadUsuario {
  id: string;
  email: string;
  nome: string;
  role: 'gestor' | 'motorista';
  motoristaId?: string;
}

// Criptografa senha com salt
export async function gerarHashSenha(senha: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
}

// Valida senha comparando texto puro com hash
export async function validarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

// Emite token JWT com expiração de 1 dia
export function gerarTokenJWT(payload: PayloadUsuario): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

// Decodifica e valida token JWT
export function verificarTokenJWT(token: string): PayloadUsuario | null {
  try {
    return jwt.verify(token, JWT_SECRET) as PayloadUsuario;
  } catch {
    return null;
  }
}

// Recupera dados do usuário autenticado no cookie da requisição
export async function obterUsuarioAutenticado(): Promise<PayloadUsuario | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NOME)?.value;
  if (!token) return null;
  return verificarTokenJWT(token);
}

// Define cookie seguro de sessão
export async function definirCookieSessao(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NOME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
  });
}

// Remove cookie seguro de sessão
export async function removerCookieSessao(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NOME);
}
