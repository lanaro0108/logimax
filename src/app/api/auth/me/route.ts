import { obterUsuarioAutenticado } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Retorna os dados do usuário conectado
export async function GET() {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) {
    return respostaErro('Não autenticado', 401);
  }
  return respostaSucesso({ usuario });
}
