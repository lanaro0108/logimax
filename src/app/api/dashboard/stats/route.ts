import { conectarBanco } from '@/lib/db';
import { Veiculo } from '@/models/Veiculo';
import { Motorista } from '@/models/Motorista';
import { Viagem } from '@/models/Viagem';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Consolida indicadores gerais para o dashboard do gestor
export async function GET() {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  await conectarBanco();

  const [totalVeiculos, totalMotoristas, viagensEmCurso, veiculos] =
    await Promise.all([
      Veiculo.countDocuments(),
      Motorista.countDocuments(),
      Viagem.countDocuments({ status: 'em_curso' }),
      Veiculo.find().lean(),
    ]);

  const veiculosAlerta = veiculos.filter(
    (v) => v.kmAtual - (v.kmUltimaManutencao || 0) >= 10000
  );

  return respostaSucesso({
    totalVeiculos,
    totalMotoristas,
    viagensEmCurso,
    alertasManutencao: veiculosAlerta.length,
    veiculosComAlerta: veiculosAlerta,
  });
}
