import { NextResponse } from 'next/server';

// Retorna resposta padronizada de sucesso
export function respostaSucesso<T>(dados: T, status = 200) {
  return NextResponse.json({ sucesso: true, dados }, { status });
}

// Retorna resposta padronizada de erro
export function respostaErro(mensagem: string, status = 400) {
  return NextResponse.json({ sucesso: false, erro: mensagem }, { status });
}
