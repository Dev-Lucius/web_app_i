# 📋 Gerenciador de Tarefas — Projeto Prático Laravel

Projeto de exemplo para acompanhar o **Guia Completo de Laravel**. Um CRUD completo de
Tarefas e Categorias, com relacionamento entre elas, feito para estudo.

## O que este projeto demonstra

- Rotas de recurso (`Route::resource`)
- Controllers com os 7 métodos RESTful
- Eloquent ORM (Models, Mass Assignment, Casts)
- Relacionamento `hasMany` / `belongsTo` (Categoria → Tarefas)
- Migrations com chave estrangeira
- Views Blade com layout, componentes reaproveitáveis (`@include`) e diretivas
- Validação de formulários e exibição de erros
- Seeder com dados de exemplo

## Pré-requisitos

- PHP **8.3** ou superior (exigido pelo Laravel 13)
- [Composer](https://getcomposer.org)
- Não é necessário instalar MySQL/PostgreSQL: o projeto usa **SQLite**, que não exige
  nenhum servidor de banco de dados separado.

## Passo a passo da instalação

### 1. Criar um projeto Laravel novo

Em um terminal, fora desta pasta, rode:

```bash
composer create-project laravel/laravel gerenciador-tarefas
cd gerenciador-tarefas
```

Isso baixa uma instalação limpa do Laravel 13.

### 2. Copiar os arquivos deste pacote

Copie **o conteúdo** desta pasta (`gerenciador-de-tarefas/`) para dentro da pasta do
projeto que acabou de ser criado, **sobrescrevendo** o `routes/web.php` e o
`database/seeders/DatabaseSeeder.php` que já vêm por padrão.

Ao final, seu projeto deve ter estes arquivos (entre outros que o Laravel já criou):

```
gerenciador-tarefas/
├── app/
│   ├── Models/
│   │   ├── Category.php        ← copiado
│   │   └── Task.php             ← copiado
│   └── Http/Controllers/
│       ├── CategoryController.php  ← copiado
│       └── TaskController.php      ← copiado
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_categories_table.php  ← copiado
│   │   └── 2024_01_01_000002_create_tasks_table.php        ← copiado
│   └── seeders/
│       └── DatabaseSeeder.php  ← copiado (sobrescreve o padrão)
├── resources/views/
│   ├── layouts/app.blade.php    ← copiado
│   ├── tasks/*.blade.php        ← copiado
│   └── categories/*.blade.php   ← copiado
└── routes/
    └── web.php                  ← copiado (sobrescreve o padrão)
```

### 3. Configurar o banco de dados (SQLite)

Abra o arquivo `.env` na raiz do projeto e configure:

```env
DB_CONNECTION=sqlite
```

Apague ou comente as linhas `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` e
`DB_PASSWORD`, se existirem.

Depois, crie o arquivo físico do banco:

```bash
touch database/database.sqlite
```

> No Windows (fora do WSL), use: `type nul > database\database.sqlite`

### 4. Rodar as migrations

```bash
php artisan migrate
```

Isso cria as tabelas `categories` e `tasks` no banco.

### 5. (Opcional) Popular com dados de exemplo

```bash
php artisan db:seed
```

### 6. Subir o servidor local

```bash
php artisan serve
```

Acesse **http://localhost:8000** no navegador. Você já deve ver a lista de tarefas
(ou uma lista vazia, se pulou o passo 5).

## Explorando o código

A ordem sugerida de leitura, para acompanhar o guia:

1. `database/migrations/` — como as tabelas são definidas
2. `app/Models/` — como os models se relacionam
3. `routes/web.php` — como as URLs são mapeadas
4. `app/Http/Controllers/` — a lógica de cada ação
5. `resources/views/` — como os dados chegam até o HTML

## Ideias para evoluir o projeto (praticar mais)

- Adicionar autenticação com `laravel/breeze` e permitir que cada usuário veja
  só as suas próprias tarefas.
- Trocar o campo `status` (string) por um **Enum PHP nativo** com cast do Eloquent.
- Adicionar paginação em `TaskController@index` com `->paginate(10)` em vez de `->get()`.
- Criar testes automatizados com Pest ou PHPUnit para o CRUD de tarefas.
- Transformar os controllers em uma API JSON usando Eloquent API Resources.
