# 🎫 Helpdesk de Tickets — Projeto Prático Laravel

Projeto de estudo com autenticação e relacionamentos mais avançados que o
Gerenciador de Tarefas: dois relacionamentos diferentes para o mesmo Model,
relacionamento N:M com tabela pivô, e um recurso aninhado (comentários).

## O que este projeto demonstra (além do que já vimos no Gerenciador de Tarefas)

- Autenticação implementada manualmente (`Auth::attempt`, `Hash::make`, sessão)
- Dois relacionamentos `belongsTo`/`hasMany` diferentes entre `Ticket` e `User`
  (solicitante vs. agente responsável)
- Relacionamento N:M (`belongsToMany`) entre `Ticket` e `Tag`, com `sync()`
- Um recurso aninhado: comentários só existem dentro do contexto de um ticket
- Autorização simples por papel (cliente vs. agente), feita com `abort_unless`

## Pré-requisitos

- PHP **8.3** ou superior
- [Composer](https://getcomposer.org)
- Nenhum banco de dados externo necessário — o projeto usa **SQLite**

## Passo a passo da instalação

### 1. Criar um projeto Laravel novo

```bash
composer create-project laravel/laravel helpdesk-tickets
cd helpdesk-tickets
```

### 2. Copiar os arquivos deste pacote

Copie o conteúdo desta pasta (`helpdesk-tickets/`) para dentro do projeto recém-criado,
**sobrescrevendo**:

- `app/Models/User.php`
- `routes/web.php`
- `database/seeders/DatabaseSeeder.php`

E adicionando todos os demais arquivos (migrations, novos Models, Controllers, views).

### 3. Configurar o banco (SQLite)

No `.env`:

```env
DB_CONNECTION=sqlite
```

Remova/comente `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` se
existirem, e crie o arquivo do banco:

```bash
touch database/database.sqlite
```

### 4. Rodar as migrations

```bash
php artisan migrate
```

Repare na ordem das migrations copiadas — ela importa por causa das chaves
estrangeiras: `role` em `users` → `categories` → `tickets` → `comments` → `tags` →
`tag_ticket` (a tabela pivô, por último, pois depende de `tags` e `tickets` já existirem).

### 5. Popular com dados de exemplo

```bash
php artisan db:seed
```

Isso cria duas contas prontas para teste:

| Papel | E-mail | Senha |
|---|---|---|
| Agente | `agente@helpdesk.test` | `password` |
| Cliente | `cliente@helpdesk.test` | `password` |

### 6. Subir o servidor

```bash
php artisan serve
```

Acesse **http://localhost:8000** — você será redirecionado para a tela de login.

## Testando os dois papéis

1. Entre como **cliente** (`cliente@helpdesk.test`): você só vê os próprios chamados
   e pode abrir novos e comentar, mas não pode editar status/prioridade/agente.
2. Saia e entre como **agente** (`agente@helpdesk.test`): você vê **todos** os
   chamados, pode editá-los, atribuir a si mesmo (ou a outro agente) e mudar o status.
3. Crie um novo chamado com tags (ex: `rede, lento`) e observe a tabela `tag_ticket`
   sendo populada por trás dos panos.

## O que foi deixado de fora de propósito

- **CRUD de categorias** — já foi construído no projeto anterior (Gerenciador de
  Tarefas); aqui as categorias só são criadas via Seeder. **Ótimo exercício**: recriar
  um `CategoryController` aqui, reaproveitando o padrão que você já aprendeu.
- **Policies/Gates** — a autorização usa `abort_unless` direto no Controller para
  ficar mais simples de acompanhar. Ver seção "Próximos passos" do guia para evoluir
  isso.
- **Notificações por e-mail** quando um ticket muda de status.
