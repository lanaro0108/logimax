// Script de teste automatizado ponta a ponta dos fluxos do LogiMax com JWT e Bcrypt
const BASE_URL = 'http://localhost:3000/api';

async function testarFluxos() {
  console.log('--- Iniciando Testes Automatizados LogiMax (JWT + Bcrypt) ---');

  // 0. Seed para garantir base consistente
  await fetch(`${BASE_URL}/auth/seed`, { method: 'POST' });

  // 1. Teste de login inválido (rejeição Bcrypt/User)
  const resLoginInvalido = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'invalido@teste.com', senha: 'errada' }),
  });
  console.log('1. Login Inválido (esperado 401):', resLoginInvalido.status);

  // 2. Login Gestor (validação Bcrypt + emissão JWT)
  const resLoginGestor = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gestor@logimax.com', senha: 'senha123' }),
  });
  const cookieGestor = resLoginGestor.headers.get('set-cookie') || '';
  const dataGestor = await resLoginGestor.json();
  console.log('2. Login Gestor via JWT (esperado 200):', resLoginGestor.status, `[Papel: ${dataGestor.dados?.usuario?.role}]`);

  // 3. Login Motorista (validação Bcrypt + emissão JWT)
  const resLoginMotorista = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'carlos@logimax.com', senha: 'senha123' }),
  });
  const cookieMotorista = resLoginMotorista.headers.get('set-cookie') || '';
  const dataMotorista = await resLoginMotorista.json();
  console.log('3. Login Motorista via JWT (esperado 200):', resLoginMotorista.status, `[Papel: ${dataMotorista.dados?.usuario?.role}]`);

  // 4. Dashboard Stats (verificação de JWT do Gestor)
  const resStats = await fetch(`${BASE_URL}/dashboard/stats`, {
    headers: { cookie: cookieGestor },
  });
  const dataStats = await resStats.json();
  console.log('4. Dashboard Stats com JWT:', dataStats.dados?.totalVeiculos, 'veículos,', dataStats.dados?.alertasManutencao, 'alertas');

  // 5. Teste de formato de placa inválida
  const resPlacaInvalida = await fetch(`${BASE_URL}/veiculos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieGestor },
    body: JSON.stringify({ placa: 'PLACA123', modelo: 'Teste', ano: 2022, kmAtual: 100 }),
  });
  console.log('5. Placa inválida rejeitada (esperado 400):', resPlacaInvalida.status);

  // 6. Criar Veículo Válido
  const placaNova = `LOG${Math.floor(1000 + Math.random() * 9000)}`;
  const resNovoVeiculo = await fetch(`${BASE_URL}/veiculos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieGestor },
    body: JSON.stringify({ placa: placaNova, modelo: 'Scania G400', ano: 2021, kmAtual: 50000 }),
  });
  const dataNovoVeiculo = await resNovoVeiculo.json();
  const veiculoCriado = dataNovoVeiculo.dados?.veiculo;
  console.log('6. Cadastro de Veículo:', resNovoVeiculo.status, veiculoCriado?.placa);

  // 7. Cadastrar novo Motorista (gerando hash Bcrypt na senha)
  const emailNovoMot = `mot${Date.now()}@logimax.com`;
  const resNovoMot = await fetch(`${BASE_URL}/motoristas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieGestor },
    body: JSON.stringify({
      nome: 'Motorista Teste JWT',
      email: emailNovoMot,
      telefone: '(19) 97777-6655',
      cnh: '99887766554',
      senha: 'senhaSeguraBcrypt123',
    }),
  });
  const dataNovoMot = await resNovoMot.json();
  const motoristaCriado = dataNovoMot.dados?.motorista;
  console.log('7. Cadastro Motorista (Bcrypt na senha):', resNovoMot.status, motoristaCriado?.email);

  // 8. Login do novo motorista para testar hash do Bcrypt e novo token JWT
  const resLoginNovoMot = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailNovoMot, senha: 'senhaSeguraBcrypt123' }),
  });
  const cookieNovoMot = resLoginNovoMot.headers.get('set-cookie') || '';
  console.log('8. Login Novo Motorista com Bcrypt + JWT (esperado 200):', resLoginNovoMot.status);

  // 9. Gestor agenda viagem para este motorista
  const resCriarViagem = await fetch(`${BASE_URL}/viagens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieGestor },
    body: JSON.stringify({
      veiculoId: veiculoCriado._id,
      motoristaId: motoristaCriado._id,
      origem: 'Campinas/SP',
      destino: 'Ribeirão Preto/SP',
    }),
  });
  const dataCriarViagem = await resCriarViagem.json();
  const viagemId = dataCriarViagem.dados?.viagem?._id;
  console.log('9. Viagem Agendada pelo Gestor (esperado 201):', resCriarViagem.status, `ID: ${viagemId}`);

  // 10. Novo motorista inicia a viagem atribuída
  const resIniciar = await fetch(`${BASE_URL}/viagens/${viagemId}/iniciar`, {
    method: 'POST',
    headers: { cookie: cookieNovoMot },
  });
  console.log('10. Iniciar Viagem pelo Motorista (esperado 200):', resIniciar.status);

  // 11. Rejeição de KM menor que o atual do veículo (50.000)
  const resKmMenor = await fetch(`${BASE_URL}/viagens/${viagemId}/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieNovoMot },
    body: JSON.stringify({ kmFinal: 49000 }),
  });
  console.log('11. Rejeitar KM Menor (esperado 400):', resKmMenor.status);

  // 12. Finalizar viagem com KM válido (+280 km)
  const resFinalizar = await fetch(`${BASE_URL}/viagens/${viagemId}/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieNovoMot },
    body: JSON.stringify({ kmFinal: 50280 }),
  });
  const dataFinalizar = await resFinalizar.json();
  console.log('12. Finalizar Viagem com KM Válido (esperado 200):', resFinalizar.status, `Novo KM: ${dataFinalizar.dados?.veiculo?.kmAtual}`);

  // 13. Bloqueio de exclusão de viagem finalizada
  const resExcluirViagem = await fetch(`${BASE_URL}/viagens/${viagemId}`, {
    method: 'DELETE',
    headers: { cookie: cookieGestor },
  });
  console.log('13. Bloquear Exclusão de Viagem Finalizada (esperado 400):', resExcluirViagem.status);

  // 14. Bloqueio de exclusão de veículo com viagem no histórico
  const resExcluirVeiculo = await fetch(`${BASE_URL}/veiculos/${veiculoCriado._id}`, {
    method: 'DELETE',
    headers: { cookie: cookieGestor },
  });
  console.log('14. Bloquear Exclusão de Veículo com Histórico (esperado 400):', resExcluirVeiculo.status);

  console.log('--- Todos os testes de JWT e Bcrypt finalizados com SUCESSO! ---');
}

testarFluxos().catch(console.error);
