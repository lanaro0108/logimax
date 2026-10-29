import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Viagem } from '@/models/Viagem';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Consulta viagem por ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  const { id } = await params;
  await conectarBanco();
  const viagem = await Viagem.findById(id)
    .populate('veiculoId')
    .populate('motoristaId');

  if (!viagem) return respostaErro('Viagem não encontrada', 404);

  if (
    usuario.role === 'motorista' &&
    viagem.motoristaId?._id?.toString() !== usuario.motoristaId
  ) {
    return respostaErro('Acesso não autorizado a esta viagem', 403);
  }

  return respostaSucesso({ viagem });
}

// Exclui viagem (apenas gestor, bloqueando finalizadas)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  const { id } = await params;
  await conectarBanco();
  const viagem = await Viagem.findById(id);
  if (!viagem) return respostaErro('Viagem não encontrada', 404);

  if (viagem.status === 'finalizada') {
    return respostaErro(
      'Viagens finalizadas não podem ser excluídas para preservar o histórico operacional.',
      400
    );
  }

  await Viagem.findByIdAndDelete(id);
  return respostaSucesso({ mensagem: 'Viagem excluída com sucesso' });
}
