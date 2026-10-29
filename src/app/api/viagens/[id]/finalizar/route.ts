import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Viagem } from '@/models/Viagem';
import { Veiculo } from '@/models/Veiculo';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Finaliza viagem atualizando o odômetro do veículo com consistência
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  const { id } = await params;
  const { kmFinal } = await req.json();

  if (kmFinal === undefined || kmFinal === null || isNaN(Number(kmFinal))) {
    return respostaErro('Quilometragem final válida é obrigatória', 400);
  }

  const kmFinalNum = Number(kmFinal);
  await conectarBanco();
  const viagem = await Viagem.findById(id);
  if (!viagem) return respostaErro('Viagem não encontrada', 404);

  if (usuario.role === 'motorista' && viagem.motoristaId.toString() !== usuario.motoristaId) {
    return respostaErro('Permissão negada para finalizar viagem de outro motorista', 403);
  }

  if (viagem.status !== 'em_curso') {
    return respostaErro(`Apenas viagens 'em_curso' podem ser finalizadas (atual: ${viagem.status})`, 400);
  }

  const veiculo = await Veiculo.findById(viagem.veiculoId);
  if (!veiculo) return respostaErro('Veículo associado não encontrado', 404);

  if (kmFinalNum < veiculo.kmAtual) {
    return respostaErro(
      `Quilometragem final (${kmFinalNum} km) não pode ser inferior ao odômetro atual do veículo (${veiculo.kmAtual} km).`,
      400
    );
  }

  // Atualiza veículo e finaliza a viagem
  veiculo.kmAtual = kmFinalNum;
  await veiculo.save();

  viagem.status = 'finalizada';
  viagem.kmFinal = kmFinalNum;
  viagem.dataFim = new Date();
  await viagem.save();

  return respostaSucesso({
    mensagem: 'Viagem finalizada e quilometragem atualizada com sucesso',
    viagem,
    veiculo,
  });
}
