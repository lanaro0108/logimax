import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Veiculo, REGEX_PLACA } from '@/models/Veiculo';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Lista todos os veículos
export async function GET() {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  await conectarBanco();
  const veiculos = await Veiculo.find().sort({ createdAt: -1 }).lean();

  const veiculosComAlerta = veiculos.map((v) => ({
    ...v,
    precisaManutencao: v.kmAtual - (v.kmUltimaManutencao || 0) >= 10000,
  }));

  return respostaSucesso({ veiculos: veiculosComAlerta });
}

// Cadastra um novo veículo (apenas gestor)
export async function POST(req: NextRequest) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  try {
    const { placa, modelo, ano, kmAtual } = await req.json();

    if (!placa || !modelo || ano === undefined || kmAtual === undefined) {
      return respostaErro('Todos os campos são obrigatórios', 400);
    }

    const placaFormatada = placa.toUpperCase().trim();
    if (!REGEX_PLACA.test(placaFormatada)) {
      return respostaErro('Placa inválida. Utilize o padrão ABC-1234 ou ABC1D23.', 400);
    }

    await conectarBanco();
    const placaExistente = await Veiculo.findOne({ placa: placaFormatada });
    if (placaExistente) {
      return respostaErro('Já existe um veículo cadastrado com esta placa', 400);
    }

    const novoVeiculo = await Veiculo.create({
      placa: placaFormatada,
      modelo: modelo.trim(),
      ano: Number(ano),
      kmAtual: Number(kmAtual),
      kmUltimaManutencao: Number(kmAtual),
    });

    return respostaSucesso({ veiculo: novoVeiculo }, 201);
  } catch (erro: any) {
    return respostaErro(erro.message || 'Erro ao cadastrar veículo', 500);
  }
}
