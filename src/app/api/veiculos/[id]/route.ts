import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Veiculo, REGEX_PLACA } from '@/models/Veiculo';
import { Viagem } from '@/models/Viagem';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Consulta veículo por ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  const { id } = await params;
  await conectarBanco();
  const veiculo = await Veiculo.findById(id);
  if (!veiculo) return respostaErro('Veículo não encontrado', 404);

  return respostaSucesso({ veiculo });
}

// Atualiza dados do veículo
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  const { id } = await params;
  const { placa, modelo, ano, kmAtual } = await req.json();

  if (placa && !REGEX_PLACA.test(placa.toUpperCase().trim())) {
    return respostaErro('Formato de placa inválido', 400);
  }

  await conectarBanco();
  const veiculo = await Veiculo.findById(id);
  if (!veiculo) return respostaErro('Veículo não encontrado', 404);

  if (placa) veiculo.placa = placa.toUpperCase().trim();
  if (modelo) veiculo.modelo = modelo.trim();
  if (ano !== undefined) veiculo.ano = Number(ano);
  if (kmAtual !== undefined) {
    if (Number(kmAtual) < 0) {
      return respostaErro('Quilometragem não pode ser negativa', 400);
    }
    veiculo.kmAtual = Number(kmAtual);
  }

  await veiculo.save();
  return respostaSucesso({ veiculo });
}

// Exclui veículo respeitando integridade referencial com viagens
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

  // Verifica se o veículo possui qualquer viagem vinculada
  const viagensVinculadas = await Viagem.countDocuments({ veiculoId: id });
  if (viagensVinculadas > 0) {
    return respostaErro(
      'Não é possível excluir o veículo pois existem viagens vinculadas ao seu histórico operacional.',
      400
    );
  }

  const veiculo = await Veiculo.findByIdAndDelete(id);
  if (!veiculo) return respostaErro('Veículo não encontrado', 404);

  return respostaSucesso({ mensagem: 'Veículo excluído com sucesso' });
}
