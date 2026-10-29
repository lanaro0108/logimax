# LogiMax — Sistema de Gerenciamento de Frotas

MVP corporativo de gestão de frota, motoristas, viagens e manutenção preventiva desenvolvido para a Situação de Aprendizagem do **SENAI**.

---

## 1. Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend & Backend** | Next.js 16 (App Router) | Renderização híbrida e Next.js Route Handlers |
| **Linguagem** | TypeScript | Tipagem estática rigorosa de ponta a ponta |
| **Banco de Dados** | MongoDB v9 | Banco de dados NoSQL orientado a documentos |
| **ODM** | Mongoose | Modelagem de dados, validações e integridade referencial |
| **Autenticação** | JWT (`jsonwebtoken`) | Tokens assinados em cookies seguros `HttpOnly` com SameSite |
| **Segurança de Senhas** | Bcrypt (`bcrypt`) | Criptografia irreversível com salt rounds (fator 10) |
| **Estilização** | SCSS (Sass) | Folhas de estilo modulares corporativas (sem Tailwind) |
| **Ícones** | Lucide React | Identificação visual corporativa e intuitiva |

---

## 2. Autenticação e Autorização com JWT e Bcrypt

O fluxo de segurança implementado em [`src/lib/auth.ts`](file:///c:/Users/2DevSESI/Documents/Pedro%20Lanaro/Fabrica%20de%20Softwares/logimax/src/lib/auth.ts) segue as melhores práticas:

1. **Criptografia de Senhas (Bcrypt):**
   - Ao cadastrar um usuário ou motorista, a senha nunca é armazenada em texto puro.
   - É gerado um salt aleatório e a senha é transformada em hash via `bcrypt.hash(senha, salt)`.
   - Na validação de login, `bcrypt.compare(senha, hash)` verifica a autenticidade sem expor a senha.

2. **Tokens de Acesso (JWT):**
   - No login bem-sucedido, é emitido um token assinado com algoritmo HMAC SHA-256 e validade de 24 horas.
   - O payload contém: `id`, `email`, `nome`, `role` (`gestor` ou `motorista`) e `motoristaId` (quando aplicável).
   - O token é gravado em um cookie **HttpOnly**, protegido contra ataques XSS e inacessível via JavaScript no navegador.

3. **Controle de Acesso Baseado em Papéis (RBAC):**
   - As rotas administrativas (`/gestor/*` e APIs correspondentes) validam o claim `role === 'gestor'`.
   - As rotas de operação de campo (`/motorista/*`) garantem que o condutor acesse estritamente suas viagens atribuídas.

---

## 3. Funcionalidades do Sistema

### 3.1 Painel do Gestor
- **Dashboard Executivo:** Indicadores em tempo real de total de veículos, motoristas cadastrados, viagens em trânsito e alertas de manutenção preventiva.
- **Gerenciamento de Veículos:** Cadastro com validação de placa brasileira (padrão tradicional ou Mercosul), modelo, ano e quilometragem. Trava de segurança que impede a exclusão de veículos vinculados a viagens.
- **Gerenciamento de Motoristas:** Cadastro unificado de motorista e credencial de acesso criptografada com Bcrypt. Trava de segurança contra remoção de condutores com histórico.
- **Gestão de Viagens:** Agendamento de viagens com validação de concorrência (impede que veículos ou motoristas já em trânsito sejam alocados simultaneamente). Bloqueio estrito de exclusão para viagens concluídas.
- **Manutenção Preventiva (Bônus):** Alerta automático quando a diferença `kmAtual - kmUltimaManutencao >= 10.000 km`. Ação rápida para registrar a revisão e resetar o alerta.

### 3.2 Painel do Motorista
- **Minhas Viagens:** Visualização exclusiva das viagens atribuídas ao usuário logado.
- **Iniciar Viagem:** Transição segura de `agendada` para `em_curso`, registrando o odômetro de saída.
- **Finalizar Viagem:** Modal solicitando o odômetro final, validando no servidor se `kmFinal >= kmAtual` do veículo e atualizando a frota atomicamente.

---

## 4. Estrutura do Projeto

```text
logimax/
├── public/
│   └── logo.png                  # Logotipo oficial LogiMax
├── scripts/
│   └── test_fluxo.mjs            # Bateria automatizada de testes ponta a ponta
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # Rotas de login, logout, me e seed
│   │   │   ├── dashboard/        # Estatísticas e alertas do gestor
│   │   │   ├── motoristas/       # CRUD de motoristas
│   │   │   ├── veiculos/         # CRUD de veículos e revisão
│   │   │   └── viagens/          # Gestão e ciclo de vida de viagens
│   │   ├── gestor/               # Páginas do painel administrativo
│   │   ├── motorista/            # Páginas do portal do motorista
│   │   ├── login/                # Tela corporativa de login
│   │   ├── layout.tsx            # Layout raiz
│   │   └── page.tsx              # Redirecionador por perfil
│   ├── components/               # Header, Sidebar, Modal, CardKpi
│   ├── lib/
│   │   ├── auth.ts               # Lógica de JWT, Bcrypt e cookies seguros
│   │   ├── db.ts                 # Conexão Mongoose com cache global
│   │   └── response.ts           # Respostas HTTP padronizadas
│   ├── models/                   # Models Mongoose (User, Veiculo, Motorista, Viagem)
│   └── styles/                   # SCSS modular com identidade visual corporativa
├── .env.local                    # Configurações de ambiente locais
├── .env.example                  # Template de variáveis
└── package.json
```

---

## 5. Configuração e Execução

### 5.1 Pré-requisitos
- Node.js versão 18+ instalada.
- MongoDB Server em execução local (`mongodb://127.0.0.1:27017`).

### 5.2 Instalação das Dependências
No diretório `logimax`:
```bash
npm install
```

### 5.3 Variáveis de Ambiente
O arquivo `.env.local` contém:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/logimax
JWT_SECRET=logimax_secret_jwt_key_senai_2026_dev
NODE_ENV=development
```

### 5.4 Inicialização da Aplicação
Modo de desenvolvimento:
```bash
npm run dev
```
Acesse no navegador: `http://localhost:3000`

---

## 6. Contas de Homologação / Teste

O sistema possui uma rotina de inicialização automática de dados de teste (botão *"Preencher Gestor / Preencher Motorista"* na tela de login, ou via chamada a `/api/auth/seed`):

| Papel | E-mail | Senha | Acesso |
|---|---|---|---|
| **Gestor** | `gestor@logimax.com` | `senha123` | Painel Administrativo Completo (`/gestor/dashboard`) |
| **Motorista** | `carlos@logimax.com` | `senha123` | Portal de Viagens Pessoais (`/motorista/viagens`) |
| **Motorista** | `mariana@logimax.com` | `senha123` | Portal de Viagens Pessoais (`/motorista/viagens`) |

---

## 7. Execução dos Testes Automatizados

Para executar todos os testes automatizados de integração, validação de regras de negócio, criptografia Bcrypt e tokens JWT:

```bash
node scripts/test_fluxo.mjs
```

Para validar a integridade de compilação de produção e checagem de tipos TypeScript:
```bash
npm run build
```
