import { conectarBanco } from '@/lib/db';
import { User } from '@/models/User';
import { Motorista } from '@/models/Motorista';
import { Veiculo } from '@/models/Veiculo';
import { Viagem } from '@/models/Viagem';
import { gerarHashSenha } from '@/lib/auth';
import { respostaSucesso, respostaErro } from '@/lib/response';

// Cria dados iniciais para demonstração e avaliação
export async function POST() {
  try {
    await conectarBanco();

    // Cria gestor se não existir
    let gestor = await User.findOne({ email: 'gestor@logimax.com' });
    if (!gestor) {
      const senhaHash = await gerarHashSenha('senha123');
      gestor = await User.create({
        nome: 'Administrador LogiMax',
        email: 'gestor@logimax.com',
        senha: senhaHash,
        role: 'gestor',
      });
    }

    // Cria motorista 1
    let userMot1 = await User.findOne({ email: 'carlos@logimax.com' });
    let mot1: any;
    if (!userMot1) {
      const senhaHash = await gerarHashSenha('senha123');
      userMot1 = await User.create({
        nome: 'Carlos Silva',
        email: 'carlos@logimax.com',
        senha: senhaHash,
        role: 'motorista',
      });
      mot1 = await Motorista.create({
        userId: userMot1._id,
        nome: 'Carlos Silva',
        email: 'carlos@logimax.com',
        telefone: '(19) 98765-4321',
        cnh: '12345678900',
      });
    } else {
      mot1 = await Motorista.findOne({ userId: userMot1._id });
    }

    // Cria motorista 2
    let userMot2 = await User.findOne({ email: 'mariana@logimax.com' });
    let mot2: any;
    if (!userMot2) {
      const senhaHash = await gerarHashSenha('senha123');
      userMot2 = await User.create({
        nome: 'Mariana Souza',
        email: 'mariana@logimax.com',
        senha: senhaHash,
        role: 'motorista',
      });
      mot2 = await Motorista.create({
        userId: userMot2._id,
        nome: 'Mariana Souza',
        email: 'mariana@logimax.com',
        telefone: '(19) 99887-1122',
        cnh: '98765432100',
      });
    } else {
      mot2 = await Motorista.findOne({ userId: userMot2._id });
    }

    // Cria veículos de teste
    let v1 = await Veiculo.findOne({ placa: 'BRA2E19' });
    if (!v1) {
      v1 = await Veiculo.create({
        placa: 'BRA2E19',
        modelo: 'Volvo FH 540',
        ano: 2023,
        kmAtual: 45000,
        kmUltimaManutencao: 40000,
      });
    }

    let v2 = await Veiculo.findOne({ placa: 'LOG1M24' });
    if (!v2) {
      v2 = await Veiculo.create({
        placa: 'LOG1M24',
        modelo: 'Mercedes-Benz Actros',
        ano: 2024,
        kmAtual: 12500,
        kmUltimaManutencao: 2000, // 10.500 km rodados -> dispara alerta!
      });
    }

    let v3 = await Veiculo.findOne({ placa: 'ABC-1234' });
    if (!v3) {
      v3 = await Veiculo.create({
        placa: 'ABC-1234',
        modelo: 'Scania R450',
        ano: 2022,
        kmAtual: 89000,
        kmUltimaManutencao: 85000,
      });
    }

    // Cria viagem agendada de teste para Carlos
    const viagemExistente = await Viagem.findOne({ motoristaId: mot1._id });
    if (!viagemExistente) {
      await Viagem.create({
        veiculoId: v1._id,
        motoristaId: mot1._id,
        origem: 'Campinas - SP',
        destino: 'Santos - SP',
        status: 'agendada',
        kmInicial: v1.kmAtual,
      });
    }

    return respostaSucesso({
      mensagem: 'Ambiente de testes inicializado com sucesso',
      contas: [
        { papel: 'gestor', email: 'gestor@logimax.com', senha: 'senha123' },
        { papel: 'motorista', email: 'carlos@logimax.com', senha: 'senha123' },
        { papel: 'motorista', email: 'mariana@logimax.com', senha: 'senha123' },
      ],
    });
  } catch (erro: any) {
    return respostaErro(erro.message || 'Erro ao inicializar dados', 500);
  }
}
