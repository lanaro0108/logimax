import { NextRequest } from 'next/server';
import { conectarBanco } from '@/lib/db';
import { Motorista } from '@/models/Motorista';
import { User } from '@/models/User';
import { Viagem } from '@/models/Viagem';
import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Consulta motorista por ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return respostaErro('Não autenticado', 401);

  const { id } = await params;
  await conectarBanco();
  const motorista = await Motorista.findById(id);
  if (!motorista) return respostaErro('Motorista não encontrado', 404);

  return respostaSucesso({ motorista });
}

// Atualiza dados do motorista
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario || usuario.role !== 'gestor') {
    return respostaErro('Acesso restrito ao gestor de frota', 403);
  }

  const { id } = await params;
  const { nome, telefone, cnh } = await req.json();

  await conectarBanco();
  const motorista = await Motorista.findById(id);
  if (!motorista) return respostaErro('Motorista não encontrado', 404);

  if (nome) {
    motorista.nome = nome.trim();
    await User.findByIdAndUpdate(motorista.userId, { nome: nome.trim() });
  }
  if (telefone) motorista.telefone = telefone.trim();
  if (cnh !== undefined) motorista.cnh = cnh ? cnh.trim() : undefined;

  await motorista.save();
  return respostaSucesso({ motorista });
}

// Exclui motorista respeitando integridade referencial com viagens
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

  // Impede remoção se houver histórico de viagens
  const viagensVinculadas = await Viagem.countDocuments({ motoristaId: id });
  if (viagensVinculadas > 0) {
    return respostaErro(
      'Não é possível excluir o motorista pois existem viagens vinculadas ao seu histórico.',
      400
    );
  }

  const motorista = await Motorista.findByIdAndDelete(id);
  if (!motorista) return respostaErro('Motorista não encontrado', 404);

  // Inativa ou remove a conta de acesso associada
  await User.findByIdAndDelete(motorista.userId);

  return respostaSucesso({ mensagem: 'Motorista excluído com sucesso' });
}
