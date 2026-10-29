import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { User } from '@/models/User';
import { Motorista } from '@/models/Motorista';
import { validarSenha, gerarTokenJWT, definirCookieSessao } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Rota de autenticação de usuários
export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    if (!email || !senha) {
      return respostaErro('E-mail e senha são obrigatórios', 400);
    }

    await conectarBanco();
    const usuario = await User.findOne({ email: email.toLowerCase().trim() });
    if (!usuario || !usuario.ativo) {
      return respostaErro('Credenciais inválidas ou usuário inativo', 401);
    }

    const senhaCorreta = await validarSenha(senha, usuario.senha);
    if (!senhaCorreta) {
      return respostaErro('Credenciais inválidas ou usuário inativo', 401);
    }

    let motoristaId: string | undefined;
    if (usuario.role === 'motorista') {
      const motorista = await Motorista.findOne({ userId: usuario._id });
      motoristaId = motorista?._id.toString();
    }

    const payload = {
      id: usuario._id.toString(),
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      motoristaId,
    };

    const token = gerarTokenJWT(payload);
    await definirCookieSessao(token);

    return respostaSucesso({ usuario: payload });
  } catch (erro: any) {
    return respostaErro(erro.message || 'Erro interno no servidor', 500);
  }
}
