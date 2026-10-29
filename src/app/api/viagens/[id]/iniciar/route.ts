import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Viagem } from '@/models/Viagem';
import { Veiculo } from '@/models/Veiculo';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Inicia uma viagem agendada com validação de concorrência
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  const { id } = await params;
  await conectarBanco();
  const viagem = await Viagem.findById(id);
  if (!viagem) return respostaErro('Viagem não encontrada', 404);

  if (usuario.role === 'motorista' && viagem.motoristaId.toString() !== usuario.motoristaId) {
    return respostaErro('Permissão negada para iniciar viagem de outro motorista', 403);
  }

  if (viagem.status !== 'agendada') {
    return respostaErro(`Não é possível iniciar viagem com status '${viagem.status}'`, 400);
  }

  const veiculoOcupado = await Viagem.findOne({
    _id: { $ne: viagem._id },
    veiculoId: viagem.veiculoId,
    status: 'em_curso',
  });
  if (veiculoOcupado) {
    return respostaErro('O veículo já está em trânsito em outra viagem', 400);
  }

  const motoristaOcupado = await Viagem.findOne({
    _id: { $ne: viagem._id },
    motoristaId: viagem.motoristaId,
    status: 'em_curso',
  });
  if (motoristaOcupado) {
    return respostaErro('O motorista já possui outra viagem em curso', 400);
  }

  const veiculo = await Veiculo.findById(viagem.veiculoId);
  viagem.status = 'em_curso';
  viagem.dataInicio = new Date();
  viagem.kmInicial = veiculo ? veiculo.kmAtual : 0;
  await viagem.save();

  return respostaSucesso({ mensagem: 'Viagem iniciada com sucesso', viagem });
}
