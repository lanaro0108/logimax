import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Motorista } from '@/models/Motorista';
import { User } from '@/models/User';
import { obterUsuarioAutenticado, gerarHashSenha } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Lista todos os motoristas cadastrados
export async function GET() {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  await conectarBanco();
  const motoristas = await Motorista.find().sort({ nome: 1 }).lean();
  return respostaSucesso({ motoristas });
}

// Cria motorista e conta de acesso associada
export async function POST(req: NextRequest) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  try {
    const { nome, email, telefone, cnh, senha } = await req.json();

    if (!nome || !email || !telefone || !senha) {
      return respostaErro('Nome, e-mail, telefone e senha inicial são obrigatórios', 400);
    }

    await conectarBanco();
    const emailLimpo = email.toLowerCase().trim();
    const usuarioExistente = await User.findOne({ email: emailLimpo });
    if (usuarioExistente) {
      return respostaErro('Já existe um usuário cadastrado com este e-mail', 400);
    }

    const senhaHash = await gerarHashSenha(senha);
    const novoUsuario = await User.create({
      nome: nome.trim(),
      email: emailLimpo,
      senha: senhaHash,
      role: 'motorista',
    });

    const novoMotorista = await Motorista.create({
      userId: novoUsuario._id,
      nome: nome.trim(),
      email: emailLimpo,
      telefone: telefone.trim(),
      cnh: cnh ? cnh.trim() : undefined,
    });

    return respostaSucesso({ motorista: novoMotorista }, 201);
  } catch (erro: any) {
    return respostaErro(erro.message || 'Erro ao cadastrar motorista', 500);
  }
}
