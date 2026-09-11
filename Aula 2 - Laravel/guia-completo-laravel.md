# 📘 Guia Completo de Laravel — Do Zero ao Projeto Prático

> Escrito para quem já sabe PHP mas nunca usou um framework. Sempre que fizer sentido,
> vou comparar o "jeito Laravel" de resolver um problema com o que você provavelmente
> já faz hoje em PHP puro — isso ajuda a entender **por que** o framework existe, não
> só **como** usá-lo.
>
> Este guia acompanha um projeto prático completo: um **Gerenciador de Tarefas**.
> Sempre que possível, vou apontar em qual arquivo do projeto aquele conceito aparece
> na prática.

Versão de referência: **Laravel 13** (a versão estável mais recente, que exige **PHP 8.3+**).
Praticamente tudo aqui também vale para Laravel 11 e 12, já que a estrutura básica do
framework não muda de um ano para o outro — o que muda são funcionalidades extras.

---

## Sumário

1. [O que é Laravel e por que usar um framework](#1-o-que-é-laravel-e-por-que-usar-um-framework)
2. [Instalação e primeiros passos](#2-instalação-e-primeiros-passos)
3. [Estrutura de pastas do projeto](#3-estrutura-de-pastas-do-projeto)
4. [Roteamento (Routes)](#4-roteamento-routes)
5. [Controllers](#5-controllers)
6. [Views com Blade](#6-views-com-blade)
7. [Eloquent ORM](#7-eloquent-orm)
8. [Migrations](#8-migrations)
9. [Relacionamentos entre Models](#9-relacionamentos-entre-models)
10. [Validação de formulários](#10-validação-de-formulários)
11. [Middleware](#11-middleware)
12. [Cheat sheet: comandos Artisan](#12-cheat-sheet-comandos-artisan)
13. [Boas práticas e segurança](#13-boas-práticas-e-segurança)
14. [Tour pelo projeto prático](#14-tour-pelo-projeto-prático-gerenciador-de-tarefas)
15. [Próximos passos](#15-próximos-passos)

---

## 1. O que é Laravel e por que usar um framework

### 1.1 O problema que o Laravel resolve

Quando você escreve PHP puro, provavelmente já reinventou, na mão, coisas como:

- Um jeito de decidir "qual código rodar" baseado na URL acessada (`$_SERVER['REQUEST_URI']`)
- Uma forma de conectar no banco e montar queries (`mysqli` ou `PDO`)
- Um sistema de templates com `include` para não repetir o `<head>` HTML em toda página
- Validação manual de `$_POST` antes de salvar no banco
- Proteção manual contra SQL Injection e CSRF

O Laravel formaliza tudo isso em peças com nome e lugar certo, testadas por milhões de
projetos. Isso significa: menos código repetido, menos bugs de segurança "esquecidos",
e qualquer outro desenvolvedor Laravel entende a estrutura do seu projeto rapidamente.

### 1.2 O padrão MVC

Laravel segue (com adaptações) o padrão **MVC — Model, View, Controller**:

| Camada | Responsabilidade | Onde fica |
|---|---|---|
| **Model** | Representa uma "coisa" do seu sistema e conversa com o banco de dados | `app/Models/` |
| **View** | O HTML que é mostrado ao usuário | `resources/views/` |
| **Controller** | Recebe a requisição, decide o que fazer, busca dados no Model e escolhe a View | `app/Http/Controllers/` |

O fluxo de uma requisição típica é:

```
Usuário acessa uma URL
        ↓
routes/web.php decide qual Controller/método chamar
        ↓
Controller pede dados ao Model (Eloquent)
        ↓
Model consulta o banco de dados
        ↓
Controller manda os dados para a View
        ↓
View (Blade) transforma tudo em HTML
        ↓
HTML é devolvido ao navegador
```

Guarde esse fluxo — ele se repete em praticamente toda funcionalidade que você vai construir.

### 1.3 Por que Laravel especificamente?

PHP tem vários frameworks (Symfony, CodeIgniter, Slim...). Laravel é hoje o mais usado
no mercado porque combina:

- **Eloquent ORM** — trabalhar com banco de dados como se fossem objetos PHP, sem escrever SQL manualmente na maior parte do tempo.
- **Blade** — motor de templates simples e rápido de aprender.
- **Artisan** — uma ferramenta de linha de comando que gera código repetitivo para você (`php artisan make:model`, por exemplo).
- **Documentação excelente** e uma comunidade enorme (Laracasts, Laravel News, fóruns).
- **"Baterias inclusas"**: autenticação, filas de processamento, cache, envio de e-mail, testes — tudo já vem pronto para configurar, sem precisar escolher e integrar 10 bibliotecas diferentes.

---

## 2. Instalação e primeiros passos

### 2.1 Pré-requisitos

- **PHP 8.3 ou superior** (exigido pelo Laravel 13)
- **[Composer](https://getcomposer.org)** — o gerenciador de dependências do PHP (o equivalente ao `npm` do JavaScript)
- Opcionalmente, um banco de dados (mas vamos usar SQLite, que não exige instalar nada extra)

### 2.2 Criando um projeto novo

Existem duas formas equivalentes:

```bash
# Opção 1: via Composer diretamente
composer create-project laravel/laravel meu-projeto

# Opção 2: via instalador oficial do Laravel (se já tiver instalado globalmente)
laravel new meu-projeto
```

Durante a instalação (Opção 2), o instalador pode perguntar qual banco de dados você
quer usar. Para estudar e prototipar, escolha **SQLite** — é um banco de dados que vive
em um único arquivo, sem precisar instalar MySQL/PostgreSQL na sua máquina.

### 2.3 O arquivo `.env`

Esse arquivo guarda as configurações que mudam entre ambientes (local, produção, etc.):
credenciais de banco de dados, chaves de API, modo de debug. Ele **nunca** deve ir para
o Git (o `.gitignore` padrão do Laravel já cuida disso).

Para usar SQLite, seu `.env` precisa ter:

```env
DB_CONNECTION=sqlite
```

E você cria o arquivo físico do banco com:

```bash
touch database/database.sqlite
```

### 2.4 Subindo o servidor local

```bash
php artisan serve
```

Isso sobe um servidor de desenvolvimento em `http://localhost:8000`. **Nunca** use esse
comando em produção — ele existe só para desenvolvimento local.

### 2.5 Comandos Artisan: sua ferramenta do dia a dia

`artisan` é o CLI (linha de comando) do Laravel. Ele gera arquivos seguindo as
convenções do framework, para você não digitar boilerplate na mão:

```bash
php artisan make:model Task              # cria um Model
php artisan make:controller TaskController  # cria um Controller
php artisan make:migration create_tasks_table  # cria uma Migration
```

Vamos ver cada um desses conceitos em detalhe a seguir. Há uma seção de cheat sheet
completa mais adiante (seção 12).

---

## 3. Estrutura de pastas do projeto

Um projeto Laravel recém-criado tem esta estrutura (pastas mais importantes):

```
meu-projeto/
├── app/
│   ├── Http/
│   │   └── Controllers/     ← seus Controllers
│   ├── Models/               ← seus Models (Eloquent)
│   └── Providers/            ← configuração de inicialização do app
├── bootstrap/
│   └── app.php               ← configuração central: rotas, middleware, exceções
├── config/                   ← arquivos de configuração (banco, cache, mail...)
├── database/
│   ├── factories/            ← "fábricas" de dados falsos para testes
│   ├── migrations/           ← histórico versionado da estrutura do banco
│   └── seeders/               ← scripts para popular o banco com dados iniciais
├── public/
│   └── index.php             ← porta de entrada única de todas as requisições HTTP
├── resources/
│   └── views/                 ← seus arquivos .blade.php
├── routes/
│   ├── web.php                ← rotas para páginas (navegador)
│   └── console.php            ← comandos Artisan customizados
├── storage/                   ← logs, cache de views compiladas, uploads
├── tests/                     ← testes automatizados
├── .env                        ← variáveis de ambiente (não versionar!)
└── composer.json               ← dependências do projeto
```

> 💡 **Nota sobre versões**: desde o Laravel 11, o antigo arquivo
> `app/Http/Kernel.php` (onde ficavam registrados os middlewares) **não existe mais**.
> Toda essa configuração central — middleware, rotas, tratamento de exceções — agora
> mora em `bootstrap/app.php`. Se você encontrar tutoriais antigos (Laravel 10 ou
> anterior) mencionando `Kernel.php`, saiba que isso mudou de lugar.

O ponto mais importante para fixar agora: **você vai passar 90% do seu tempo em quatro
pastas**: `app/Models`, `app/Http/Controllers`, `database/migrations` e
`resources/views`. É exatamente essa a estrutura que o projeto prático deste guia usa.

---

## 4. Roteamento (Routes)

### 4.1 O básico

Rotas ficam em `routes/web.php` e dizem ao Laravel: "quando alguém acessar esta URL,
com este verbo HTTP, rode este código".

```php
use Illuminate\Support\Facades\Route;

Route::get('/ola', function () {
    return 'Olá, mundo!';
});
```

Isso é o equivalente a, em PHP puro, verificar manualmente
`$_SERVER['REQUEST_URI']` e `$_SERVER['REQUEST_METHOD']` — só que declarativo e
organizado em um único lugar.

### 4.2 Verbos HTTP disponíveis

```php
Route::get('/tarefas', ...);      // buscar/listar dados
Route::post('/tarefas', ...);     // criar
Route::put('/tarefas/{id}', ...); // atualizar (substituindo tudo)
Route::patch('/tarefas/{id}', ...); // atualizar (parcialmente)
Route::delete('/tarefas/{id}', ...); // remover
```

Formulários HTML só entendem `GET` e `POST` nativamente. Para simular `PUT`, `PATCH` e
`DELETE`, o Laravel usa um campo escondido — é o que a diretiva Blade `@method('DELETE')`
faz (veja mais na seção 6).

### 4.3 Parâmetros de rota

```php
Route::get('/tarefas/{id}', function (string $id) {
    return "Tarefa número {$id}";
});
```

### 4.4 Rotas nomeadas

Em vez de escrever a URL `/tarefas` toda vez que precisar de um link, dê um **nome**
à rota e referencie esse nome. Se a URL mudar no futuro, você só ajusta em um lugar:

```php
Route::get('/tarefas', [TaskController::class, 'index'])->name('tasks.index');
```

```blade
<a href="{{ route('tasks.index') }}">Ver tarefas</a>
```

### 4.5 Rotas de recurso (Resource Routes) — a mais importante para CRUD

Praticamente todo CRUD (Criar, Ler, Atualizar, Apagar) segue o mesmo padrão de 7
ações. Em vez de declarar rota por rota, o Laravel oferece um atalho:

```php
use App\Http\Controllers\TaskController;

Route::resource('tasks', TaskController::class);
```

Essa **única linha** gera as 7 rotas abaixo automaticamente:

| Verbo | URI | Ação no Controller | Nome da rota | Para quê |
|---|---|---|---|---|
| GET | `/tasks` | `index` | `tasks.index` | Listar todas |
| GET | `/tasks/create` | `create` | `tasks.create` | Formulário de criação |
| POST | `/tasks` | `store` | `tasks.store` | Salvar o que veio do formulário |
| GET | `/tasks/{task}` | `show` | `tasks.show` | Ver detalhes de uma |
| GET | `/tasks/{task}/edit` | `edit` | `tasks.edit` | Formulário de edição |
| PUT/PATCH | `/tasks/{task}` | `update` | `tasks.update` | Salvar a edição |
| DELETE | `/tasks/{task}` | `destroy` | `tasks.destroy` | Remover |

Isso é exatamente o que o projeto prático usa para `tasks` e `categories`. Rode
`php artisan route:list` a qualquer momento para ver todas as rotas registradas no
seu projeto — é uma das ferramentas de debug mais usadas no dia a dia.

### 4.6 Route Model Binding (mágica que economiza código)

Repare na tabela acima: a URL usa `{task}`. Se o método do Controller receber um
parâmetro tipado como `Task $task`, o Laravel **busca automaticamente** no banco a
tarefa com aquele ID — e já devolve erro 404 sozinho se não existir:

```php
public function show(Task $task)
{
    // $task já é a Tarefa correta, buscada no banco automaticamente!
    return view('tasks.show', compact('task'));
}
```

Sem isso, você escreveria manualmente:

```php
public function show(string $id)
{
    $task = Task::find($id);
    if (!$task) {
        abort(404);
    }
    return view('tasks.show', compact('task'));
}
```

As duas versões fazem a mesma coisa — a primeira é só mais curta e é o padrão usado
em todo o projeto prático.

---

## 5. Controllers

### 5.1 Para que servem

O Controller é o "meio de campo": recebe a requisição, conversa com o Model, e decide
qual View mostrar (ou qual redirecionamento fazer). Ele não deveria conter lógica de
banco de dados complexa nem HTML — só orquestração.

### 5.2 Criando um Controller

```bash
php artisan make:controller TaskController
```

Isso gera `app/Http/Controllers/TaskController.php` já com a classe criada,
pronta para você adicionar métodos. Para já gerar com os 7 métodos de um resource
controller (o que fizemos no projeto prático):

```bash
php artisan make:controller TaskController --resource
```

### 5.3 Anatomia de um método de Controller

```php
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
    ]);

    Task::create($validated);

    return redirect()->route('tasks.index')->with('success', 'Tarefa criada!');
}
```

Note o `Request $request` no parâmetro do método. Você nunca instancia essa classe
manualmente — o Laravel a "injeta" sozinho. Isso se chama **injeção de dependência**:
o framework olha o que o método pede no parâmetro e entrega automaticamente. O mesmo
vale para o Route Model Binding que vimos na seção anterior (`Task $task`).

### 5.4 `$request` vs `$_POST` / `$_GET`

| PHP puro | Laravel |
|---|---|
| `$_POST['title']` | `$request->input('title')` ou `$request->title` |
| `$_GET['status']` | `$request->query('status')` ou `$request->status` |
| `isset($_POST['title'])` | `$request->has('title')` |
| Validar tudo na mão com `if` | `$request->validate([...])` |

O objeto `$request` unifica tudo isso (e muito mais: arquivos enviados, headers,
cookies) em uma única interface consistente.

---

## 6. Views com Blade

### 6.1 O que é Blade

Blade é o motor de templates do Laravel. Arquivos Blade terminam em `.blade.php` e
ficam em `resources/views/`. Ele compila para PHP puro nos bastidores (e faz cache
disso), então não tem praticamente nenhum custo de performance — é só uma sintaxe
mais limpa por cima do PHP.

### 6.2 Exibindo dados: `{{ }}` vs `{!! !!}`

```blade
{{-- Escapa HTML automaticamente (proteção contra XSS) --}}
<h1>{{ $task->title }}</h1>

{{-- NÃO escapa — só use se tiver certeza absoluta de que o conteúdo é seguro --}}
{!! $htmlConfiavel !!}
```

Em PHP puro, o equivalente seguro seria sempre lembrar de usar
`htmlspecialchars($task->title)`. O Blade faz isso por padrão com `{{ }}`, então é
muito mais difícil esquecer e abrir uma brecha de segurança sem querer.

### 6.3 Estruturas de controle

```blade
@if ($task->status === 'concluida')
    <span class="badge bg-success">Concluída</span>
@elseif ($task->status === 'em_andamento')
    <span class="badge bg-warning">Em andamento</span>
@else
    <span class="badge bg-secondary">Pendente</span>
@endif

@foreach ($tasks as $task)
    <li>{{ $task->title }}</li>
@endforeach

{{-- @forelse já trata o caso de lista vazia, evitando um @if separado --}}
@forelse ($tasks as $task)
    <li>{{ $task->title }}</li>
@empty
    <p>Nenhuma tarefa encontrada.</p>
@endforelse
```

Compare com PHP puro, onde você normalmente alternaria entre tags `<?php ?>`:

```php
<?php foreach ($tasks as $task): ?>
    <li><?= htmlspecialchars($task->title) ?></li>
<?php endforeach; ?>
```

Ambos fazem a mesma coisa — o Blade só é mais legível em meio a HTML.

### 6.4 Layouts (evitando repetir `<html>`, `<head>`, menu, etc.)

Esse é o `@include`/`@extends` do Blade, equivalente a um `include('header.php')`
manual, mas com um sistema de "blocos preenchíveis":

**`resources/views/layouts/app.blade.php`** (o molde):

```blade
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>@yield('title', 'Meu Site')</title>
</head>
<body>
    @yield('content')
</body>
</html>
```

**`resources/views/tasks/index.blade.php`** (uma página que usa o molde):

```blade
@extends('layouts.app')

@section('title', 'Tarefas')

@section('content')
    <h1>Minhas tarefas</h1>
@endsection
```

- `@yield('content')` marca **onde** o conteúdo específico de cada página vai entrar.
- `@extends('layouts.app')` diz "esta página usa aquele molde".
- `@section('content') ... @endsection` é o bloco que preenche o `@yield` correspondente.
- `@section('title', 'Tarefas')` (com vírgula, sem `@endsection`) é a forma curta,
  usada quando o conteúdo cabe em uma linha só.

O projeto prático usa exatamente essa estrutura: um layout único em
`layouts/app.blade.php`, estendido por todas as outras views.

### 6.5 Reaproveitando pedaços de HTML com `@include`

Quando duas páginas compartilham um pedaço (por exemplo, o formulário de criar e
editar uma tarefa são quase idênticos), extraia esse pedaço para um arquivo à parte
— por convenção, prefixado com `_`:

```blade
{{-- resources/views/tasks/create.blade.php --}}
@extends('layouts.app')
@section('content')
    <form action="{{ route('tasks.store') }}" method="POST">
        @csrf
        @include('tasks._form')
        <button type="submit">Salvar</button>
    </form>
@endsection
```

O arquivo `tasks/_form.blade.php` é incluído tanto em `create.blade.php` quanto em
`edit.blade.php` no projeto prático — assim, o formulário só existe escrito uma vez.

### 6.6 Formulários: `@csrf` e `@method`

HTML só tem `GET` e `POST`. Dois detalhes que **todo** formulário Laravel precisa:

```blade
<form action="{{ route('tasks.update', $task) }}" method="POST">
    @csrf                {{-- token anti-CSRF obrigatório em todo POST --}}
    @method('PUT')       {{-- "finge" que este POST é, na verdade, um PUT --}}
    ...
</form>
```

Esquecer o `@csrf` faz o Laravel recusar a requisição com erro **419** — se você
ver esse erro, é quase sempre isso.

### 6.7 Exibindo erros de validação

```blade
<input type="text" name="title" value="{{ old('title') }}">

@error('title')
    <div class="text-danger">{{ $message }}</div>
@enderror
```

- `old('title')` recupera o valor que o usuário digitou antes de a validação falhar
  (assim ele não perde o que já preencheu).
- `@error('campo')` só exibe o bloco se aquele campo específico tiver erro de validação.

### 6.8 Outras diretivas úteis

```blade
@selected($status === 'pendente')   {{-- imprime selected="selected" se true --}}
@checked($ativo)                     {{-- imprime checked se true --}}
@auth ... @endauth                   {{-- só renderiza se o usuário estiver logado --}}
@php ... @endphp                     {{-- bloco de PHP puro, para lógica pontual --}}
```

---

## 7. Eloquent ORM

### 7.1 O que é um ORM

ORM = **Object-Relational Mapping**. Em vez de escrever SQL na mão e lidar com
arrays associativos, cada tabela do banco vira uma **classe PHP** (um Model), e
cada linha vira um **objeto** dessa classe.

```php
// PHP puro com PDO
$stmt = $pdo->query('SELECT * FROM tasks WHERE status = "pendente"');
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo $tasks[0]['title'];

// Laravel com Eloquent
$tasks = Task::where('status', 'pendente')->get();
echo $tasks[0]->title;
```

Por baixo dos panos o Eloquent ainda gera SQL de verdade — ele só te poupa de
escrevê-lo à mão na maioria dos casos, e já usa **prepared statements**
automaticamente (proteção nativa contra SQL Injection).

### 7.2 Criando um Model

```bash
php artisan make:model Task
```

Por convenção, o Eloquent assume que:

- O Model `Task` corresponde à tabela `tasks` (nome no plural, em snake_case).
- Existe uma coluna `id` como chave primária autoincremental.
- Existem colunas `created_at` e `updated_at` (os "timestamps"), preenchidas
  automaticamente.

Se sua tabela fugir dessas convenções, dá para configurar (`protected $table`,
`protected $primaryKey`, etc.), mas seguir o padrão evita ter que configurar nada.

### 7.3 Mass Assignment e `$fillable`

```php
class Task extends Model
{
    protected $fillable = ['title', 'description', 'status', 'due_date', 'category_id'];
}
```

Isso permite criar registros passando um array direto (o "mass assignment"):

```php
Task::create([
    'title' => 'Estudar Laravel',
    'status' => 'pendente',
]);
```

**Por que isso existe?** Sem o `$fillable`, se você fizer
`Task::create($request->all())` e alguém mandar um campo extra malicioso no
formulário (por exemplo, um `is_admin => true` que só deveria existir em outra
tabela), o Eloquent recusa silenciosamente qualquer campo que não esteja na
lista. É uma camada de segurança contra dados inesperados.

### 7.4 Operações básicas (CRUD)

```php
// CREATE
Task::create(['title' => 'Nova tarefa', 'status' => 'pendente']);

// READ
Task::all();                              // todas as tarefas
Task::find(1);                            // busca por ID (ou null se não achar)
Task::findOrFail(1);                      // busca por ID (ou erro 404 automático)
Task::where('status', 'pendente')->get(); // com filtro
Task::where('status', 'pendente')->first(); // só o primeiro resultado

// UPDATE
$task = Task::find(1);
$task->update(['status' => 'concluida']);

// DELETE
$task = Task::find(1);
$task->delete();
```

### 7.5 Query Builder: encadeando condições

```php
$tasks = Task::where('status', 'pendente')
    ->whereNotNull('due_date')
    ->orderBy('due_date', 'asc')
    ->limit(10)
    ->get();
```

Cada método (`where`, `orderBy`, `limit`...) devolve o próprio "construtor de
query", permitindo encadear vários filtros antes de finalmente chamar `get()`
(que dispara a query real no banco).

### 7.6 `$casts`: convertendo tipos automaticamente

```php
class Task extends Model
{
    protected $casts = [
        'due_date' => 'date',
    ];
}
```

Sem isso, `$task->due_date` seria uma string simples (`"2026-09-15"`). Com o cast,
vira um objeto **Carbon** (a biblioteca de datas do Laravel), permitindo:

```blade
{{ $task->due_date->format('d/m/Y') }}
{{ $task->due_date->diffForHumans() }}  {{-- "em 3 dias" --}}
```

---

## 8. Migrations

### 8.1 Por que não criar as tabelas direto no phpMyAdmin?

Migrations são **arquivos PHP versionados** que descrevem mudanças na estrutura
do banco (criar tabela, adicionar coluna, etc.). A vantagem sobre mexer direto no
banco:

- Todo o time reproduz o **mesmo banco** rodando os mesmos arquivos.
- Você tem histórico de tudo o que mudou na estrutura, versionado no Git junto com o código.
- É possível **desfazer** uma mudança (`rollback`) se algo der errado.

### 8.2 Criando uma migration

```bash
php artisan make:migration create_tasks_table
```

Isso cria um arquivo em `database/migrations/` com um timestamp no nome (para
garantir a ordem de execução) e duas funções: `up()` (aplicar a mudança) e
`down()` (desfazer).

```php
public function up(): void
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->text('description')->nullable();
        $table->string('status')->default('pendente');
        $table->date('due_date')->nullable();
        $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('tasks');
}
```

### 8.3 Tipos de coluna comuns

| Método | Tipo no banco | Uso |
|---|---|---|
| `$table->id()` | BIGINT autoincremento | Chave primária padrão |
| `$table->string('nome')` | VARCHAR(255) | Textos curtos |
| `$table->text('nome')` | TEXT | Textos longos |
| `$table->integer('nome')` | INT | Números inteiros |
| `$table->boolean('nome')` | BOOLEAN | Verdadeiro/falso |
| `$table->date('nome')` | DATE | Só data |
| `$table->dateTime('nome')` | DATETIME | Data e hora |
| `$table->foreignId('nome')` | BIGINT + índice | Chave estrangeira |
| `$table->timestamps()` | `created_at` + `updated_at` | Preenchidos automaticamente |

Modificadores encadeáveis: `->nullable()` (aceita nulo), `->default('valor')`
(valor padrão), `->unique()` (não permite duplicados).

### 8.4 Rodando as migrations

```bash
php artisan migrate              # aplica as migrations pendentes
php artisan migrate:rollback     # desfaz o último lote de migrations
php artisan migrate:fresh        # apaga TODAS as tabelas e roda tudo de novo do zero
php artisan migrate:fresh --seed # o mesmo, e já popula com os Seeders
```

⚠️ `migrate:fresh` apaga todos os dados. Use só em desenvolvimento.

### 8.5 Seeders: populando dados de teste

```bash
php artisan make:seeder CategorySeeder
```

```php
public function run(): void
{
    Category::create(['name' => 'Trabalho']);
    Category::create(['name' => 'Estudos']);
}
```

E então rode com `php artisan db:seed`. O projeto prático já vem com um
`DatabaseSeeder.php` pronto, criando categorias e tarefas de exemplo.

---

## 9. Relacionamentos entre Models

Este é o conceito que conecta tudo no projeto prático: **uma Categoria tem várias
Tarefas**, e **uma Tarefa pertence a uma Categoria**.

### 9.1 `hasMany` (um-para-muitos, lado "um")

```php
// app/Models/Category.php
class Category extends Model
{
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
```

Isso permite:

```php
$category = Category::find(1);
$category->tasks;          // Collection com todas as Tarefas dessa Categoria
$category->tasks()->count(); // contar sem carregar tudo em memória
```

Por convenção, o Eloquent procura na tabela `tasks` uma coluna chamada
`category_id` para fazer essa ligação — exatamente a coluna criada na migration
da seção anterior.

### 9.2 `belongsTo` (o lado "muitos")

```php
// app/Models/Task.php
class Task extends Model
{
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
```

```php
$task = Task::find(1);
$task->category;       // objeto Category (ou null, se category_id for nulo)
$task->category->name; // acessa direto o campo relacionado
```

### 9.3 O problema de N+1 queries (e como o `with()` resolve)

```php
// ❌ Ineficiente: 1 query para buscar tarefas + 1 query POR TAREFA para a categoria
$tasks = Task::all();
foreach ($tasks as $task) {
    echo $task->category->name; // dispara uma query aqui, a cada iteração!
}

// ✅ Eficiente: 2 queries no total, não importa quantas tarefas existam
$tasks = Task::with('category')->get();
foreach ($tasks as $task) {
    echo $task->category->name; // já veio junto, sem query extra
}
```

Isso é exatamente o que `TaskController@index` faz no projeto prático — repare no
`with('category')` lá no código.

### 9.4 Outros tipos de relacionamento (para quando for além do projeto)

- **`belongsToMany`**: muitos-para-muitos (ex.: uma Tarefa com várias Tags, e uma
  Tag usada em várias Tarefas), exige uma tabela intermediária.
- **`hasOne`**: um-para-um (ex.: um Usuário tem um Perfil).

O projeto prático usa só `hasMany`/`belongsTo` de propósito — é o relacionamento
mais comum e a melhor porta de entrada antes de aprender os outros.

---

## 10. Validação de formulários

### 10.1 Validando direto no Controller

```php
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'due_date' => 'nullable|date',
        'status' => 'required|in:pendente,em_andamento,concluida',
        'category_id' => 'nullable|exists:categories,id',
    ]);

    Task::create($validated);

    return redirect()->route('tasks.index');
}
```

Se a validação falhar, o Laravel **automaticamente**:

1. Redireciona de volta para o formulário anterior.
2. Preenche os erros (acessíveis via `@error` no Blade — seção 6.7).
3. Preserva os valores digitados (acessíveis via `old()`).

Você não escreve nenhum `if` para isso — é tudo automático a partir do
`$request->validate()`.

### 10.2 Regras de validação mais usadas

| Regra | O que faz |
|---|---|
| `required` | Campo obrigatório |
| `nullable` | Campo pode ser vazio/nulo (sem isso, `null` falha em outras regras) |
| `string` / `integer` / `numeric` / `boolean` | Tipo esperado |
| `max:255` / `min:3` | Tamanho máximo/mínimo (string) ou valor máximo/mínimo (número) |
| `email` | Formato de e-mail válido |
| `date` | Data válida |
| `in:a,b,c` | Precisa ser um destes valores exatos |
| `exists:tabela,coluna` | Precisa existir na tabela (ex.: `category_id` real) |
| `unique:tabela,coluna` | Não pode já existir (ex.: e-mail único) |
| `confirmed` | Exige um campo `_confirmation` igual (ex.: confirmação de senha) |

Regras se combinam com `|`: `'email' => 'required|email|unique:users,email'`.

### 10.3 Form Requests (para validações mais complexas)

Quando a validação de um formulário cresce muito, extraia-a para uma classe própria:

```bash
php artisan make:request StoreTaskRequest
```

```php
class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ou uma checagem de permissão
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
        ];
    }
}
```

```php
public function store(StoreTaskRequest $request): RedirectResponse
{
    // Já chega aqui validado! Se algo estivesse errado, o Laravel
    // já teria redirecionado de volta antes mesmo do método rodar.
    Task::create($request->validated());
    return redirect()->route('tasks.index');
}
```

O projeto prático usa validação direta no Controller (mais simples de acompanhar
para quem está aprendendo). Form Requests são o passo natural de evolução quando as
regras crescerem ou se repetirem entre vários métodos.

---

## 11. Middleware

### 11.1 O que é

Middleware é uma camada que intercepta a requisição **antes** dela chegar ao
Controller (e/ou a resposta antes dela voltar ao navegador). É o lugar certo para
regras como "só usuários logados podem acessar" ou "limitar quantas requisições por
minuto".

```
Requisição → Middleware 1 → Middleware 2 → Controller → Resposta
```

### 11.2 Exemplo prático: exigir login

```php
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware('auth');
```

Se o usuário não estiver logado, o middleware `auth` intercepta e redireciona para
a tela de login — o código dentro do `Route::get` nem chega a rodar.

### 11.3 Aplicando a um grupo de rotas

```php
Route::middleware('auth')->group(function () {
    Route::resource('tasks', TaskController::class);
    Route::resource('categories', CategoryController::class);
});
```

### 11.4 Criando seu próprio middleware

```bash
php artisan make:middleware CheckIsAdmin
```

```php
public function handle(Request $request, Closure $next): Response
{
    if (! $request->user()?->is_admin) {
        abort(403);
    }

    return $next($request); // deixa a requisição continuar
}
```

Depois, registre-o em `bootstrap/app.php` (lembrando: desde o Laravel 11, é aqui
que fica essa configuração, não mais em `Kernel.php`).

> O projeto prático deste guia não usa autenticação para manter o foco no CRUD e
> nos relacionamentos — veja a seção 15 para como adicionar login com Laravel
> Breeze como próximo passo.

---

## 12. Cheat sheet: comandos Artisan

```bash
# Servidor e informações
php artisan serve                    # sobe servidor local
php artisan route:list               # lista todas as rotas registradas
php artisan about                    # informações gerais do projeto

# Geração de código
php artisan make:model Nome                     # cria um Model
php artisan make:model Nome -mfc                # Model + Migration + Factory + Controller
php artisan make:controller NomeController --resource  # Controller com os 7 métodos
php artisan make:migration create_nomes_table   # cria uma Migration
php artisan make:seeder NomeSeeder              # cria um Seeder
php artisan make:request NomeRequest            # cria um Form Request
php artisan make:middleware NomeMiddleware      # cria um Middleware

# Banco de dados
php artisan migrate                  # aplica migrations pendentes
php artisan migrate:rollback         # desfaz o último lote
php artisan migrate:fresh            # apaga tudo e recria (⚠️ perde dados)
php artisan migrate:fresh --seed     # o mesmo, populando com Seeders
php artisan db:seed                  # roda os Seeders sem mexer nas tabelas

# Cache e otimização (úteis quando algo "não atualiza")
php artisan config:clear
php artisan cache:clear
php artisan view:clear               # limpa o cache de views Blade compiladas
php artisan optimize:clear           # limpa tudo de uma vez

# Tinker: um "console interativo" do seu projeto
php artisan tinker
>>> Task::count()
>>> Task::first()
```

`php artisan tinker` merece destaque: ele abre um terminal PHP interativo já
carregado com todo o seu projeto, ótimo para testar uma query do Eloquent
rapidamente sem precisar criar uma rota só para isso.

---

## 13. Boas práticas e segurança

### 13.1 Segurança que o Laravel já dá "de graça" (não jogue fora)

| Proteção | Como o Laravel resolve | O que você precisa fazer |
|---|---|---|
| SQL Injection | Eloquent/Query Builder usam prepared statements | Evitar `DB::raw()` com dados do usuário sem tratar |
| XSS | `{{ }}` no Blade escapa HTML automaticamente | Não usar `{!! !!}` com dados do usuário |
| CSRF | Token gerado e validado automaticamente | Sempre incluir `@csrf` nos formulários |
| Mass Assignment | Só campos em `$fillable` são aceitos em massa | Nunca colocar campos sensíveis (`is_admin`, `role`) no `$fillable` |

### 13.2 Convenções de nomenclatura

Seguir as convenções do Laravel evita ter que configurar tudo manualmente:

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabela | plural, snake_case | `tasks`, `categories` |
| Model | singular, PascalCase | `Task`, `Category` |
| Controller | singular + sufixo, PascalCase | `TaskController` |
| Chave estrangeira | singular_id | `category_id` |
| Rota nomeada | plural.ação | `tasks.index`, `tasks.store` |

### 13.3 Onde colocar cada tipo de lógica

- **Controller**: recebe requisição, chama o Model, escolhe a View/redirecionamento. Deve ser curto.
- **Model**: regras sobre os dados (relacionamentos, `$casts`, `$fillable`), e opcionalmente métodos de consulta reutilizáveis (ex.: um "scope").
- **Blade**: só apresentação. Evite lógica de negócio complexa dentro de `@if`/`@php` nas views — se precisar de muita lógica, calcule antes no Controller e passe o resultado já pronto.

### 13.4 Erros comuns de quem está começando

- **Esquecer `@csrf`** → erro 419 no formulário.
- **Esquecer `$fillable`** → erro "MassAssignmentException" ao chamar `Model::create()`.
- **Migration da tabela filha antes da tabela pai** → erro de chave estrangeira ao rodar `migrate` (por isso a migration de `tasks` tem um timestamp depois da de `categories` no projeto prático).
- **Alterar uma view e "nada muda"** → geralmente é cache; rode `php artisan view:clear`.
- **Nome de rota errado em `route('nome.errado')`** → erro claro do tipo "Route [nome.errado] not defined"; rode `php artisan route:list` para conferir os nomes exatos.

---

## 14. Tour pelo projeto prático: Gerenciador de Tarefas

O projeto que acompanha este guia (pasta `gerenciador-de-tarefas/`, ou o arquivo
`gerenciador-de-tarefas-laravel.zip`) implementa um CRUD completo de **Tarefas** e
**Categorias**, com o relacionamento `hasMany`/`belongsTo` entre elas. A ideia é que,
depois de ler cada seção acima, você reconheça o conceito aplicado aqui.

### 14.1 O modelo de dados

```
Category (categoria)              Task (tarefa)
├── id                            ├── id
├── name                          ├── title
├── description                   ├── description
└── timestamps                    ├── status  (pendente | em_andamento | concluida)
                                   ├── due_date
      1 ────────────< N           ├── category_id  → aponta para Category.id
                                   └── timestamps
```

### 14.2 Ordem sugerida de leitura do código

1. **`database/migrations/`** — comece aqui para entender a estrutura das tabelas.
   Repare que a migration de `categories` tem um timestamp anterior à de `tasks`
   (seção 8), já que `tasks.category_id` depende de `categories` já existir.

2. **`app/Models/Category.php` e `app/Models/Task.php`** — o relacionamento
   `hasMany`/`belongsTo` (seção 9) e o `$fillable` de cada um (seção 7.3).

3. **`routes/web.php`** — apenas duas linhas de `Route::resource` (seção 4.5) geram
   as 14 rotas do sistema (7 para tarefas + 7 para categorias). Rode
   `php artisan route:list` depois de instalar o projeto para conferir todas.

4. **`app/Http/Controllers/TaskController.php`** — preste atenção especial ao
   método `index()`: ele usa `with('category')` para evitar o problema de N+1
   queries (seção 9.3), e um `when()` para aplicar o filtro por status só quando
   ele existir na URL (`?status=pendente`).

5. **`app/Http/Controllers/CategoryController.php`** — o método `show()` busca
   todas as tarefas daquela categoria via `$category->tasks()`, demonstrando o
   relacionamento no sentido inverso.

6. **`resources/views/layouts/app.blade.php`** — o layout único usado por todas as
   páginas (seção 6.4), com Bootstrap via CDN só para ficar visualmente
   apresentável sem precisar configurar nenhuma ferramenta de build de CSS.

7. **`resources/views/tasks/_form.blade.php`** — o formulário compartilhado entre
   criar e editar tarefas (seção 6.5), incluindo exibição de erros (`@error`) e
   preservação de valores digitados (`old()`).

### 14.3 O que intencionalmente foi deixado de fora

Para manter o projeto **simples e focado** nos fundamentos deste guia, ficaram de
fora de propósito:

- Autenticação (login/cadastro de usuários)
- Paginação (a listagem usa `->get()`, trazendo tudo de uma vez)
- Testes automatizados
- API JSON

Todos esses pontos aparecem como sugestão de evolução na próxima seção — e
também estão listados no `README.md` que acompanha o projeto.

---

## 15. Próximos passos

### 15.1 Evoluções diretas do projeto (praticar o que já foi visto)

- Trocar `->get()` por `->paginate(10)` em `TaskController@index` e ajustar a
  view para exibir os links de paginação (`{{ $tasks->links() }}`).
- Adicionar um campo `priority` (baixa/média/alta) seguindo exatamente o mesmo
  padrão usado para `status`.
- Ordenar a listagem de tarefas por prioridade e depois por data de vencimento.

### 15.2 Autenticação

Para adicionar login/cadastro sem escrever tudo do zero, o Laravel oferece
**starter kits** oficiais como o [Laravel Breeze](https://laravel.com/docs/starter-kits).
Depois de instalado, o próximo exercício natural é: adicionar uma coluna
`user_id` em `tasks`, e filtrar `TaskController@index` para que cada pessoa
veja só as suas próprias tarefas (`Auth::user()->tasks`).

### 15.3 Testes automatizados

Laravel já vem com [Pest](https://pestphp.com) ou PHPUnit configurado. Um bom
primeiro teste para este projeto: garantir que criar uma tarefa sem `title`
retorna erro de validação, e que criar uma tarefa válida realmente aparece no
banco.

### 15.4 Transformando em API

Os mesmos Models e a mesma lógica de negócio podem alimentar uma API JSON usando
**Eloquent API Resources** (`php artisan make:resource TaskResource`), retornando
`TaskResource::collection($tasks)` em vez de uma view Blade — útil se um dia você
quiser um app mobile ou front-end separado (Vue/React) consumindo os mesmos dados.

### 15.5 Onde continuar estudando

- **[Documentação oficial](https://laravel.com/docs)** — a melhor referência,
  sempre atualizada, com exemplos para cada conceito deste guia em muito mais
  profundidade.
- **[Laravel Bootcamp](https://bootcamp.laravel.com)** — tutorial oficial gratuito
  construindo uma aplicação do zero, ótimo depois deste guia.
- **[Laracasts](https://laracasts.com)** — cursos em vídeo (parte gratuita, parte
  paga) considerados referência na comunidade Laravel.
- **[Laravel News](https://laravel-news.com)** — para acompanhar novidades de
  cada versão nova do framework.

---

## Resumo de uma página

Se precisar relembrar tudo rapidamente antes de codar:

1. **Rota** (`routes/web.php`) decide qual Controller/método atende cada URL.
2. **Controller** recebe a requisição, valida dados, conversa com o **Model**.
3. **Model** (Eloquent) representa uma tabela; relacionamentos (`hasMany`/`belongsTo`)
   conectam Models entre si.
4. **Migration** versiona a estrutura das tabelas no banco.
5. **View** (Blade) recebe dados do Controller e vira HTML.
6. `Route::resource` + Controller com os 7 métodos padrão = CRUD completo em
   poucas linhas.
7. `$fillable`, `@csrf` e `{{ }}` são suas três proteções de segurança "de
   fábrica" — nunca as remova sem um bom motivo.

Bons estudos! 🚀
