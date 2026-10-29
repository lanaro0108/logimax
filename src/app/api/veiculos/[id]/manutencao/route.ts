import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Veiculo } from '@/models/Veiculo';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Registra manutenção realizada atualizando o odômetro de revisão
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  const { id } = await params;
  await conectarBanco();

  const veiculo = await Veiculo.findById(id);
  if (!veiculo) return respostaErro('Veículo não encontrado', 404);

  veiculo.kmUltimaManutencao = veiculo.kmAtual;
  await veiculo.save();

  return respostaSucesso({
    mensagem: 'Manutenção registrada com sucesso',
    veiculo,
  });
}
