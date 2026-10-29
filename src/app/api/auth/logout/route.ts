import { removerCookieSessao } from '@/lib/auth';
import { respostaSucesso } from '@/lib/response';

// Encerra a sessão removendo o cookie HTTP
export async function POST() {
  await removerCookieSessao();
  return respostaSucesso({ mensagem: 'Sessão encerrada com sucesso' });
}
