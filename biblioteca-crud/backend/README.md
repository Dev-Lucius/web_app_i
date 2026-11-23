# Backend: API da Biblioteca

API REST em Node.js que implementa as regras de negócio da biblioteca. Veja o [README da raiz](../README.md) para a visão geral do sistema.

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js + Express 5 | Servidor HTTP e roteamento |
| Prisma 7 | ORM, migrations e client tipado |
| PostgreSQL (Neon) | Banco de dados, acessado pelo adapter `@prisma/adapter-neon` |
| jsonwebtoken | Emissão e verificação de JWT |
| bcrypt | Hash e comparação de senhas |
| cors / dotenv | CORS e variáveis de ambiente |
| tsx | Executa o projeto em desenvolvimento (o client gerado pelo Prisma é `.ts`) |

## Estrutura

```
backend/
├── prisma/
│   ├── schema.prisma         Modelos, enum de perfil e relações
│   └── migrations/           Histórico versionado do banco
├── prisma.config.ts          Configuração da CLI do Prisma (usa DIRECT_URL)
└── src/
    ├── server.js             Sobe o servidor (PORT)
    ├── app.js                Monta o Express: CORS, JSON, rotas /api/*
    ├── prisma.js             Instância única do Prisma Client (adapter Neon)
    ├── routes/               Mapeia URL + método → controller e aplica middlewares
    ├── middlewares/          autenticarToken e autorizarAdmin
    ├── controllers/          Valida a entrada e traduz resultados/erros em HTTP
    ├── services/             Regras de negócio e consultas ao banco
    └── generated/prisma/     Client gerado por `prisma generate` (não editar)
```

## Arquitetura em camadas

```
Requisição
   │
   ▼
routes/*.routes.js        "Qual função atende esta URL? Quem pode chamar?"
   │   router.use(autenticarToken)   [+ autorizarAdmin nas rotas de usuário]
   ▼
controllers/*.controller.js   Valida body/params (tipos, obrigatórios, ids numéricos)
   │                          Chama o service e escolhe o status HTTP
   ▼
services/*.service.js     Regras de negócio, transações e consultas Prisma
   │                      Falhas de regra viram Error com `error.code`
   ▼
prisma.js → PostgreSQL
```

Cada camada tem uma responsabilidade:

- **Rota**: só declara caminhos e segurança.
- **Controller**: conhece HTTP (`req`, `res`, status). Não conhece o banco.
- **Service**: conhece as regras e o banco. Não conhece HTTP; sinaliza problemas com erros que carregam um `code` (por exemplo `LIVRO_INDISPONIVEL`).

O controller mapeia esses `code` (e os códigos de erro do Prisma, como `P2002`, `P2003` e `P2025`) para o status adequado.

## Banco de dados

O modelo está em `prisma/schema.prisma`:

- `Usuario` (`perfil`: enum `ADMIN | LEITOR`, `senha` opcional, `email` único)
- `Livro` (`isbn` único e opcional, `disponivel` booleano)
- `Autor`, `Categoria` (`nome` único em Categoria)
- `LivroAutor`, `LivroCategoria`: junções com chave composta (`@@id([livroId, autorId])`)
- `Emprestimo`: `status` é texto (`"ATIVO"` ou `"DEVOLVIDO"`), com `dataDevolucao` nulo enquanto ativo

**Duas conexões com o Neon**, cada uma com um papel:

| Variável | Quem usa | Por quê |
|---|---|---|
| `DATABASE_URL` | A aplicação (`src/prisma.js`) | Conexão do runtime, via adapter Neon e WebSocket |
| `DIRECT_URL` | Prisma CLI (`prisma.config.ts`) | Conexão direta, usada para rodar migrations |

## Autenticação e autorização

### Login (`POST /api/auth/login`)

1. O controller normaliza o e-mail (trim + minúsculas) e valida formato e tipos.
2. O service busca o usuário e só segue se ele existir, for `ADMIN` e tiver senha.
3. Compara a senha informada com o hash usando `bcrypt.compare`.
4. Gera um JWT com payload `{ id }`, assinado com `JWT_SECRET` e validade `JWT_EXPIRES_IN` (padrão `1h`).
5. Responde com `{ usuario: { id, nome, email, perfil }, token }`.

Todas as falhas de credencial usam a mesma mensagem ("Email ou senha incorretos."), para não revelar se o e-mail existe ou se a conta é de leitor.

### Middlewares (`src/middlewares/auth.middlewares.js`)

- **`autenticarToken`**: exige `Authorization: Bearer <token>`, verifica assinatura e validade e confere se o payload tem um `id` inteiro positivo. Em caso de sucesso preenche `req.usuario` e `req.userId`. Responde 401 para token ausente, malformado, inválido ou expirado.
- **`autorizarAdmin`**: roda depois do anterior, consulta o usuário **no banco** e exige `perfil === "ADMIN"`. Responde 401 se o usuário não existe mais e 403 se não for administrador. O perfil é lido do banco (não do token), então rebaixar ou remover um admin tem efeito imediato.

### Quem acessa o quê

| Recurso | Exigência |
|---|---|
| `/api/health`, `POST /api/auth/login` | Público |
| `GET /api/auth/me` | Token válido |
| `/api/livros`, `/autores`, `/categorias`, `/livro-autores`, `/livro-categorias`, `/emprestimos` | Token válido |
| `/api/usuarios` | Token válido **e** perfil `ADMIN` |
| `GET /api/dashboard` | Sem proteção hoje (veja "Pontos de atenção") |

## Regras de negócio por módulo

### Livros (`livros.service.js`)
- A listagem devolve apenas os dados do livro. O detalhe (`GET /livros/:id`) inclui autores e categorias.
- Cadastro e edição recebem `autorIds` e `categoriaIds` (arrays de ids) e criam as associações junto com o livro, em uma única operação aninhada do Prisma.
- Na edição, as associações antigas são removidas (`deleteMany`) e as novas são criadas, ou seja, a lista enviada substitui a anterior.

### Empréstimos (`emprestimo.service.js`)

**Cadastro** (tudo dentro de `prisma.$transaction`):
1. Valida que `dataPrevistaDevolucao` é uma data válida e futura.
2. Confere se o usuário existe e se o livro existe e está disponível.
3. Faz `updateMany({ where: { id, disponivel: true }, data: { disponivel: false } })`. Se `count === 0`, outra requisição reservou o livro primeiro e a operação falha com `LIVRO_INDISPONIVEL`. Isso evita empréstimos duplicados em concorrência.
4. Cria o empréstimo com status `ATIVO`.

**Devolução** (também em transação):
1. Confere se o empréstimo existe.
2. Atualiza só se ainda estiver `ATIVO` (`status: "DEVOLVIDO"`, `dataDevolucao: agora`). Se nada for atualizado, o empréstimo já estava finalizado.
3. Marca o livro como disponível novamente.

### Usuários (`usuario.service.js`)
- Listagem e busca consideram apenas `perfil: "LEITOR"`. Contas de administrador não aparecem no painel.
- A listagem traz a contagem de empréstimos de cada leitor. O detalhe traz o histórico completo.
- Cadastro força `perfil: "LEITOR"` e `senha: null`. Edição só altera nome e e-mail.
- Nenhuma resposta devolve o campo `senha` (um `select` define os campos públicos).

### Dashboard (`dashboard.service.js`)
Uma única chamada executa consultas em paralelo (`Promise.all`) e devolve:
- `estatisticas`: total de livros, total de usuários, empréstimos ativos e empréstimos atrasados (ativos com `dataPrevistaDevolucao < agora`);
- `emprestimosRecentes`: os 5 últimos empréstimos, com nome do leitor e título do livro;
- `livrosPopulares`: os 5 livros mais emprestados, obtidos com `groupBy` por `livroId` e depois enriquecidos com o título.

## Tratamento de erros

Formato único: `{ "erro": "mensagem" }`.

| Situação | Status |
|---|---|
| Campo ausente, tipo errado, id inválido ou data de devolução inválida | 400 |
| Token ausente, inválido ou expirado | 401 |
| Usuário sem perfil de administrador | 403 |
| Registro inexistente | 404 |
| Livro indisponível, empréstimo já finalizado, e-mail duplicado, leitor com empréstimos | 409 |
| Falha inesperada | 500 |

## Endpoints

Prefixo `/api`. Em todas as rotas protegidas, envie `Authorization: Bearer <token>`.

| Recurso | Rotas |
|---|---|
| Auth | `POST /auth/login` · `GET /auth/me` |
| Livros | `GET /livros` · `GET /livros/:id` · `POST /livros` · `PUT /livros/:id` · `DELETE /livros/:id` |
| Autores | `GET /autores` · `GET /autores/:id` · `POST /autores` · `PUT /autores/:id` · `DELETE /autores/:id` |
| Categorias | `GET /categorias` · `GET /categorias/:id` · `POST /categorias` · `PUT /categorias/:id` · `DELETE /categorias/:id` |
| Livro ↔ Autor | `GET /livro-autores` · `GET /livro-autores/:livroId/:autorId` · `POST /livro-autores` · `DELETE /livro-autores/:livroId/:autorId` |
| Livro ↔ Categoria | `GET /livro-categorias` · `GET /livro-categorias/:livroId/:categoriaId` · `POST /livro-categorias` · `DELETE /livro-categorias/:livroId/:categoriaId` |
| Usuários (admin) | `GET /usuarios` · `GET /usuarios/:id` · `POST /usuarios` · `PUT /usuarios/:id` · `DELETE /usuarios/:id` |
| Empréstimos | `GET /emprestimos` · `GET /emprestimos/:id` · `GET /emprestimos/usuario/:usuarioId` · `POST /emprestimos` · `PATCH /emprestimos/:id/devolucao` |
| Dashboard | `GET /dashboard` |
| Saúde | `GET /health` |

Exemplo de cadastro de empréstimo:

```json
POST /api/emprestimos
{ "usuarioId": 3, "livroId": 12, "dataPrevistaDevolucao": "2026-12-10T12:00:00.000Z" }
```

## Configuração

Crie `backend/.env` (o arquivo não é versionado):

```env
# Conexão da aplicação (Neon)
DATABASE_URL="postgresql://..."
# Conexão direta, usada pela CLI do Prisma
DIRECT_URL="postgresql://..."

PORT=3000
# Deve ser exatamente a origem do frontend
FRONTEND_URL="http://localhost:5173"

# Use um segredo longo e aleatório
JWT_SECRET="troque-por-um-segredo-forte"
JWT_EXPIRES_IN="1h"
```

## Como executar

```bash
npm install
npx prisma migrate deploy   # aplica as migrations existentes
npx prisma generate         # gera o client em src/generated/prisma
npm run dev                 # servidor com recarga automática (tsx watch)
```

Outros scripts: `npm run db:migrate` (cria uma nova migration em desenvolvimento) e `npm run db:studio` (interface visual do banco). O `npm start` usa `node` diretamente; como o client gerado é TypeScript, ele só funciona em versões do Node com suporte nativo a `.ts`. Em caso de dúvida, use `npm run dev`.

### Criando o primeiro administrador

A API não tem rota para criar administradores (o cadastro de usuário sempre cria `LEITOR`). Crie o primeiro direto no banco:

1. Gere o hash da senha:
   ```bash
   node -e "console.log(require('bcrypt').hashSync('SUA_SENHA', 10))"
   ```
2. Abra `npm run db:studio`, crie um registro em `Usuario` com nome, e-mail, o hash no campo `senha` e `perfil = ADMIN`.

## Pontos de atenção

- `GET /api/dashboard` não usa `autenticarToken`; qualquer pessoa com acesso à API consegue ver os números agregados.
- As rotas fora de `/usuarios` verificam só o token, não o perfil. Hoje isso basta porque apenas administradores recebem token.
- O token não pode ser revogado antes de expirar. O `autorizarAdmin` mitiga isso nas rotas de usuário porque consulta o banco.
- `src/teste-prisma.js` é um script avulso para testar a conexão com o banco.
