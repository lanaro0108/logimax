import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Viagem } from '@/models/Viagem';
import { Veiculo } from '@/models/Veiculo';
import { Motorista } from '@/models/Motorista';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Lista viagens de acordo com o papel do usuário
export async function GET(req: NextRequest) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  await conectarBanco();
  const filtro: Record<string, any> = {};

  if (usuario.role === 'motorista') {
    if (!usuario.motoristaId) {
      return respostaErro('Perfil de motorista não localizado', 403);
    }
    filtro.motoristaId = usuario.motoristaId;
  } else {
    const statusQuery = req.nextUrl.searchParams.get('status');
    if (statusQuery) filtro.status = statusQuery;
  }

  const viagens = await Viagem.find(filtro)
    .populate('veiculoId', 'placa modelo ano kmAtual kmUltimaManutencao')
    .populate('motoristaId', 'nome email telefone cnh')
    .sort({ createdAt: -1 })
    .lean();

  return respostaSucesso({ viagens });
}

// Cria uma nova viagem (apenas gestor)
export async function POST(req: NextRequest) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  try {
    const { veiculoId, motoristaId, origem, destino } = await req.json();
    if (!veiculoId || !motoristaId || !origem || !destino) {
      return respostaErro('Veículo, motorista, origem e destino são obrigatórios', 400);
    }

    await conectarBanco();
    const veiculo = await Veiculo.findById(veiculoId);
    if (!veiculo) return respostaErro('Veículo não encontrado', 404);

    const motorista = await Motorista.findById(motoristaId);
    if (!motorista) return respostaErro('Motorista não encontrado', 404);

    const conflitoVeiculo = await Viagem.findOne({
      veiculoId,
      status: 'em_curso',
    });
    if (conflitoVeiculo) {
      return respostaErro('O veículo selecionado já possui uma viagem em curso', 400);
    }

    const conflitoMotorista = await Viagem.findOne({
      motoristaId,
      status: 'em_curso',
    });
    if (conflitoMotorista) {
      return respostaErro('O motorista selecionado já possui uma viagem em curso', 400);
    }

    const novaViagem = await Viagem.create({
      veiculoId,
      motoristaId,
      origem: origem.trim(),
      destino: destino.trim(),
      status: 'agendada',
      kmInicial: veiculo.kmAtual,
    });

    return respostaSucesso({ viagem: novaViagem }, 201);
  } catch (erro: any) {
    return respostaErro(erro.message || 'Erro ao criar viagem', 500);
  }
}
