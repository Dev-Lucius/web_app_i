# Super Guia de Prisma ORM 7 — da teoria à API da Biblioteca

> Guia de estudo construído a partir das anotações sobre a **API de Gerenciamento de Biblioteca**
> (JavaScript · Node.js · Express · PostgreSQL no Neon · Prisma ORM 7.10.0).
> A ideia não é só copiar um `schema.prisma`, mas **entender** cada peça: modelos, relacionamentos,
> migrations, consultas, transações, segurança e integração com a API.

**Como usar este guia**

1. Leia as partes 1 a 3 para entender o vocabulário.
2. Faça a parte 4 (instalação) e a parte 5 (schema) no seu computador.
3. Avance para o CRUD, relacionamentos e transações testando cada rota no Thunder Client / Insomnia / Postman.
4. Deixe JWT e bcrypt por último, como sugerido nas anotações originais.
5. Feche com os exercícios e o checklist.

---

## Sumário

1. [O que é o Prisma e onde ele se encaixa](#1-o-que-é-o-prisma-e-onde-ele-se-encaixa)
2. [Os componentes do Prisma](#2-os-componentes-do-prisma)
3. [O arquivo `schema.prisma` em detalhes](#3-o-arquivo-schemaprisma-em-detalhes)
4. [Instalação e configuração (Prisma 7 + Neon)](#4-instalação-e-configuração-prisma-7--neon)
5. [Relacionamentos: 1:1, 1:N e N:N](#5-relacionamentos-11-1n-e-nn)
6. [O schema completo da Biblioteca](#6-o-schema-completo-da-biblioteca)
7. [Migrations: versionando o banco](#7-migrations-versionando-o-banco)
8. [Prisma Client: CRUD completo](#8-prisma-client-crud-completo)
9. [Filtros, ordenação, paginação e agregações](#9-filtros-ordenação-paginação-e-agregações)
10. [Trabalhando com relações nas consultas](#10-trabalhando-com-relações-nas-consultas)
11. [O relacionamento N:N na prática (Livro ↔ Autor)](#11-o-relacionamento-nn-na-prática-livro--autor)
12. [Transações](#12-transações)
13. [SQL puro quando necessário](#13-sql-puro-quando-necessário)
14. [Tratamento de erros do Prisma](#14-tratamento-de-erros-do-prisma)
15. [API Express completa com Prisma](#15-api-express-completa-com-prisma)
16. [Segurança: bcrypt, JWT e autorização](#16-segurança-bcrypt-jwt-e-autorização)
17. [Seed: populando o banco](#17-seed-populando-o-banco)
18. [Cheat sheets (CLI, Client e SQL ↔ Prisma)](#18-cheat-sheets-cli-client-e-sql--prisma)
19. [Boas práticas e armadilhas comuns](#19-boas-práticas-e-armadilhas-comuns)
20. [Troubleshooting](#20-troubleshooting)
21. [Exercícios e checklist de aprendizado](#21-exercícios-e-checklist-de-aprendizado)
22. [Documentação oficial](#22-documentação-oficial)

---

## 1. O que é o Prisma e onde ele se encaixa

O **Prisma ORM** é uma ferramenta que facilita a comunicação entre a sua aplicação e um banco de dados
relacional, como o PostgreSQL. ORM significa *Object-Relational Mapping*: em vez de montar strings SQL
à mão, você descreve os dados e consulta usando objetos e funções da linguagem.

**Sem ORM** (SQL direto):

```sql
SELECT * FROM livros WHERE id = '123';
```

**Com Prisma Client** (JavaScript):

```js
const livro = await prisma.livro.findUnique({
  where: { id: "123" },
});
```

O Prisma converte essa chamada em uma consulta SQL, executa no banco e devolve o resultado como objeto JavaScript.

### A arquitetura da sua API

```text
┌────────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│  Node.js + Express │ →  │  Prisma Client   │ →  │  PostgreSQL (Neon)   │
│  recebe requisições│    │  executa consultas│    │  guarda os dados     │
└────────────────────┘    └──────────────────┘    └──────────────────────┘
```

O Prisma **não substitui** o PostgreSQL nem o Express. Cada peça tem a sua responsabilidade:

| Peça | Responsabilidade |
|------|------------------|
| Express | Rotas HTTP, validação de entrada, status codes, autenticação |
| Prisma Client | Traduzir operações JavaScript em consultas ao banco |
| PostgreSQL / Neon | Armazenar os dados de forma permanente e garantir as restrições |

### Prisma vs. SQL: não é "um ou outro"

O Prisma não elimina a necessidade de saber SQL. Entender `JOIN`, chave estrangeira, `UNIQUE`, índices e
transações continua sendo essencial — o Prisma só muda a forma de **escrever** isso. Por isso este guia
sempre mostra a correspondência com SQL.

---

## 2. Os componentes do Prisma

Existem três conceitos principais que você precisa separar (mais algumas ferramentas de apoio):

| Componente | O que faz | Onde aparece |
|------------|-----------|--------------|
| **Prisma Schema** | Descreve modelos, campos, relações e a conexão | `prisma/schema.prisma` |
| **Prisma Migrate** | Gera e aplica as migrations (histórico de alterações do banco) | `prisma/migrations/` + CLI |
| **Prisma Client** | Biblioteca para consultar, inserir, atualizar e excluir registros | `prisma.livro.findMany()` |
| **Prisma Config** | Configurações lidas pelo CLI: caminho do schema, URL do banco, seed | `prisma.config.ts` |
| **Prisma Studio** | Interface visual para explorar e editar dados | `npx prisma studio` |
| **Driver adapter** | Conecta o Prisma Client ao banco (no Prisma 7, é obrigatório) | `@prisma/adapter-neon` |

### O fluxo de trabalho

```text
Editar schema.prisma
        ↓
Validar o schema            (npx prisma validate)
        ↓
Criar e aplicar migration   (npx prisma migrate dev --name ...)
        ↓
Gerar o Prisma Client       (npx prisma generate)
        ↓
Usar o Client nas rotas     (prisma.livro.findMany() ...)
        ↓
Testar a API
```

> **Importante:** toda vez que o `schema.prisma` mudar, o banco precisa de uma migration **e** o Client
> precisa ser regenerado — senão o código JavaScript não "enxerga" os novos campos.

---

## 3. O arquivo `schema.prisma` em detalhes

É aqui que você descreve a estrutura dos dados. O arquivo tem três tipos de bloco:

```prisma
generator client {            // como gerar o Prisma Client
  provider = "prisma-client-js"
}

datasource db {               // qual banco será usado
  provider = "postgresql"
}

model Livro {                 // um modelo = uma tabela
  id     String @id @default(cuid())
  titulo String
}
```

### 3.1 Anatomia de um `model`

```prisma
model Livro {
  id            String @id @default(cuid())
  titulo        String
  isbn          String @unique
  anoPublicacao Int
}
```

| Trecho | Significado |
|--------|-------------|
| `model Livro` | Define um modelo chamado `Livro` (vira uma tabela) |
| `id String` | Campo `id` do tipo texto |
| `@id` | Torna o campo a **chave primária** |
| `@default(cuid())` | Gera um identificador único automaticamente |
| `titulo String` | Campo de texto **obrigatório** |
| `isbn String @unique` | Valor **não pode repetir** (constraint `UNIQUE`) |
| `anoPublicacao Int` | Número inteiro obrigatório |

Por padrão, todo campo é **obrigatório**. Para torná-lo opcional (aceita `NULL`), use `?`:

```prisma
anoPublicacao Int        // obrigatório
descricao     String?    // opcional (pode ser nulo)
```

### 3.2 Tipos de dados

| Tipo Prisma | Uso | Tipo típico no PostgreSQL | Exemplo |
|-------------|-----|---------------------------|---------|
| `String` | Texto | `text` | `titulo String` |
| `Int` | Inteiro | `integer` | `ano Int` |
| `BigInt` | Inteiro grande | `bigint` | `visualizacoes BigInt` |
| `Float` | Decimal em ponto flutuante | `double precision` | `nota Float` |
| `Decimal` | Decimal exato (dinheiro) | `decimal(65,30)` | `preco Decimal` |
| `Boolean` | Verdadeiro/falso | `boolean` | `disponivel Boolean` |
| `DateTime` | Data e hora | `timestamp(3)` | `criadoEm DateTime` |
| `Json` | Dados JSON | `jsonb` | `metadados Json` |
| `Bytes` | Binário | `bytea` | `capa Bytes` |
| `String?` | Opcional | aceita `NULL` | `descricao String?` |
| `String[]` | Lista (array do PostgreSQL) | `text[]` | `tags String[]` |

> **Atenção:** `String` **não** significa necessariamente `VARCHAR(n)`. No PostgreSQL, o padrão é `text`.
> Para controlar o tipo nativo, use atributos como `@db.VarChar(255)`, `@db.Date`, `@db.Decimal(10, 2)`.
> Além disso, `String[]` é um **array** do banco, não uma tabela relacionada.

```prisma
model Exemplo {
  titulo String   @db.VarChar(255)
  preco  Decimal  @db.Decimal(10, 2)
  data   DateTime @db.Date
}
```

### 3.3 Valores padrão

```prisma
model Exemplo {
  id         String   @id @default(cuid())
  ativo      Boolean  @default(true)
  criadoEm   DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}
```

| Atributo | O que faz |
|----------|-----------|
| `@default(cuid())` | Gera um ID textual único (resistente a colisões) |
| `@default(uuid())` | Gera um UUID |
| `@default(autoincrement())` | Inteiro sequencial (`1, 2, 3...`) |
| `@default(now())` | Data/hora atual no momento da criação |
| `@default(true)` | Valor fixo |
| `@updatedAt` | Atualiza o campo automaticamente a cada `update` feito pelo Prisma |

### 3.4 Todos os atributos importantes

| Atributo | Nível | Função |
|----------|-------|--------|
| `@id` | Campo | Chave primária de um campo |
| `@@id([a, b])` | Modelo | Chave primária **composta** |
| `@unique` | Campo | Valores únicos |
| `@@unique([a, b])` | Modelo | **Combinação** de campos única |
| `@@index([a])` | Modelo | Índice para acelerar consultas |
| `@default(...)` | Campo | Valor padrão |
| `@updatedAt` | Campo | Data de última atualização automática |
| `@relation(...)` | Campo | Define o relacionamento e a chave estrangeira |
| `@map("coluna")` | Campo | Nome da **coluna** no banco |
| `@@map("tabela")` | Modelo | Nome da **tabela** no banco |
| `@db.*` | Campo | Tipo nativo do banco |

> **Regra para memorizar:** `@` atua em **um campo**; `@@` atua no **modelo inteiro**.

### 3.5 `@map` e `@@map`: nomes em português no banco

Dentro do código você quer `prisma.livro` (singular, camelCase). No banco você quer a tabela `livros`
(plural, minúscula). Os dois podem coexistir:

```prisma
model Livro {
  id            String @id @default(cuid())
  anoPublicacao Int    @map("ano_publicacao")   // coluna: ano_publicacao

  @@map("livros")                                // tabela: livros
}
```

### 3.6 Enums

Quando um campo só aceita um conjunto fixo de valores, use `enum`:

```prisma
enum StatusEmprestimo {
  ATIVO
  DEVOLVIDO
  ATRASADO
}

model Emprestimo {
  id     String           @id @default(cuid())
  status StatusEmprestimo @default(ATIVO)
}
```

(No projeto da biblioteca usamos o booleano `devolvido`, mas o enum é uma alternativa mais expressiva.)

### 3.7 Comentários

```prisma
// comentário simples
/// comentário de documentação (aparece no Client gerado)
```

### 3.8 Formatando e validando

```bash
npx prisma format     # formata e alinha o schema; ajuda a achar erros de sintaxe
npx prisma validate   # valida o schema
```

---

## 4. Instalação e configuração (Prisma 7 + Neon)

O Prisma 7 trouxe mudanças que **quebram** tutoriais antigos. As principais:

| Antes (Prisma ≤ 6) | Agora (Prisma 7) |
|--------------------|------------------|
| URL do banco no `schema.prisma` (`url = env("DATABASE_URL")`) | URL do **CLI** fica no `prisma.config.ts` |
| Client conectava sozinho | **Driver adapter obrigatório** na criação do `PrismaClient` |
| `.env` carregado automaticamente | Você precisa carregar: `import "dotenv/config"` |
| Gerador `prisma-client-js` | Gerador `prisma-client` é o recomendado; `prisma-client-js` está **deprecado** |

### 4.1 Pré-requisitos

- Node.js em versão compatível com o Prisma 7 (a doc exige Node 20.19+ ou superior — confira a página de requisitos).
- Uma conta gratuita no [Neon](https://neon.tech) com um projeto/banco PostgreSQL criado.
- Um cliente HTTP para testar (Thunder Client, Insomnia, Postman).

### 4.2 Passo 1 — Criar o projeto e instalar dependências

```bash
mkdir biblioteca-api && cd biblioteca-api
npm init -y

# dependências da API
npm install express cors dotenv bcrypt jsonwebtoken

# Prisma 7.10.0 + adaptador do Neon
npm install @prisma/client@7.10.0 @prisma/adapter-neon@7.10.0
npm install --save-dev prisma@7.10.0
```

Confirme as versões:

```bash
npx prisma -v
```

> O CLI (`prisma`) e o Client (`@prisma/client`) devem estar **na mesma versão** — a exigida pelo professor.

### 4.3 Passo 2 — Inicializar o Prisma

```bash
npx prisma init
```

Estrutura criada (entre outros arquivos):

```text
biblioteca-api/
├── prisma/
│   └── schema.prisma
├── prisma.config.ts
└── .env
```

### 4.4 Passo 3 — Variáveis de ambiente (`.env`)

O Neon oferece **dois tipos** de connection string. No painel, alterne a opção *Connection pooling*:

| Variável | Qual string | Usada por |
|----------|-------------|-----------|
| `DATABASE_URL` | **Pooled** (host com `-pooler`) | Prisma Client, em tempo de execução |
| `DIRECT_URL` | **Direta** (sem `-pooler`) | Prisma CLI: migrations, introspecção |

```env
DATABASE_URL="postgresql://usuario:senha@ep-xxxx-pooler.regiao.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://usuario:senha@ep-xxxx.regiao.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="uma_chave_longa_aleatoria_e_secreta"
PORT=3000
```

> **Segurança:** o `.env` **nunca** vai para o GitHub. Adicione ao `.gitignore`:
>
> ```text
> node_modules
> .env
> ```
>
> Se a connection string vazar, gere uma nova senha no painel do Neon imediatamente.

> **Dica:** se o enunciado do trabalho trabalhar com uma única `DATABASE_URL`, você pode apontar as duas
> para a mesma string. Funciona na maioria dos casos, mas migrations passando pelo pooler podem dar erro —
> a conexão direta para o CLI é a recomendação do Neon.

### 4.5 Passo 4 — `prisma.config.ts`

No Prisma 7, é o `prisma.config.ts` que diz ao **CLI** onde está o schema, onde ficam as migrations e qual
banco usar:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    // seed: "node prisma/seed.js",   // veja a seção 17
  },

  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

O `import "dotenv/config"` é necessário porque o Prisma 7 não carrega o `.env` sozinho.

### 4.6 Passo 5 — O bloco `generator`: duas opções

Este é o ponto que mais confunde no Prisma 7. Existem dois geradores:

| | `prisma-client-js` | `prisma-client` |
|---|---|---|
| Status no Prisma 7 | Deprecado (legado), mas funciona | **Recomendado** (padrão do `prisma init`) |
| Onde gera o Client | `node_modules` | Pasta do seu projeto (`output` é **obrigatório**) |
| Formato da saída | Pacote `@prisma/client` | Código **TypeScript** na sua pasta |
| Importação | `require("@prisma/client")` | `require("../generated/prisma/client")` |
| Projeto JS puro (CommonJS) | Mais simples | Exige `moduleFormat = "cjs"` e ambiente que execute `.ts` |

**Opção A — mantém o que está nas anotações (mais simples em JavaScript puro):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

```js
const { PrismaClient } = require("@prisma/client");
```

**Opção B — padrão recomendado pelo Prisma 7:**

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../generated/prisma"
  moduleFormat = "cjs"          // necessário se o projeto usa require()
}

datasource db {
  provider = "postgresql"
}
```

```js
const { PrismaClient } = require("../generated/prisma/client");
```

> **Atenção:** o gerador `prisma-client` produz arquivos **TypeScript**. Em um projeto JavaScript puro,
> você precisa de um passo de compilação/execução de TS (ex.: `tsx`, ou um Node recente com suporte a
> *type stripping*) ou de migrar o projeto para TypeScript. Se o trabalho é em JavaScript e o professor
> espera o `@prisma/client` clássico, a **Opção A** é a escolha pragmática. Se aparecer erro de importação,
> veja a [seção 20](#20-troubleshooting). Em ambos os casos, adicione `generated/` ao `.gitignore` quando
> usar a opção B.

Neste guia, os exemplos usam a **Opção A** (`require("@prisma/client")`). Para trocar para a Opção B, basta
mudar o `generator` e o caminho do `require` — o restante do código é idêntico.

### 4.7 Passo 6 — Criar o Prisma Client (`src/prisma.js`)

No Prisma 7, o Client precisa do **adaptador** do Neon. Crie **uma única instância** e reutilize em toda a aplicação:

```js
// src/prisma.js
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL, // string pooled
});

const prisma = new PrismaClient({
  adapter,
  // log: ["query", "warn", "error"],   // descomente para ver o SQL gerado
});

module.exports = prisma;
```

> Criar um `new PrismaClient()` dentro de cada rota abre conexões desnecessárias. Exporte uma instância e
> importe com `require("../prisma")`.

---

## 5. Relacionamentos: 1:1, 1:N e N:N

O Prisma separa dois tipos de campo dentro de um modelo:

- **Campos escalares:** guardam valores reais no banco (`categoriaId String` → coluna `categoriaId`).
- **Campos de relação:** só existem no Prisma, para você *navegar* até o registro relacionado (`categoria Categoria`).

```prisma
model Livro {
  categoriaId String        // ← coluna real (chave estrangeira)
  categoria   Categoria @relation(fields: [categoriaId], references: [id])
  //  ↑ campo de relação (não vira coluna; serve para navegar e fazer include)
}
```

Anatomia de `@relation`:

```prisma
@relation(fields: [categoriaId], references: [id])
```

| Parte | Significado |
|-------|-------------|
| `fields` | Campo(s) **deste** modelo que guardam a chave estrangeira |
| `references` | Campo(s) do **outro** modelo que são referenciados (normalmente o `id`) |

### 5.1 Relacionamento 1:N (um-para-muitos)

Um usuário cadastra muitos livros; cada livro pertence a **um** usuário.

```prisma
model User {
  id     String  @id @default(cuid())
  livros Livro[]                       // lado "1": lista
}

model Livro {
  id     String @id @default(cuid())
  userId String                        // chave estrangeira
  user   User   @relation(fields: [userId], references: [id])   // lado "N"
}
```

> **Regra para memorizar:** em um relacionamento 1:N, a **chave estrangeira fica no lado N** (o `Livro`).
> O lado "1" só tem a lista (`Livro[]`), que não vira coluna.

### 5.2 Relacionamento 1:1 (um-para-um)

Um usuário tem **um** perfil. A diferença para o 1:N é o `@unique` na chave estrangeira:

```prisma
model User {
  id     String  @id @default(cuid())
  perfil Perfil?                       // opcional: o usuário pode não ter perfil
}

model Perfil {
  id     String @id @default(cuid())
  bio    String?
  userId String @unique                // @unique garante o "1:1"
  user   User   @relation(fields: [userId], references: [id])
}
```

### 5.3 Relacionamento N:N (muitos-para-muitos)

Um livro pode ter vários autores e um autor pode escrever vários livros. Existem **duas** formas no Prisma:

**Implícita** — o Prisma cria uma tabela oculta de junção:

```prisma
model Livro {
  id      String  @id @default(cuid())
  autores Autor[]
}

model Autor {
  id     String  @id @default(cuid())
  livros Livro[]
}
```

Simples, mas você **não controla** a tabela intermediária e não consegue adicionar campos nela.

**Explícita** — você cria o modelo da tabela associativa (**é o que o trabalho exige**):

```prisma
model LivroAutor {
  livroId String
  autorId String

  livro Livro @relation(fields: [livroId], references: [id], onDelete: Cascade)
  autor Autor @relation(fields: [autorId], references: [id], onDelete: Cascade)

  @@id([livroId, autorId])             // chave primária composta
}
```

Vantagens da tabela explícita:

- Você controla nome e estrutura da tabela (`@@map("livro_autor")`).
- Pode adicionar campos no vínculo no futuro (`ordemAutoria Int`, `papel String`).
- A chave primária composta `@@id([livroId, autorId])` **impede duplicar** o mesmo autor no mesmo livro.

### 5.4 `onDelete`: o que acontece ao apagar o registro "pai"

| Ação | Comportamento ao excluir o registro referenciado |
|------|--------------------------------------------------|
| `Cascade` | Exclui também os registros que dependem dele |
| `Restrict` | **Impede** a exclusão se houver dependentes |
| `NoAction` | Semelhante a `Restrict` (a verificação ocorre no fim do comando, conforme o banco) |
| `SetNull` | Define a chave estrangeira como `NULL` (campo precisa ser opcional) |
| `SetDefault` | Define o valor padrão da coluna |

```prisma
livro Livro @relation(fields: [livroId], references: [id], onDelete: Cascade)
```

Se você **não** declarar `onDelete`, o padrão para relações obrigatórias é `Restrict` — por isso excluir um
`Livro` que já tem `Emprestimo` falha com o erro `P2003` (veja a seção 14).

### 5.5 Nomes de relação e auto-relacionamento (extra)

Quando dois modelos têm **mais de uma** relação entre si, dê um nome a cada uma:

```prisma
model Usuario {
  id           String  @id @default(cuid())
  escritos     Artigo[] @relation("Autoria")
  revisados    Artigo[] @relation("Revisao")
}

model Artigo {
  id         String  @id @default(cuid())
  autorId    String
  revisorId  String?
  autor      Usuario  @relation("Autoria", fields: [autorId],   references: [id])
  revisor    Usuario? @relation("Revisao", fields: [revisorId], references: [id])
}
```

Um modelo pode se relacionar com ele mesmo (ex.: categorias e subcategorias):

```prisma
model Categoria {
  id       String      @id @default(cuid())
  nome     String
  paiId    String?
  pai      Categoria?  @relation("Hierarquia", fields: [paiId], references: [id])
  filhas   Categoria[] @relation("Hierarquia")
}
```

### 5.6 Índices em chaves estrangeiras

No PostgreSQL, **chave estrangeira não cria índice automaticamente**. Como você vai filtrar e fazer `JOIN` por
elas o tempo todo, declare:

```prisma
@@index([categoriaId])
@@index([userId])
```

---

## 6. O schema completo da Biblioteca

Seis tabelas: `User`, `Categoria`, `Livro`, `Autor`, `LivroAutor` (associativa N:N) e `Emprestimo`.

### 6.1 Planejando antes de codificar

| Modelo | Papel | Relações |
|--------|-------|----------|
| **User** | Usuários do sistema (e-mail e **hash** da senha) | 1:N com `Livro` e 1:N com `Emprestimo` |
| **Categoria** | Classifica os livros (Fantasia, História...) | 1:N com `Livro` |
| **Livro** | Título, ISBN, ano e disponibilidade | N:1 com `Categoria` e `User`; N:N com `Autor` |
| **Autor** | Autores das obras | N:N com `Livro` (via `LivroAutor`) |
| **LivroAutor** | Tabela associativa do N:N | N:1 com `Livro` e `Autor` |
| **Emprestimo** | Quem pegou qual livro e quando devolveu | N:1 com `User` e `Livro` |

### 6.2 Diagrama entidade-relacionamento

```mermaid
erDiagram
    USER ||--o{ LIVRO : cadastra
    USER ||--o{ EMPRESTIMO : realiza
    CATEGORIA ||--o{ LIVRO : classifica
    LIVRO ||--o{ LIVRO_AUTOR : possui
    AUTOR ||--o{ LIVRO_AUTOR : escreve
    LIVRO ||--o{ EMPRESTIMO : "é emprestado em"
```

### 6.3 O arquivo `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id       String   @id @default(cuid())
  username String
  email    String   @unique
  password String                       // hash gerado pelo bcrypt, nunca a senha pura
  criadoEm DateTime @default(now())

  livros      Livro[]
  emprestimos Emprestimo[]

  @@map("users")
}

model Categoria {
  id     String  @id @default(cuid())
  nome   String  @unique
  livros Livro[]

  @@map("categorias")
}

model Livro {
  id            String   @id @default(cuid())
  titulo        String
  isbn          String   @unique
  anoPublicacao Int
  disponivel    Boolean  @default(true)
  criadoEm      DateTime @default(now())

  categoriaId String
  userId      String

  categoria Categoria @relation(fields: [categoriaId], references: [id])
  user      User      @relation(fields: [userId], references: [id])

  autores     LivroAutor[]
  emprestimos Emprestimo[]

  @@index([categoriaId])
  @@index([userId])
  @@map("livros")
}

model Autor {
  id     String       @id @default(cuid())
  nome   String
  livros LivroAutor[]

  @@map("autores")
}

model LivroAutor {
  livroId String
  autorId String

  livro Livro @relation(fields: [livroId], references: [id], onDelete: Cascade)
  autor Autor @relation(fields: [autorId], references: [id], onDelete: Cascade)

  @@id([livroId, autorId])
  @@map("livro_autor")
}

model Emprestimo {
  id             String    @id @default(cuid())
  dataEmprestimo DateTime  @default(now())
  dataDevolucao  DateTime?
  devolvido      Boolean   @default(false)

  userId  String
  livroId String

  user  User  @relation(fields: [userId], references: [id])
  livro Livro @relation(fields: [livroId], references: [id])

  @@index([userId])
  @@index([livroId])
  @@map("emprestimos")
}
```

> Se você escolheu a **Opção B** do gerador (seção 4.6), troque apenas o bloco `generator`.

### 6.4 Entendendo as decisões do schema

**Por que `User` tem `password`?**
Porque a tabela guarda o **hash** gerado pelo `bcrypt`, nunca a senha em texto puro. O Prisma não criptografa
nada sozinho: isso é responsabilidade do código de cadastro (seção 16).

**Por que `isbn` é `@unique`?**
Para impedir dois livros com o mesmo ISBN. A restrição fica no **banco**, então vale mesmo que a API tenha um bug.
Violá-la gera o erro `P2002`.

**Por que `dataDevolucao` tem `?`**
Um empréstimo em andamento ainda não tem data de devolução, então o campo precisa aceitar `NULL`.

**Por que `LivroAutor` usa `onDelete: Cascade`?**
Se um livro ou autor for excluído, as associações são removidas junto. Isso **não** apaga empréstimos: a relação
`Emprestimo → Livro` não tem `Cascade` e precisa ser tratada com cuidado.

**Por que `@@map`?**
Para manter os modelos no singular no código (`Livro`) e as tabelas no plural e em português (`livros`).

**Por que a `disponivel` fica em `Livro` e também existe `Emprestimo`?**
`disponivel` é uma "foto" rápida do estado atual. Ela precisa ser mantida **em sincronia** com os empréstimos —
por isso a seção 12 usa transações.

---

## 7. Migrations: versionando o banco

Uma **migration** é um arquivo SQL que registra uma mudança na estrutura do banco. O conjunto delas forma o
histórico do esquema, como um "Git do banco de dados".

### 7.1 Primeira migration

```bash
npx prisma validate                     # 1. valida o schema
npx prisma migrate dev --name init      # 2. cria o SQL e aplica no banco de desenvolvimento
npx prisma generate                     # 3. gera o Prisma Client
```

Resultado em disco:

```text
prisma/
└── migrations/
    ├── 20260101120000_init/
    │   └── migration.sql
    └── migration_lock.toml
```

> No Prisma 7, não conte com a geração automática do Client após a migration:
> rode `npx prisma generate` **explicitamente** sempre que o schema mudar.

### 7.2 Alterando o schema depois

Exemplo: adicionar uma descrição opcional ao livro.

```prisma
model Livro {
  // ...demais campos
  descricao String?
}
```

```bash
npx prisma migrate dev --name adicionar_descricao_livro
npx prisma generate
```

> **Dica:** campo **opcional** (`?`) ou com `@default(...)` entra sem dor. Campo **obrigatório sem default** em
> uma tabela que já tem linhas faz a migration falhar — porque o banco não sabe o que colocar nas linhas existentes.

### 7.3 `migrate dev` vs `migrate deploy`

| Comando | Ambiente | O que faz |
|---------|----------|-----------|
| `prisma migrate dev` | **Desenvolvimento** | Detecta mudanças no schema, cria a migration e aplica |
| `prisma migrate deploy` | **Produção/CI** | Só aplica migrations já existentes; não cria nada, não pergunta nada |
| `prisma migrate status` | Qualquer | Mostra quais migrations estão aplicadas ou pendentes |
| `prisma migrate reset` | **Só desenvolvimento** | Apaga o banco, reaplica tudo e roda o seed. **Destrói os dados** |
| `prisma migrate resolve` | Correção | Marca manualmente uma migration como aplicada/revertida |
| `prisma db push` | Protótipo | Sincroniza o schema sem criar migration (não versiona) |
| `prisma db pull` | Banco legado | Lê um banco existente e gera o schema (introspecção) |

> **Importante:** `db pull` **não** substitui migrations em um projeto em que você desenvolve o schema pelo
> Prisma. Ele serve para o caminho contrário: já existe um banco e você quer descrevê-lo no schema.
>
> **Importante 2:** se uma migration falhar, **não** apague o banco nem as migrations às cegas. Leia a
> mensagem de erro, confira a versão do CLI, a `DIRECT_URL` e o estado com `migrate status`.

### 7.4 Regras de ouro das migrations

1. **Nunca edite** uma migration que já foi aplicada. Crie outra.
2. **Versione** a pasta `prisma/migrations` no Git.
3. Dê **nomes descritivos**: `adicionar_descricao_livro`, não `teste2`.
4. Revise o `migration.sql` gerado antes de aplicar em produção.

---

## 8. Prisma Client: CRUD completo

CRUD = **C**reate, **R**ead, **U**pdate, **D**elete. Cada operação tem métodos específicos. Os exemplos abaixo
supõem `const prisma = require("../prisma");`.

### 8.1 Visão geral dos métodos

| Operação | Método | Retorna |
|----------|--------|---------|
| Criar um | `create()` | O registro criado |
| Criar vários | `createMany()` | `{ count }` |
| Buscar por campo único | `findUnique()` | Registro ou `null` |
| Buscar o primeiro que atende | `findFirst()` | Registro ou `null` |
| Listar | `findMany()` | Array |
| Atualizar um | `update()` | O registro atualizado (erro `P2025` se não existir) |
| Atualizar vários | `updateMany()` | `{ count }` |
| Criar ou atualizar | `upsert()` | O registro |
| Excluir um | `delete()` | O registro excluído (erro `P2025` se não existir) |
| Excluir vários | `deleteMany()` | `{ count }` |
| Contar | `count()` | Número |

Variações úteis: `findUniqueOrThrow()` e `findFirstOrThrow()` lançam erro em vez de retornar `null`.

### 8.2 Create — cadastrar

```js
const livro = await prisma.livro.create({
  data: {
    titulo: "O Hobbit",
    isbn: "9780000000001",
    anoPublicacao: 1937,
    categoriaId: "ID_DE_UMA_CATEGORIA_EXISTENTE",
    userId: "ID_DE_UM_USUARIO_EXISTENTE",
  },
});
```

Os IDs precisam corresponder a registros reais, senão o banco rejeita (`P2003`).

Criar vários de uma vez:

```js
const resultado = await prisma.categoria.createMany({
  data: [{ nome: "Fantasia" }, { nome: "História" }, { nome: "Ficção Científica" }],
  skipDuplicates: true,   // ignora os que já existem (conflito de @unique)
});
console.log(resultado.count);
```

### 8.3 Read — consultar

```js
// todos
const livros = await prisma.livro.findMany();

// por chave única (id, isbn, email...)
const livro = await prisma.livro.findUnique({ where: { id: "abc" } });
const porIsbn = await prisma.livro.findUnique({ where: { isbn: "9780000000001" } });

// primeiro que atende a um filtro (campo não-único)
const primeiro = await prisma.livro.findFirst({
  where: { anoPublicacao: { gte: 2000 } },
  orderBy: { anoPublicacao: "asc" },
});
```

> `findUnique` só aceita campos **únicos** (`@id`, `@unique`, `@@unique`, `@@id`). Para filtrar por outros campos
> use `findFirst` ou `findMany`.

### 8.4 Update — atualizar

```js
const livro = await prisma.livro.update({
  where: { id: "abc" },
  data: { titulo: "O Hobbit (2ª edição)", disponivel: false },
});
```

- `where` identifica **qual** registro.
- `data` define **o que** muda.
- Se o registro não existir, o Prisma lança `P2025`.

Operações numéricas atômicas:

```js
await prisma.produto.update({
  where: { id },
  data: { estoque: { decrement: 1 } },   // também: increment, multiply, divide, set
});
```

Atualizar vários:

```js
const { count } = await prisma.livro.updateMany({
  where: { categoriaId: "x" },
  data: { disponivel: true },
});
```

### 8.5 Upsert — criar ou atualizar

```js
const categoria = await prisma.categoria.upsert({
  where: { nome: "Fantasia" },       // precisa ser campo único
  update: {},                         // já existe: não muda nada
  create: { nome: "Fantasia" },       // não existe: cria
});
```

### 8.6 Delete — excluir

```js
await prisma.livro.delete({ where: { id: "abc" } });

await prisma.emprestimo.deleteMany({ where: { devolvido: true } });
```

Se existirem registros dependentes sem `Cascade`, o banco recusa (`P2003`).

### 8.7 Contar

```js
const total = await prisma.livro.count();
const disponiveis = await prisma.livro.count({ where: { disponivel: true } });
```

### 8.8 O CRUD de livros em rotas Express

```js
// src/routes/livros.routes.js
const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { titulo, isbn, anoPublicacao, categoriaId, userId } = req.body;

    if (!titulo || !isbn || !Number.isInteger(anoPublicacao) || !categoriaId || !userId) {
      return res.status(400).json({ erro: "Dados obrigatórios inválidos." });
    }

    const livro = await prisma.livro.create({
      data: { titulo, isbn, anoPublicacao, categoriaId, userId },
    });

    return res.status(201).json(livro);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ erro: "Esse ISBN já está cadastrado." });
    if (error.code === "P2003") return res.status(400).json({ erro: "Categoria ou usuário inexistente." });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao cadastrar livro." });
  }
});

// READ (lista)
router.get("/", async (req, res) => {
  try {
    const livros = await prisma.livro.findMany({ orderBy: { titulo: "asc" } });
    return res.status(200).json(livros);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao listar livros." });
  }
});

// READ (um)
router.get("/:id", async (req, res) => {
  try {
    const livro = await prisma.livro.findUnique({ where: { id: req.params.id } });
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
    return res.json(livro);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar livro." });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { titulo, anoPublicacao, disponivel } = req.body;

    const livro = await prisma.livro.update({
      where: { id: req.params.id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(anoPublicacao !== undefined && { anoPublicacao }),
        ...(disponivel !== undefined && { disponivel }),
      },
    });

    return res.json(livro);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ erro: "Livro não encontrado." });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao atualizar livro." });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await prisma.livro.delete({ where: { id: req.params.id } });
    return res.status(204).send();           // 204 = sucesso sem corpo
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ erro: "Livro não encontrado." });
    if (error.code === "P2003") return res.status(409).json({ erro: "Existem registros relacionados ao livro." });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao excluir livro." });
  }
});

module.exports = router;
```

Registre em `src/server.js`:

```js
const livrosRoutes = require("./routes/livros.routes");
app.use("/livros", livrosRoutes);
```

Corpo JSON de teste (Thunder Client):

```json
{
  "titulo": "O Hobbit",
  "isbn": "9780000000001",
  "anoPublicacao": 1937,
  "categoriaId": "ID_DE_UMA_CATEGORIA_EXISTENTE",
  "userId": "ID_DE_UM_USUARIO_EXISTENTE"
}
```

> **Atenção:** neste exemplo didático o `userId` vem do corpo da requisição. Na versão protegida da API, ele
> **deve vir do JWT validado**, nunca de um valor enviado livremente pelo cliente (seção 16).

---

## 9. Filtros, ordenação, paginação e agregações

### 9.1 Filtros (`where`)

```js
await prisma.livro.findMany({
  where: {
    disponivel: true,                         // igualdade
    anoPublicacao: { gte: 1990, lt: 2020 },   // maior/igual e menor que
    titulo: { contains: "hobbit", mode: "insensitive" },   // LIKE '%hobbit%' sem diferenciar caixa
  },
});
```

| Operador | Equivalente SQL | Exemplo |
|----------|-----------------|---------|
| `equals` (ou valor direto) | `=` | `{ ano: 2000 }` |
| `not` | `<>` | `{ ano: { not: 2000 } }` |
| `in` | `IN (...)` | `{ ano: { in: [1990, 2000] } }` |
| `notIn` | `NOT IN (...)` | `{ ano: { notIn: [1990] } }` |
| `lt`, `lte` | `<`, `<=` | `{ ano: { lt: 2000 } }` |
| `gt`, `gte` | `>`, `>=` | `{ ano: { gte: 2000 } }` |
| `contains` | `LIKE '%x%'` | `{ titulo: { contains: "rei" } }` |
| `startsWith` | `LIKE 'x%'` | `{ titulo: { startsWith: "O" } }` |
| `endsWith` | `LIKE '%x'` | `{ titulo: { endsWith: "s" } }` |
| `mode: "insensitive"` | `ILIKE` | usado junto com `contains` etc. |
| `null` | `IS NULL` | `{ dataDevolucao: null }` |
| `not: null` | `IS NOT NULL` | `{ dataDevolucao: { not: null } }` |

### 9.2 Combinando condições: `AND`, `OR`, `NOT`

```js
await prisma.livro.findMany({
  where: {
    OR: [
      { titulo: { contains: "rei", mode: "insensitive" } },
      { isbn: { startsWith: "978" } },
    ],
    NOT: { disponivel: false },
    // várias chaves no mesmo objeto já são combinadas com AND
  },
});
```

### 9.3 Ordenação (`orderBy`)

```js
await prisma.livro.findMany({
  orderBy: { titulo: "asc" },
});

// múltiplos critérios
await prisma.livro.findMany({
  orderBy: [{ anoPublicacao: "desc" }, { titulo: "asc" }],
});
```

### 9.4 Paginação (`skip` e `take`)

```js
const pagina = Number(req.query.pagina) || 1;
const limite = Math.min(Number(req.query.limite) || 10, 50);   // trava o máximo

const [livros, total] = await Promise.all([
  prisma.livro.findMany({
    skip: (pagina - 1) * limite,
    take: limite,
    orderBy: { titulo: "asc" },
  }),
  prisma.livro.count(),
]);

res.json({
  dados: livros,
  pagina,
  limite,
  total,
  totalPaginas: Math.ceil(total / limite),
});
```

> Para tabelas muito grandes existe a paginação por **cursor** (`cursor` + `take`), mais eficiente que `skip`.

### 9.5 Selecionar campos (`select`) e omitir campos

```js
await prisma.livro.findMany({
  select: { id: true, titulo: true },     // retorna só estes campos
});
```

Para esconder um campo específico em uma consulta (útil com senha):

```js
await prisma.user.findMany({
  omit: { password: true },
});
```

### 9.6 Agregações e agrupamentos

```js
// min, max, média, soma, contagem
const stats = await prisma.livro.aggregate({
  _count: true,
  _min: { anoPublicacao: true },
  _max: { anoPublicacao: true },
  _avg: { anoPublicacao: true },
});

// GROUP BY: quantos livros por categoria?
const porCategoria = await prisma.livro.groupBy({
  by: ["categoriaId"],
  _count: { _all: true },
  orderBy: { _count: { categoriaId: "desc" } },
});
```

Equivalente SQL: `SELECT "categoriaId", COUNT(*) FROM livros GROUP BY "categoriaId";`

---

## 10. Trabalhando com relações nas consultas

### 10.1 `include`: trazer registros relacionados

Sem precisar escrever `JOIN` na mão:

```js
const livro = await prisma.livro.findUnique({
  where: { id: req.params.id },
  include: {
    categoria: true,
    autores: {
      include: { autor: true },     // passa pela tabela associativa até o Autor
    },
  },
});
```

Resposta aproximada:

```json
{
  "id": "id-do-livro",
  "titulo": "O Hobbit",
  "isbn": "9780000000001",
  "anoPublicacao": 1937,
  "disponivel": true,
  "categoria": { "id": "id-da-categoria", "nome": "Fantasia" },
  "autores": [
    {
      "livroId": "id-do-livro",
      "autorId": "id-do-autor",
      "autor": { "id": "id-do-autor", "nome": "J. R. R. Tolkien" }
    }
  ]
}
```

### 10.2 `select` aninhado: controlar exatamente o que volta

`include` traz **todos** os campos escalares do livro mais as relações. Com `select` você escolhe cada campo:

```js
const livro = await prisma.livro.findUnique({
  where: { id },
  select: {
    titulo: true,
    categoria: { select: { nome: true } },
    autores: { select: { autor: { select: { nome: true } } } },
  },
});
```

> **Regra:** `select` e `include` **não podem** ser usados juntos no mesmo nível. Escolha um.

### 10.3 Transformando o resultado (achatando o N:N)

A resposta via tabela associativa é "aninhada demais" para o front-end. Você pode achatar no JavaScript:

```js
const resposta = {
  ...livro,
  autores: livro.autores.map((la) => la.autor),
};
// autores: [{ id, nome }, ...]
```

### 10.4 Filtrando pelas relações

```js
// livros de uma categoria
await prisma.livro.findMany({
  where: { categoria: { nome: "Fantasia" } },
});

// livros que tenham ALGUM autor com determinado nome
await prisma.livro.findMany({
  where: {
    autores: { some: { autor: { nome: { contains: "Tolkien", mode: "insensitive" } } } },
  },
});

// livros SEM nenhum empréstimo
await prisma.livro.findMany({
  where: { emprestimos: { none: {} } },
});
```

| Filtro de lista | Significado |
|-----------------|-------------|
| `some` | Pelo menos um item da relação atende |
| `every` | **Todos** os itens atendem |
| `none` | Nenhum item atende |

Para relação "para um" (ex.: `categoria`), use direto ou `is` / `isNot`.

### 10.5 Escritas aninhadas (*nested writes*)

Criar o registro **e** os relacionamentos numa única operação:

```js
const livro = await prisma.livro.create({
  data: {
    titulo: "O Hobbit",
    isbn: "9780000000001",
    anoPublicacao: 1937,

    categoria: { connect: { id: "ID_DA_CATEGORIA" } },     // conecta a um existente
    user:      { connect: { id: "ID_DO_USUARIO" } },

    autores: {
      create: [
        { autor: { connect: { id: "ID_DO_AUTOR" } } },     // cria a linha em livro_autor
      ],
    },
  },
  include: { categoria: true, autores: { include: { autor: true } } },
});
```

| Operação aninhada | O que faz |
|-------------------|-----------|
| `connect` | Liga a um registro **existente** |
| `create` | **Cria** um registro relacionado novo |
| `connectOrCreate` | Liga se existir; cria se não existir |
| `disconnect` | Remove o vínculo (campo precisa ser opcional) |
| `set` | Substitui toda a lista de vínculos (relações implícitas/listas) |
| `update` / `upsert` / `delete` | Alteram o registro relacionado |
| `createMany` | Cria vários relacionados de uma vez |

Exemplo com `connectOrCreate` (cria a categoria se ainda não existir):

```js
categoria: {
  connectOrCreate: {
    where: { nome: "Fantasia" },
    create: { nome: "Fantasia" },
  },
},
```

---

## 11. O relacionamento N:N na prática (Livro ↔ Autor)

Esta é uma das partes mais importantes da avaliação: o professor exige muitos-para-muitos **com tabela associativa**.

Objetivo: associar o livro *O Hobbit* ao autor *J. R. R. Tolkien*.

### 11.1 Criar a associação

Rota `POST /livros/:id/autores/:autorId`:

```js
const associacao = await prisma.livroAutor.create({
  data: {
    livroId: req.params.id,
    autorId: req.params.autorId,
  },
});
```

Isso insere uma linha em `livro_autor`:

```text
livro_autor
────────────────────────────────
livroId            autorId
────────────────────────────────
id-do-livro        id-do-autor
```

Repetir a mesma combinação viola a chave primária composta (`P2002`), e IDs inexistentes violam a chave
estrangeira (`P2003`).

### 11.2 Listar os autores de um livro

```js
const vinculos = await prisma.livroAutor.findMany({
  where: { livroId: req.params.id },
  include: { autor: true },
});

const autores = vinculos.map((v) => v.autor);
```

Ou, de forma equivalente, partindo do livro:

```js
const livro = await prisma.livro.findUnique({
  where: { id: req.params.id },
  include: { autores: { include: { autor: true } } },
});
```

### 11.3 Listar os livros de um autor

```js
const vinculos = await prisma.livroAutor.findMany({
  where: { autorId: req.params.id },
  include: { livro: true },
});

const livros = vinculos.map((v) => v.livro);
```

### 11.4 Remover uma associação

```js
await prisma.livroAutor.delete({
  where: {
    livroId_autorId: {
      livroId: req.params.id,
      autorId: req.params.autorId,
    },
  },
});
```

O nome `livroId_autorId` é gerado pelo Prisma a partir da chave composta `@@id([livroId, autorId])`
(os nomes dos campos unidos por `_`).

> Você remove **só o vínculo**. O registro do livro e o do autor continuam existindo.

### 11.5 Substituir todos os autores de um livro de uma vez

Uma operação típica de edição ("o livro agora tem estes autores"). Faça dentro de uma transação:

```js
await prisma.$transaction([
  prisma.livroAutor.deleteMany({ where: { livroId } }),
  prisma.livroAutor.createMany({
    data: autorIds.map((autorId) => ({ livroId, autorId })),
    skipDuplicates: true,
  }),
]);
```

### 11.6 Rotas completas do N:N

```js
// POST /livros/:id/autores/:autorId  → vincula
router.post("/:id/autores/:autorId", auth, async (req, res) => {
  try {
    const vinculo = await prisma.livroAutor.create({
      data: { livroId: req.params.id, autorId: req.params.autorId },
    });
    return res.status(201).json(vinculo);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ erro: "Autor já vinculado a este livro." });
    if (error.code === "P2003") return res.status(404).json({ erro: "Livro ou autor inexistente." });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao vincular autor." });
  }
});

// GET /livros/:id/autores  → lista autores do livro
router.get("/:id/autores", async (req, res) => {
  try {
    const vinculos = await prisma.livroAutor.findMany({
      where: { livroId: req.params.id },
      include: { autor: true },
    });
    return res.json(vinculos.map((v) => v.autor));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao listar autores." });
  }
});

// DELETE /livros/:id/autores/:autorId  → desvincula
router.delete("/:id/autores/:autorId", auth, async (req, res) => {
  try {
    await prisma.livroAutor.delete({
      where: {
        livroId_autorId: { livroId: req.params.id, autorId: req.params.autorId },
      },
    });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ erro: "Vínculo não encontrado." });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao desvincular autor." });
  }
});
```

---

## 12. Transações

Uma **transação** agrupa operações de modo que **todas** funcionem ou **nenhuma** seja aplicada (propriedade
*atomicidade* do ACID). Ela evita estados inconsistentes, por exemplo: o empréstimo foi criado, mas o livro
continua marcado como disponível.

### 12.1 Duas formas de usar

**Forma 1 — array de operações** (independentes entre si):

```js
const [emprestimo, livro] = await prisma.$transaction([
  prisma.emprestimo.create({ data: { userId, livroId } }),
  prisma.livro.update({ where: { id: livroId }, data: { disponivel: false } }),
]);
```

**Forma 2 — função interativa** (quando uma etapa depende do resultado da anterior):

```js
const resultado = await prisma.$transaction(async (tx) => {
  const livro = await tx.livro.findUnique({ where: { id: livroId } });
  // ...lógica...
  return tx.livro.update({ where: { id: livroId }, data: { disponivel: false } });
});
```

> Dentro da função interativa use sempre **`tx`**, não `prisma`. Se algo lançar erro, tudo é desfeito (*rollback*).

### 12.2 Emprestar um livro (sem condição de corrida)

O problema: dois usuários pedem o mesmo livro ao mesmo tempo. Se você só "lê e depois grava", ambos podem
passar. A solução é fazer a atualização **condicional** — só muda se ainda estiver disponível:

```js
// src/routes/emprestimos.routes.js (trecho)
class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

router.post("/", auth, async (req, res) => {
  const { livroId } = req.body;
  if (!livroId) return res.status(400).json({ erro: "livroId é obrigatório." });

  try {
    const emprestimo = await prisma.$transaction(async (tx) => {
      // só marca como indisponível se AINDA estiver disponível (operação atômica)
      const { count } = await tx.livro.updateMany({
        where: { id: livroId, disponivel: true },
        data: { disponivel: false },
      });

      if (count === 0) {
        const existe = await tx.livro.findUnique({ where: { id: livroId }, select: { id: true } });
        throw existe
          ? new HttpError(409, "Livro indisponível no momento.")
          : new HttpError(404, "Livro não encontrado.");
      }

      return tx.emprestimo.create({
        data: { userId: req.userId, livroId },
      });
    });

    return res.status(201).json(emprestimo);
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ erro: error.message });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao registrar empréstimo." });
  }
});
```

### 12.3 Devolver um livro

```js
router.patch("/:id/devolucao", auth, async (req, res) => {
  try {
    const emprestimo = await prisma.emprestimo.findUnique({ where: { id: req.params.id } });

    if (!emprestimo) return res.status(404).json({ erro: "Empréstimo não encontrado." });
    if (emprestimo.userId !== req.userId) return res.status(403).json({ erro: "Sem permissão." });
    if (emprestimo.devolvido) return res.status(409).json({ erro: "Empréstimo já devolvido." });

    const [atualizado] = await prisma.$transaction([
      prisma.emprestimo.update({
        where: { id: emprestimo.id },
        data: { devolvido: true, dataDevolucao: new Date() },
      }),
      prisma.livro.update({
        where: { id: emprestimo.livroId },
        data: { disponivel: true },
      }),
    ]);

    return res.json(atualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao devolver livro." });
  }
});
```

### 12.4 Listar os empréstimos do usuário logado

```js
router.get("/meus", auth, async (req, res) => {
  const emprestimos = await prisma.emprestimo.findMany({
    where: { userId: req.userId },
    include: { livro: { select: { id: true, titulo: true } } },
    orderBy: { dataEmprestimo: "desc" },
  });
  res.json(emprestimos);
});
```

---

## 13. SQL puro quando necessário

Se a consulta for complexa demais para a API do Prisma, você pode escrever SQL diretamente.

```js
// Retorna linhas (SELECT) — tagged template: os valores viram parâmetros, protegendo contra SQL injection
const ano = 2000;
const livros = await prisma.$queryRaw`
  SELECT id, titulo FROM livros WHERE "anoPublicacao" > ${ano}
`;

// Executa comandos que não retornam linhas (UPDATE/DELETE/INSERT); retorna o nº de linhas afetadas
const afetadas = await prisma.$executeRaw`
  UPDATE livros SET disponivel = true WHERE id = ${id}
`;
```

> **Cuidados**
>
> - Use sempre a forma de **template string** (`` $queryRaw`...` ``). Ela parametriza os valores.
> - Evite `$queryRawUnsafe` / `$executeRawUnsafe` com dados do usuário: concatenar texto abre brecha para **SQL injection**.
> - Nomes de coluna com letras maiúsculas (`"anoPublicacao"`) precisam de aspas duplas no PostgreSQL — a menos que você use `@map` para nomes em *snake_case*.
> - `BigInt`, `Decimal` e datas podem voltar em tipos especiais; converta antes de enviar como JSON.

---

## 14. Tratamento de erros do Prisma

Erros conhecidos do banco chegam com um **código** em `error.code`.

| Código | Significado | Resposta HTTP sugerida |
|--------|-------------|------------------------|
| `P2002` | Violação de restrição **única** (`@unique`, `@@unique`, `@@id`) | `409 Conflict` |
| `P2003` | Violação de **chave estrangeira** (registro referenciado não existe, ou há dependentes) | `400`/`404` (ao criar) ou `409` (ao excluir) |
| `P2025` | Registro necessário **não encontrado** (em `update`/`delete`) | `404 Not Found` |
| `P2000` | Valor longo demais para a coluna | `400 Bad Request` |
| `P2021` | A tabela não existe (migration não aplicada) | `500` |
| `P2022` | A coluna não existe (schema e banco fora de sincronia) | `500` |
| `P2034` | Conflito de escrita/deadlock em transação | `409`/`500` (pode tentar de novo) |
| `P1001` | Não foi possível alcançar o servidor do banco | `503` |
| `P1000` | Falha de autenticação no banco | `500` |

Outros erros comuns (sem código `P2xxx`):

| Situação | Causa provável |
|----------|----------------|
| Erro de validação do schema | Campo ou relação definidos incorretamente |
| `PrismaClientValidationError` | Você enviou campos inexistentes, tipos errados ou esqueceu um campo obrigatório |
| `Cannot read properties of undefined (reading 'findMany')` | Client desatualizado/não gerado ou modelo com outro nome (`prisma.livro` vs `prisma.Livro`) |

### 14.1 Centralizando a tradução dos erros

Em vez de repetir `if (error.code === ...)` em todas as rotas, crie um utilitário:

```js
// src/utils/handlePrismaError.js
function handlePrismaError(error, res, mensagens = {}) {
  switch (error.code) {
    case "P2002":
      return res.status(409).json({ erro: mensagens.P2002 || "Registro duplicado." });
    case "P2003":
      return res.status(409).json({ erro: mensagens.P2003 || "Violação de relacionamento." });
    case "P2025":
      return res.status(404).json({ erro: mensagens.P2025 || "Registro não encontrado." });
    default:
      console.error(error);                                   // detalhes ficam no servidor
      return res.status(500).json({ erro: "Erro interno do servidor." });
  }
}

module.exports = handlePrismaError;
```

Uso:

```js
} catch (error) {
  return handlePrismaError(error, res, { P2002: "Esse ISBN já está cadastrado." });
}
```

> **Não** devolva ao cliente o `error.message` do Prisma nem a connection string. Registre os detalhes no
> servidor (`console.error`) e responda com uma mensagem segura.

### 14.2 Descobrindo qual campo violou a unicidade

```js
if (error.code === "P2002") {
  console.log(error.meta);   // contém informações do campo/índice envolvido (formato depende da versão/adaptador)
}
```

---

## 15. API Express completa com Prisma

### 15.1 Estrutura de pastas

```text
biblioteca-api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── src/
│   ├── prisma.js
│   ├── server.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── utils/
│   │   └── handlePrismaError.js
│   └── routes/
│       ├── auth.routes.js
│       ├── categorias.routes.js
│       ├── autores.routes.js
│       ├── livros.routes.js
│       └── emprestimos.routes.js
├── prisma.config.ts
├── package.json
├── .env
└── .gitignore
```

### 15.2 `src/server.js`

```js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const autoresRoutes = require("./routes/autores.routes");
const livrosRoutes = require("./routes/livros.routes");
const emprestimosRoutes = require("./routes/emprestimos.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API da Biblioteca funcionando!" });
});

app.use("/auth", authRoutes);
app.use("/categorias", categoriasRoutes);
app.use("/autores", autoresRoutes);
app.use("/livros", livrosRoutes);
app.use("/emprestimos", emprestimosRoutes);

// rota não encontrada
app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
```

`package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  }
}
```

### 15.3 Mapa de rotas sugerido

| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| POST | `/auth/register` | — | Cadastra usuário |
| POST | `/auth/login` | — | Autentica e devolve JWT |
| GET | `/auth/me` | ✔ | Dados do usuário logado |
| GET | `/categorias` | — | Lista categorias |
| POST | `/categorias` | ✔ | Cria categoria |
| GET | `/autores` | — | Lista autores |
| POST | `/autores` | ✔ | Cria autor |
| GET | `/livros` | — | Lista livros (filtros e paginação) |
| GET | `/livros/:id` | — | Livro com categoria e autores |
| POST | `/livros` | ✔ | Cadastra livro (dono = usuário do token) |
| PUT | `/livros/:id` | ✔ | Atualiza livro (só o dono) |
| DELETE | `/livros/:id` | ✔ | Exclui livro (só o dono) |
| POST | `/livros/:id/autores/:autorId` | ✔ | Vincula autor |
| GET | `/livros/:id/autores` | — | Lista autores do livro |
| DELETE | `/livros/:id/autores/:autorId` | ✔ | Desvincula autor |
| POST | `/emprestimos` | ✔ | Empresta um livro |
| PATCH | `/emprestimos/:id/devolucao` | ✔ | Devolve um livro |
| GET | `/emprestimos/meus` | ✔ | Empréstimos do usuário logado |

### 15.4 Exemplo: categorias

```js
// src/routes/categorias.routes.js
const express = require("express");
const prisma = require("../prisma");
const auth = require("../middlewares/auth");
const handlePrismaError = require("../utils/handlePrismaError");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({ orderBy: { nome: "asc" } });
    res.json(categorias);
  } catch (error) {
    handlePrismaError(error, res);
  }
});

router.post("/", auth, async (req, res) => {
  const { nome } = req.body;
  if (!nome || typeof nome !== "string") return res.status(400).json({ erro: "Nome é obrigatório." });

  try {
    const categoria = await prisma.categoria.create({ data: { nome: nome.trim() } });
    res.status(201).json(categoria);
  } catch (error) {
    handlePrismaError(error, res, { P2002: "Categoria já cadastrada." });
  }
});

module.exports = router;
```

---

## 16. Segurança: bcrypt, JWT e autorização

O Prisma facilita o acesso aos dados, mas **não substitui** as regras de segurança da aplicação.

```text
Cadastro   →  validar campos · gerar hash com bcrypt.hash() · salvar com prisma.user.create()
Login      →  buscar usuário · conferir com bcrypt.compare() · emitir JWT
Middleware →  validar JWT · identificar o usuário · proteger rotas
Prisma     →  executar a operação já autorizada no banco
```

### 16.1 Cadastro (`POST /auth/register`)

```js
// src/routes/auth.routes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password || password.length < 8) {
    return res.status(400).json({ erro: "Informe username, e-mail e senha (mínimo de 8 caracteres)." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);   // 10 = custo (salt rounds)

    const usuario = await prisma.user.create({
      data: { username, email: email.toLowerCase(), password: hash },
      select: { id: true, username: true, email: true, criadoEm: true },   // NUNCA devolve o hash
    });

    return res.status(201).json(usuario);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ erro: "E-mail já cadastrado." });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
});
```

> O Prisma **não criptografa** a senha. Se você salvar `password` direto do `req.body`, ela ficará em texto puro no banco.

### 16.2 Login (`POST /auth/login`)

```js
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ erro: "Informe e-mail e senha." });

  try {
    const usuario = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // mesma mensagem para "usuário não existe" e "senha errada" (não revela qual falhou)
    const senhaOk = usuario && (await bcrypt.compare(password, usuario.password));
    if (!senhaOk) return res.status(401).json({ erro: "Credenciais inválidas." });

    const token = jwt.sign({ sub: usuario.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao autenticar." });
  }
});

router.get("/me", auth, async (req, res) => {
  const usuario = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true, criadoEm: true },   // sem o campo password
  });
  res.json(usuario);
});

module.exports = router;
```

### 16.3 Middleware de autenticação (`src/middlewares/auth.js`)

```js
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [esquema, token] = header.split(" ");

  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;          // a identidade vem do TOKEN, não do corpo da requisição
    return next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

module.exports = auth;
```

Chamada de uma rota protegida:

```http
GET /livros HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 16.4 Autorização: verificando a propriedade dos registros

Autenticação responde "**quem é você?**". Autorização responde "**você pode fazer isso?**". Uma rota protegida
não deve permitir que um usuário altere ou exclua livros de outro apenas por conhecer o ID.

**`POST /livros` — o dono vem do token:**

```js
router.post("/", auth, async (req, res) => {
  const { titulo, isbn, anoPublicacao, categoriaId } = req.body;
  // ...validações...
  const livro = await prisma.livro.create({
    data: { titulo, isbn, anoPublicacao, categoriaId, userId: req.userId },   // ← do JWT
  });
  res.status(201).json(livro);
});
```

**`PUT` / `DELETE` — só o dono:**

```js
router.delete("/:id", auth, async (req, res) => {
  try {
    const livro = await prisma.livro.findUnique({
      where: { id: req.params.id },
      select: { userId: true },
    });

    if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
    if (livro.userId !== req.userId) return res.status(403).json({ erro: "Você não pode excluir este livro." });

    await prisma.livro.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2003") return res.status(409).json({ erro: "Existem empréstimos relacionados ao livro." });
    console.error(error);
    return res.status(500).json({ erro: "Erro ao excluir livro." });
  }
});
```

Alternativa compacta (uma única consulta): `deleteMany({ where: { id, userId: req.userId } })` e verificar `count === 0`.
Ela é atômica, mas não distingue "não existe" de "não é seu".

### 16.5 Checklist de segurança

- [ ] Senha salva com **hash** (`bcrypt`), nunca em texto puro.
- [ ] Hash **nunca** aparece nas respostas (`select`/`omit`).
- [ ] `JWT_SECRET` longo, no `.env`, fora do Git.
- [ ] Token com expiração (`expiresIn`).
- [ ] `userId` vem do token, **não** do corpo da requisição.
- [ ] Verificação de **propriedade** nas rotas de alteração e exclusão.
- [ ] Mensagens de erro genéricas ao cliente; detalhes só no log do servidor.
- [ ] Entrada validada (tipos, tamanhos, formatos).
- [ ] `.env` no `.gitignore`.
- [ ] Rate limiting no login (extra, ex.: `express-rate-limit`).

---

## 17. Seed: populando o banco

O **seed** é um script que insere dados iniciais (categorias, um usuário de teste, alguns livros), poupando o
trabalho de cadastrar tudo manualmente a cada reset do banco.

### 17.1 O script `prisma/seed.js`

```js
// prisma/seed.js
const bcrypt = require("bcrypt");
const prisma = require("../src/prisma");

async function main() {
  const senhaHash = await bcrypt.hash("senha12345", 10);

  const usuario = await prisma.user.upsert({
    where: { email: "admin@biblioteca.com" },
    update: {},
    create: { username: "admin", email: "admin@biblioteca.com", password: senhaHash },
  });

  const fantasia = await prisma.categoria.upsert({
    where: { nome: "Fantasia" },
    update: {},
    create: { nome: "Fantasia" },
  });

  // Autor.nome não é @unique, então não dá para usar upsert: procuramos antes de criar
  let tolkien = await prisma.autor.findFirst({ where: { nome: "J. R. R. Tolkien" } });
  if (!tolkien) tolkien = await prisma.autor.create({ data: { nome: "J. R. R. Tolkien" } });

  await prisma.livro.upsert({
    where: { isbn: "9780000000001" },
    update: {},
    create: {
      titulo: "O Hobbit",
      isbn: "9780000000001",
      anoPublicacao: 1937,
      categoriaId: fantasia.id,
      userId: usuario.id,
      autores: { create: [{ autorId: tolkien.id }] },   // cria o vínculo em livro_autor
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
```

### 17.2 Registrando e executando

No `prisma.config.ts`:

```ts
migrations: {
  path: "prisma/migrations",
  seed: "node prisma/seed.js",
},
```

```bash
npx prisma db seed
```

> O seed usa `upsert` para poder rodar **várias vezes** sem erro de duplicidade.

---

## 18. Cheat sheets (CLI, Client e SQL ↔ Prisma)

### 18.1 Comandos do CLI

| Comando | Para que serve |
|---------|----------------|
| `npx prisma -v` | Versões do CLI/Client |
| `npx prisma init` | Cria a estrutura inicial |
| `npx prisma format` | Formata o schema |
| `npx prisma validate` | Valida o schema |
| `npx prisma generate` | Gera o Prisma Client |
| `npx prisma migrate dev --name x` | Cria e aplica migration (dev) |
| `npx prisma migrate deploy` | Aplica migrations existentes (produção/CI) |
| `npx prisma migrate status` | Estado das migrations |
| `npx prisma migrate reset` | Recria o banco do zero (**apaga dados**) |
| `npx prisma db push` | Sincroniza o schema sem migration |
| `npx prisma db pull` | Gera o schema a partir de um banco existente |
| `npx prisma db seed` | Roda o seed |
| `npx prisma studio` | Abre a interface visual dos dados |

### 18.2 Métodos do Prisma Client

| Objetivo | Método |
|----------|--------|
| Inserir um | `create` |
| Inserir vários | `createMany` |
| Buscar por campo único | `findUnique` / `findUniqueOrThrow` |
| Buscar o primeiro | `findFirst` / `findFirstOrThrow` |
| Listar | `findMany` |
| Atualizar um / vários | `update` / `updateMany` |
| Criar ou atualizar | `upsert` |
| Excluir um / vários | `delete` / `deleteMany` |
| Contar | `count` |
| Agregar | `aggregate` |
| Agrupar | `groupBy` |
| Transação | `$transaction` |
| SQL puro | `$queryRaw` / `$executeRaw` |
| Fechar conexão | `$disconnect` |

### 18.3 Opções comuns nas consultas

| Opção | Função |
|-------|--------|
| `where` | Filtrar |
| `orderBy` | Ordenar |
| `skip` / `take` | Paginar |
| `select` | Escolher campos |
| `omit` | Excluir campos do retorno |
| `include` | Trazer relações |
| `distinct` | Valores distintos |
| `cursor` | Paginação por cursor |

### 18.4 SQL ↔ Prisma

| SQL | Prisma |
|-----|--------|
| `SELECT * FROM livros` | `prisma.livro.findMany()` |
| `SELECT * FROM livros WHERE id = 'x'` | `prisma.livro.findUnique({ where: { id: "x" } })` |
| `WHERE ano >= 2000 AND disponivel = true` | `where: { anoPublicacao: { gte: 2000 }, disponivel: true }` |
| `WHERE a = 1 OR b = 2` | `where: { OR: [{ a: 1 }, { b: 2 }] }` |
| `ORDER BY titulo ASC` | `orderBy: { titulo: "asc" }` |
| `LIMIT 10 OFFSET 20` | `take: 10, skip: 20` |
| `SELECT COUNT(*)` | `prisma.livro.count()` |
| `INNER JOIN categorias` | `include: { categoria: true }` |
| `INSERT INTO ... VALUES (...)` | `prisma.livro.create({ data: {...} })` |
| `UPDATE ... WHERE id = 'x'` | `prisma.livro.update({ where, data })` |
| `DELETE FROM ... WHERE id = 'x'` | `prisma.livro.delete({ where })` |
| `GROUP BY categoriaId` | `groupBy({ by: ["categoriaId"], _count: true })` |
| `BEGIN; ...; COMMIT;` | `prisma.$transaction(...)` |
| `PRIMARY KEY (a, b)` | `@@id([a, b])` |
| `UNIQUE (a, b)` | `@@unique([a, b])` |
| `FOREIGN KEY ... ON DELETE CASCADE` | `@relation(..., onDelete: Cascade)` |
| `CREATE INDEX` | `@@index([campo])` |

---

## 19. Boas práticas e armadilhas comuns

### Boas práticas

1. **Uma única instância** do `PrismaClient` (`src/prisma.js`) reutilizada em todo o projeto.
2. **Valide a entrada** antes de chamar o Prisma (tipos, obrigatoriedade, tamanho). Bibliotecas como `zod` ajudam.
3. **Traduza os códigos de erro** (`P2002`, `P2003`, `P2025`) em respostas HTTP corretas.
4. Use **`select`** para devolver só o necessário — especialmente para nunca expor `password`.
5. Faça **paginação** em listagens que podem crescer.
6. Use **transações** quando duas ou mais escritas precisam permanecer consistentes.
7. Declare **`@@index`** nas chaves estrangeiras usadas em filtros e junções.
8. **Versione as migrations** no Git e nunca as edite depois de aplicadas.
9. Mantenha segredos **só no `.env`** e o `.env` fora do repositório.
10. Rode **`validate`** e **`generate`** sempre que mexer no schema.

### Armadilhas

| Armadilha | Como evitar |
|-----------|-------------|
| Esquecer `await` | O Prisma devolve *Promises*; sem `await` você manipula a Promise, não o dado |
| N+1 consultas (uma consulta por item em um `for`) | Use `include`/`select` ou `where: { id: { in: [...] } }` |
| Confiar no `userId` vindo do corpo | Pegue do JWT (`req.userId`) |
| Retornar o hash da senha | `select` explícito ou `omit` |
| `update` sem tratar `P2025` | Capture e responda `404` |
| Usar `findUnique` com campo não único | Use `findFirst`/`findMany`, ou declare `@unique` |
| Alterar o schema e esquecer a migration | `migrate dev` + `generate` |
| Criar `PrismaClient` dentro das rotas | Importe a instância única |
| Usar `migrate reset` achando que é seguro | Ele **apaga todos os dados** |
| Montar SQL por concatenação em `$queryRawUnsafe` | Use `` $queryRaw`...` `` com template string |
| `findMany()` sem limite em tabela grande | Use `take`/`skip` |

---

## 20. Troubleshooting

| Sintoma | Causa provável | O que fazer |
|---------|----------------|-------------|
| Mensagem dizendo que o Client não foi inicializado / `Cannot find module '@prisma/client'` | `generate` não foi executado | `npx prisma generate` |
| `Cannot read properties of undefined (reading 'livro')` ou `prisma.livro is not a function` | Client desatualizado ou nome do modelo diferente | Regenere o Client; confira que o modelo é `Livro` → `prisma.livro` |
| Erro dizendo que `url` não é mais suportada no bloco `datasource` | Sintaxe do Prisma ≤ 6 | Remova `url` do `schema.prisma`; configure no `prisma.config.ts` |
| Erro pedindo um *adapter* ao criar o `PrismaClient` | No Prisma 7 ele é obrigatório | Use `new PrismaClient({ adapter })` com `@prisma/adapter-neon` |
| `url` indefinida / `env("DIRECT_URL")` falha | `.env` não carregado ou variável ausente | `import "dotenv/config"` no `prisma.config.ts`; confira o nome da variável |
| `P1001: Can't reach database server` | Connection string errada, rede, ou banco do Neon "dormindo" | Confira a string (`sslmode=require`), tente novamente em alguns segundos |
| Migration trava ou falha na criação de tabelas | CLI usando a string **pooled** | Use a conexão **direta** (`DIRECT_URL`) no `prisma.config.ts` |
| Erro de WebSocket ao conectar via `adapter-neon` em Node antigo | Ambiente sem `WebSocket` global | Atualize o Node ou veja na doc do Neon como configurar o `ws` |
| `exports is not defined in ES module scope` / `import.meta` com `prisma-client` | Client ESM gerado em projeto CommonJS | Defina `moduleFormat = "cjs"` no `generator` e regenere; ou use a Opção A (`prisma-client-js`) |
| Erro ao fazer `require` de arquivo `.ts` do Client gerado | `prisma-client` gera TypeScript | Execute com `tsx`/Node com suporte a TS, migre para TS ou use `prisma-client-js` |
| *Drift detected* ao rodar `migrate dev` | O banco foi alterado fora das migrations | Em desenvolvimento, `migrate reset` (apaga dados) ou ajuste o schema para refletir o banco |
| Aviso de migration alterada após aplicada | Você editou um arquivo `migration.sql` antigo | Restaure o arquivo original e crie uma nova migration |
| `Unique constraint failed` (`P2002`) | Valor duplicado em campo único | Trate com `409` e mensagem amigável |
| `Foreign key constraint failed` (`P2003`) | ID inexistente ou registro com dependentes | Verifique os IDs; ajuste `onDelete` se fizer sentido |
| `An operation failed because it depends on one or more records that were required but not found` (`P2025`) | `update`/`delete` em registro inexistente | Trate com `404` |

Se o erro persistir, rode `npx prisma -v`, confirme as versões do CLI e do Client, `npx prisma validate` e leia a
mensagem **inteira** — ela costuma dizer o campo e o motivo.

---

## 21. Exercícios e checklist de aprendizado

### 21.1 Exercícios

**Nível 1 — Schema e migrations**

1. Escreva o schema completo da biblioteca sem consultar o guia e valide com `npx prisma validate`.
2. Rode a primeira migration e abra o `migration.sql`. Identifique onde ficaram a PK composta de `livro_autor`
   e a constraint `UNIQUE` do ISBN.
3. Adicione `descricao String?` em `Livro` e crie a migration `adicionar_descricao_livro`.
4. Adicione `atualizadoEm DateTime @updatedAt` ao `Livro`. O que acontece com as linhas já existentes? Por quê?

**Nível 2 — CRUD e consultas**

5. Implemente o CRUD de `Categoria` e teste o erro `P2002` cadastrando o mesmo nome duas vezes.
6. Crie `GET /livros?categoria=Fantasia&disponivel=true&busca=hobbit` usando filtros combinados.
7. Adicione paginação (`pagina` e `limite`) em `GET /livros`, devolvendo também o `total`.
8. Faça `GET /livros/:id` devolver livro, categoria e **autores achatados** (`autores: [{ id, nome }]`).

**Nível 3 — N:N e transações**

9. Implemente as três rotas do N:N (vincular, listar, desvincular) e teste a duplicação do vínculo.
10. Crie `GET /autores/:id/livros` listando os livros de um autor.
11. Implemente empréstimo e devolução com `$transaction` e confirme que `disponivel` fica sempre coerente.
12. Simule duas requisições simultâneas de empréstimo do mesmo livro e explique por que só uma funciona.

**Nível 4 — Segurança**

13. Implemente cadastro e login com `bcrypt` + JWT e confira, no Prisma Studio, que `password` é um hash.
14. Proteja as rotas de escrita com o middleware `auth` e use `req.userId` em `POST /livros`.
15. Impeça que um usuário edite ou exclua livros de outro (`403`) e teste com dois usuários.

<details>
<summary><strong>Dica/gabarito do exercício 6 (filtros combinados)</strong></summary>

```js
router.get("/", async (req, res) => {
  const { categoria, disponivel, busca } = req.query;

  const livros = await prisma.livro.findMany({
    where: {
      ...(categoria && { categoria: { nome: categoria } }),
      ...(disponivel !== undefined && { disponivel: disponivel === "true" }),
      ...(busca && { titulo: { contains: busca, mode: "insensitive" } }),
    },
    include: { categoria: true },
    orderBy: { titulo: "asc" },
  });

  res.json(livros);
});
```

</details>

<details>
<summary><strong>Dica/gabarito do exercício 10 (livros de um autor)</strong></summary>

```js
router.get("/:id/livros", async (req, res) => {
  const vinculos = await prisma.livroAutor.findMany({
    where: { autorId: req.params.id },
    include: { livro: true },
  });
  res.json(vinculos.map((v) => v.livro));
});
```

</details>

<details>
<summary><strong>Dica/gabarito do exercício 12 (corrida no empréstimo)</strong></summary>

O `updateMany({ where: { id, disponivel: true }, data: { disponivel: false } })` é uma única instrução SQL
atômica no banco. Duas requisições simultâneas competem: a primeira altera 1 linha (`count: 1`); a segunda
já encontra `disponivel = false` e altera 0 linhas (`count: 0`), caindo no `409`. Um "ler e depois gravar"
em duas etapas deixaria as duas passarem.

</details>

### 21.2 Checklist de aprendizado

**Conceitos**

- [ ] Sei explicar a diferença entre Prisma Schema, Migrate e Client.
- [ ] Sei por que o Prisma 7 exige o `prisma.config.ts` e o *driver adapter*.
- [ ] Sei a diferença entre `DATABASE_URL` (pooled) e `DIRECT_URL` (direta) no Neon.

**Schema**

- [ ] Sei criar `model`, campos obrigatórios/opcionais e valores `@default`.
- [ ] Sei usar `@id`, `@unique`, `@@id`, `@@unique`, `@@index`, `@map` e `@@map`.
- [ ] Sei modelar 1:N e N:N com tabela associativa explícita.
- [ ] Sei explicar o que `onDelete: Cascade` e `Restrict` fazem.

**Migrations**

- [ ] Sei rodar `validate`, `migrate dev` e `generate`, e a ordem entre eles.
- [ ] Sei a diferença entre `migrate dev` e `migrate deploy`.
- [ ] Sei por que não devo editar migrations já aplicadas.

**Client**

- [ ] Sei usar `create`, `findMany`, `findUnique`, `update`, `delete` e `upsert`.
- [ ] Sei filtrar, ordenar e paginar.
- [ ] Sei usar `include`/`select` e escritas aninhadas (`connect`, `create`).
- [ ] Sei criar, listar e remover vínculos na tabela `livro_autor`.
- [ ] Sei usar `$transaction` e explicar quando é necessária.

**API e segurança**

- [ ] Traduzo `P2002`, `P2003` e `P2025` em respostas HTTP adequadas.
- [ ] Salvo senhas com `bcrypt` e nunca as devolvo nas respostas.
- [ ] Emito e valido JWT e uso `req.userId` em vez do `userId` do corpo.
- [ ] Verifico a propriedade dos registros antes de alterar ou excluir.

### 21.3 Ordem recomendada de implementação

> Minha sugestão é **não implementar todas as rotas de uma vez**.

1. Faça o **banco funcionar**: schema, migration e Client testado (por exemplo, com o seed).
2. Implemente o **CRUD de categorias e livros**.
3. Implemente o **N:N** entre livros e autores.
4. Implemente **empréstimos** com transação.
5. Por último, integre **bcrypt + JWT** e aplique as **verificações de autorização**.

Assim, na apresentação você consegue explicar tanto o código quanto a estrutura do banco, em vez de apenas
mostrar que a API funciona.

### 21.4 Roteiro para explicar o trabalho

1. Mostre o **diagrama ER** e explique as seis tabelas.
2. Mostre o `schema.prisma`: PK composta em `LivroAutor`, `@unique` do ISBN, `onDelete`.
3. Mostre o **SQL da migration** e relacione com o schema.
4. Demonstre o N:N: vincular dois autores a um livro e listar via `include`.
5. Demonstre uma **transação** (empréstimo → livro fica indisponível; devolução → volta a disponível).
6. Demonstre a **segurança**: hash no banco (Prisma Studio), JWT, `403` ao mexer em livro de outro usuário.

---

## 22. Documentação oficial

- [Prisma Schema — estrutura e configuração](https://www.prisma.io/docs/orm/v7/prisma-schema/overview)
- [Relacionamentos — 1:1, 1:N e N:N](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations)
- [CRUD com Prisma Client](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [Upgrade para o Prisma ORM 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-to-prisma-7)
- [Guia de integração entre Neon e Prisma](https://neon.tech/docs/guides/prisma)

> As APIs do Prisma 7 ainda estão em evolução (geradores, adaptadores, formato dos módulos). Se algum exemplo
> falhar na sua instalação, compare com a documentação da **versão exata** que você instalou
> (`npx prisma -v`) e com o que o `npx prisma init` gerou no seu projeto.

---

## Apêndice — Glossário rápido

| Termo | Significado |
|-------|-------------|
| **ORM** | Camada que mapeia tabelas do banco para objetos da linguagem |
| **Model** | Definição de uma entidade no `schema.prisma` (vira tabela) |
| **Migration** | Arquivo SQL versionado com uma mudança de estrutura do banco |
| **Prisma Client** | Biblioteca gerada com os métodos de consulta do seu schema |
| **Driver adapter** | Peça que liga o Prisma Client ao driver/serviço do banco (ex.: Neon) |
| **Chave primária (PK)** | Identificador único de cada linha |
| **Chave estrangeira (FK)** | Coluna que referencia a PK de outra tabela |
| **Tabela associativa** | Tabela que implementa um relacionamento N:N |
| **Connection pooling** | Reaproveitamento de conexões ao banco por um intermediário (pooler) |
| **Transação** | Conjunto de operações que ocorre por completo ou não ocorre |
| **Rollback** | Desfazer as operações de uma transação que falhou |
| **JWT** | Token assinado que identifica o usuário autenticado |
| **Hash** | Resultado irreversível de uma função de criptografia, usado para guardar senhas |
| **Seed** | Script que popula o banco com dados iniciais |
