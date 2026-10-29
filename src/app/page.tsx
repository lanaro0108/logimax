import { redirect } from 'next/navigation';
import { obterUsuarioAutenticado } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Redireciona a rota raiz para a área correspondente ao usuário
export default async function HomePage() {
  const usuario = await obterUsuarioAutenticado();

  if (!usuario) {
    redirect('/login');
  }

  if (usuario.role === 'gestor') {
    redirect('/gestor/dashboard');
  }

  redirect('/motorista/viagens');
}
