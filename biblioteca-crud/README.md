# Biblioteca CRUD

Painel administrativo para gerenciar uma biblioteca: acervo de livros, autores, categorias, leitores e empréstimos. O projeto é um monorepo com duas aplicações independentes que se comunicam por uma API REST.

```
biblioteca-crud/
├── backend/    API REST (Node.js + Express + Prisma + PostgreSQL/Neon)
├── frontend/   Painel web (React + Vite)
└── README.md   Este arquivo: visão geral da arquitetura e das regras do sistema
```

Cada pasta tem seu próprio README com os detalhes de implementação:
[backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md).

---

## 1. Visão geral da arquitetura

```
┌───────────────────────────┐        HTTP / JSON         ┌──────────────────────────────┐
│  Frontend (React + Vite)  │  ───────────────────────▶  │  Backend (Express)           │
│  http://localhost:5173    │   Authorization: Bearer    │  http://localhost:3000/api   │
│                           │   <JWT>                    │                              │
│  pages → components       │  ◀───────────────────────  │  routes → middlewares →      │
│  → services → axios       │        JSON / { erro }     │  controllers → services      │
└───────────────────────────┘                            └──────────────┬───────────────┘
                                                                        │ Prisma Client
                                                                        ▼
                                                         ┌──────────────────────────────┐
                                                         │  PostgreSQL (Neon)           │
                                                         └──────────────────────────────┘
```

Decisões de arquitetura:

- **Separação em camadas nos dois lados.** No backend: rota → controller (valida entrada e traduz erros em HTTP) → service (regra de negócio e acesso ao banco). No frontend: página (estado e orquestração) → componente (apresentação) → service (chamada HTTP).
- **Backend é a fonte da verdade.** Regras como "livro indisponível não pode ser emprestado" e "somente administrador gerencia leitores" são garantidas na API. O frontend apenas as reflete na interface (por exemplo, listando só livros disponíveis no formulário de empréstimo).
- **Autenticação sem estado (stateless).** A API emite um JWT no login. O frontend guarda o token e o envia em todas as requisições. O servidor não mantém sessão.
- **Contrato de erro único.** Toda falha da API responde `{ "erro": "mensagem" }`, e o frontend exibe essa mensagem diretamente.

---

## 2. Modelo de domínio

```
Usuario 1 ───── N Emprestimo N ───── 1 Livro
                                       │
                         ┌─────────────┴─────────────┐
                    N:N (LivroAutor)          N:N (LivroCategoria)
                         │                           │
                       Autor                     Categoria
```

| Entidade | Papel no sistema |
|---|---|
| **Usuario** | Pessoa cadastrada. Tem `perfil`: `ADMIN` (opera o painel) ou `LEITOR` (quem pega livros emprestados). |
| **Livro** | Item do acervo. O campo `disponivel` indica se está na estante ou emprestado. |
| **Autor / Categoria** | Classificam os livros. Um livro pode ter vários autores e várias categorias. |
| **LivroAutor / LivroCategoria** | Tabelas de junção (muitos-para-muitos) com chave composta. |
| **Emprestimo** | Liga um leitor a um livro, com data de retirada, data prevista, data de devolução e `status` (`ATIVO` ou `DEVOLVIDO`). |

---

## 3. Regras de negócio centrais

### Perfis e acesso

- Somente **administradores** fazem login. O painel é uma ferramenta de gestão.
- **Leitores** são registros gerenciados pelo administrador: são criados sem senha (`senha = null`) e não conseguem autenticar.
- O perfil de um novo usuário criado pela API é sempre `LEITOR`. Ele nunca vem do frontend, o que impede alguém de se promover a administrador pela requisição.
- Rotas de usuários exigem token válido **e** perfil `ADMIN` (verificado no banco a cada requisição).

### Empréstimos

1. A data prevista de devolução precisa ser **futura**.
2. O livro precisa existir e estar **disponível**.
3. Criar um empréstimo e marcar o livro como indisponível acontecem **na mesma transação**. A reserva usa uma atualização condicional (`disponivel: true → false`), então dois pedidos simultâneos pelo mesmo livro não conseguem ambos ter sucesso.
4. Na devolução, o empréstimo passa de `ATIVO` para `DEVOLVIDO`, recebe `dataDevolucao` e o livro volta a ficar disponível, também em transação. Devolver duas vezes retorna conflito (409).
5. Um empréstimo está **atrasado** quando continua `ATIVO` e a data prevista já passou. Essa condição é calculada na hora, não é gravada no banco.

### Integridade

- Não é possível excluir um leitor que tenha empréstimos (a chave estrangeira bloqueia e a API responde 409).
- Ao editar um livro, a lista de autores e categorias enviada **substitui** as associações anteriores.

---

## 4. Fluxo típico: registrar um empréstimo

```
Admin abre "Empréstimos" → "Novo empréstimo"
  1. Frontend carrega leitores e livros (filtra só os disponíveis)
  2. Admin escolhe leitor, livro e data de devolução
  3. POST /api/emprestimos { usuarioId, livroId, dataPrevistaDevolucao }
        └─ autenticarToken valida o JWT
        └─ controller valida tipos e campos
        └─ service abre transação: confere usuário, livro e disponibilidade,
           marca o livro como indisponível, cria o empréstimo
  4. API responde 201 com o empréstimo (incluindo leitor e livro)
  5. Frontend fecha o formulário e recarrega a listagem
```

---

## 5. Como executar

Pré-requisitos: Node.js (versão LTS recente), npm e um banco PostgreSQL no Neon.

```bash
# 1. Backend  (http://localhost:3000)
cd backend
npm install
# crie o arquivo .env (veja backend/README.md)
npx prisma migrate deploy
npx prisma generate
npm run dev

# 2. Frontend (http://localhost:5173), em outro terminal
cd frontend
npm install
# o .env deve conter VITE_API_URL="http://localhost:3000"
npm run dev
```

Atenção: a origem liberada no CORS do backend precisa ser a mesma do frontend. Defina `FRONTEND_URL=http://localhost:5173` no `backend/.env` (o valor padrão no código é `http://localhost:5174`).

O primeiro administrador precisa ser criado direto no banco (veja a seção "Criando o primeiro administrador" em `backend/README.md`).

---

## 6. Estado atual do projeto

**Pronto**
- API completa: autenticação, livros, autores, categorias, associações, leitores, empréstimos e dashboard.
- Painel com telas de Dashboard, Livros, Autores, Categorias, Empréstimos e Usuários (listagem, busca, filtros, cadastro, edição, exclusão e detalhes).

**Pendente**
- Tela de **login** no frontend, proteção de rotas e botão "Sair" funcional. Hoje o token é lido do `localStorage`, mas nenhuma tela o grava, então as rotas protegidas retornam 401 até o login ser implementado.
- Arquivos de página/componente ainda vazios: `Login.jsx`, `LivroDetalhes.jsx` (página), `MeusEmprestimos.jsx`, `AutorDetalhes.jsx`, `LivroCard.jsx`, `EmprestimosRecentes.jsx`, `LivrosPopulares.jsx`.

**Pontos de atenção**
- `GET /api/dashboard` não exige token. Vale protegê-lo com `autenticarToken` (e, se desejado, `autorizarAdmin`).
- Livros, autores, categorias e empréstimos exigem apenas token válido, sem checar perfil. Hoje isso é seguro na prática porque só administradores recebem token, mas, se leitores passarem a logar, será preciso restringir.
- O total de usuários do dashboard conta todas as contas (admins e leitores), enquanto a tela de Usuários lista só leitores.
