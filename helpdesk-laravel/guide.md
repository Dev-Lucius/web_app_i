# 🎫 Guia: Projeto Helpdesk de Tickets

> Este guia é uma **continuação** do Guia Completo de Laravel. Ele não repete o que já
> foi explicado lá (rotas, Blade, migrations básicas, CRUD simples) — foca só nos
> conceitos **novos** que este projeto introduz. Se algum termo aqui não soar familiar,
> vale revisar o guia anterior primeiro.

## O que este projeto tem de novo

| Conceito | Onde aparece |
|---|---|
| Autenticação implementada na mão (sem pacote pronto) | `AuthController` |
| Dois relacionamentos diferentes entre os mesmos dois Models | `User` ↔ `Ticket` |
| Relacionamento N:M (`belongsToMany`) com tabela pivô | `Ticket` ↔ `Tag` |
| Recurso aninhado (rotas dentro de rotas) | `comments` dentro de `tickets` |
| Autorização simples por papel de usuário | `abort_unless` nos Controllers |

## Sumário

1. [Visão geral e modelagem do banco de dados](#1-visão-geral-e-modelagem-do-banco-de-dados)
2. [Autenticação do zero](#2-autenticação-do-zero)
3. [Dois relacionamentos para o mesmo Model](#3-dois-relacionamentos-para-o-mesmo-model)
4. [Relacionamento N:M com Tags](#4-relacionamento-nm-com-tags)
5. [Comentários: um recurso aninhado](#5-comentários-um-recurso-aninhado)
6. [Autorização simples por papel](#6-autorização-simples-por-papel)
7. [Tour pelo código do projeto](#7-tour-pelo-código-do-projeto)
8. [Passo a passo de instalação](#8-passo-a-passo-de-instalação)
9. [Próximos passos](#9-próximos-passos)

---

## 1. Visão geral e modelagem do banco de dados

Um Helpdesk tem uma regra de negócio central: **alguém abre um chamado** (o
solicitante) e, eventualmente, **alguém mais resolve** (o agente). Já são dois papéis
diferentes de usuário conversando com a mesma tabela de tickets — esse é o desafio
central deste projeto.

### As tabelas (5 principais + 1 pivô)

```
users (nativa do Laravel + coluna "role")
├── id, name, email, password, role ('cliente' | 'agente')

categories
├── id, name, description

tickets
├── id, title, description, status, priority
├── user_id        → users.id   (quem ABRIU o chamado)
├── assigned_to     → users.id   (agente RESPONSÁVEL, pode ser nulo)
└── category_id     → categories.id (pode ser nulo)

comments
├── id, body
├── ticket_id  → tickets.id
└── user_id    → users.id

tags
├── id, name

tag_ticket  (tabela pivô — o relacionamento N:M)
├── ticket_id → tickets.id
└── tag_id    → tags.id
```

### Diagrama de relacionamentos

```
                    ┌──────────┐
        abriu ──────│  users   │────── responsável por
       (1:N)         └──────────┘         (1:N)
          │                                    │
          ▼                                    ▼
     ┌─────────────────────────────────────────────┐
     │                   tickets                    │──────< comments
     └─────────────────────────────────────────────┘
                     │           ▲
             (N:1)   │           │  (N:M via tag_ticket)
                      ▼           │
                 categories      tags
```

Note que `tickets` se conecta com `users` de **duas formas diferentes** (quem abriu
e quem é o agente) — isso é o assunto da seção 3.

---

## 2. Autenticação do zero

No guia anterior, mencionei o **Laravel Breeze** como forma rápida de adicionar
login/cadastro. Aqui, de propósito, construímos a autenticação **na mão**, com menos
de 70 linhas de código, para você entender o que o Breeze faz por baixo dos panos.

### 2.1 As três peças fundamentais

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

// 1. Transformar uma senha em hash antes de salvar (NUNCA salve senha em texto puro)
$hash = Hash::make('minhasenha123');

// 2. Tentar autenticar: compara o e-mail/senha com o banco
if (Auth::attempt(['email' => $email, 'password' => $senha])) {
    // credenciais corretas! o usuário já está "logado" na sessão
}

// 3. Saber quem está logado em qualquer parte do código
Auth::user();       // objeto User, ou null se ninguém estiver logado
Auth::id();          // só o ID
auth()->user();      // mesma coisa, via helper global
$request->user();    // mesma coisa, a partir de uma Request
```

`Hash::make()` usa bcrypt por padrão — mesmo que dois usuários tenham a senha
`"123456"`, o hash salvo no banco será diferente para cada um (graças a um "salt"
aleatório embutido). `Auth::attempt()` sabe comparar a senha digitada com esse hash
sem que você precise entender o algoritmo por trás.

### 2.2 Registro (`AuthController@register`)

```php
public function register(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
        'role' => 'required|in:cliente,agente',
    ]);

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
        'role' => $validated['role'],
    ]);

    Auth::login($user);
    $request->session()->regenerate();

    return redirect()->route('tickets.index');
}
```

Repare na regra `'password' => 'required|string|min:8|confirmed'`. A regra
`confirmed` exige que exista **outro** campo no formulário chamado
`password_confirmation` com o mesmo valor — é assim que o Laravel valida o clássico
"confirme sua senha" sem você escrever nenhum `if`.

> ⚠️ Numa aplicação real, você não deixaria a pessoa **escolher** ser "agente" ao se
> cadastrar — contas de agente normalmente são criadas por um administrador. Aqui
> permitimos isso de propósito, só para facilitar testar os dois papéis.

### 2.3 Login (`AuthController@login`)

```php
public function login(Request $request): RedirectResponse
{
    $credentials = $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    if (! Auth::attempt($credentials, $request->boolean('remember'))) {
        return back()->withErrors(['email' => 'E-mail ou senha inválidos.']);
    }

    $request->session()->regenerate();

    return redirect()->intended(route('tickets.index'));
}
```

`redirect()->intended(...)` é um detalhe elegante: se o usuário tentou acessar uma
página protegida antes de estar logado (foi redirecionado para o login), o Laravel
lembra qual era essa página e manda ele de volta para lá após logar — em vez de
sempre cair na mesma página padrão.

### 2.4 Por que `$request->session()->regenerate()`?

Todo login/logout deveria trocar o **identificador da sessão**. Isso evita um ataque
chamado *session fixation*, onde alguém tenta forçar a vítima a usar um ID de sessão
já conhecido pelo atacante antes do login — se o ID mudasse depois do login, esse
ataque perderia o efeito. É só uma linha, mas é importante.

### 2.5 Os middlewares `auth` e `guest`

```php
Route::middleware('guest')->group(function () {
    // só quem NÃO está logado acessa (login, registro)
});

Route::middleware('auth')->group(function () {
    // só quem ESTÁ logado acessa (tickets, comentários)
});
```

Esses dois middlewares já vêm prontos em qualquer instalação nova do Laravel — não
precisamos do Breeze nem de nenhum pacote extra para eles funcionarem. O middleware
`auth`, por padrão, redireciona quem não está logado para a rota **chamada
`login`** — por isso é importante que sua rota de login realmente se chame assim
(`->name('login')`), senão o Laravel não sabe para onde mandar o usuário.

---

## 3. Dois relacionamentos para o mesmo Model

No projeto anterior, `Task belongsTo Category` era simples: uma chave estrangeira,
um relacionamento. Aqui, `Ticket` se conecta com `User` de **duas formas**
diferentes ao mesmo tempo:

- Quem **abriu** o chamado (`user_id`)
- Quem é o **agente responsável** (`assigned_to`)

### 3.1 O problema, se você não fizer nada de diferente

Por convenção, o Eloquent assume que um relacionamento `belongsTo(User::class)`
procura uma coluna chamada `user_id`. Isso funciona perfeitamente para o
relacionamento "quem abriu". Mas e para "quem é o agente"? A coluna se chama
`assigned_to`, não `user_id` — a convenção sozinha não dá conta.

### 3.2 A solução: nomear o relacionamento e informar a chave manualmente

```php
// app/Models/Ticket.php

// Segue a convenção padrão (procura "user_id" automaticamente)
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

// Foge da convenção: precisamos avisar qual coluna usar
public function assignee(): BelongsTo
{
    return $this->belongsTo(User::class, 'assigned_to');
}
```

O segundo argumento de `belongsTo()` é justamente para isso: dizer "não procure
`user_id`, procure `assigned_to`". Na prática, você usa assim:

```php
$ticket->user;      // quem abriu (User)
$ticket->assignee;  // agente responsável (User ou null)
```

### 3.3 O caminho inverso: de User para Ticket

No `User`, também precisamos de dois relacionamentos `hasMany`, cada um olhando
para uma coluna diferente em `tickets`:

```php
// app/Models/User.php

public function tickets(): HasMany
{
    return $this->hasMany(Ticket::class); // por padrão, procura "user_id" em tickets
}

public function assignedTickets(): HasMany
{
    return $this->hasMany(Ticket::class, 'assigned_to'); // aqui, força "assigned_to"
}
```

```php
$user->tickets;          // tickets que ELE abriu
$user->assignedTickets;  // tickets ATRIBUÍDOS a ele como agente
```

**A regra geral**: sempre que uma coluna de chave estrangeira não seguir o padrão
`nome_do_model_id`, informe explicitamente qual coluna usar como segundo argumento
de `belongsTo()`/`hasMany()`. É a mesma lógica que já vimos com `category_id` no
projeto anterior — só que agora usada duas vezes para o mesmo par de tabelas.

---

## 4. Relacionamento N:M com Tags

### 4.1 Por que não basta um `category_id` aqui?

Uma categoria pertence a um único ticket-tipo (Hardware OU Software). Já uma tag é
diferente: um ticket pode ter **várias** tags (`impressora`, `urgente`), e uma tag
como `urgente` pode estar em **vários** tickets diferentes. Isso é uma relação
**muitos para muitos**, e uma única coluna de chave estrangeira não é suficiente
para representá-la — é preciso uma **tabela extra no meio**.

### 4.2 A tabela pivô

```php
// migration: create_tag_ticket_table
Schema::create('tag_ticket', function (Blueprint $table) {
    $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
    $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
    $table->primary(['ticket_id', 'tag_id']);
});
```

Essa tabela **não tem Model próprio** nem aparece como uma "coisa" no seu sistema —
ela só guarda pares `(ticket_id, tag_id)`, um por linha, representando "esta tag
está ligada a este ticket". Por isso o enunciado do exercício pede para não contá-la
entre as tabelas principais: ela é *infraestrutura* do relacionamento, não uma
entidade do domínio.

> 💡 O nome `tag_ticket` não é acidental: é a convenção do Eloquent — os dois nomes
> de Model, em minúsculo e singular, unidos por `_`, em **ordem alfabética**
> (`tag` vem antes de `ticket`). Seguindo essa convenção, o Eloquent acha a tabela
> pivô sozinho, sem precisar configurar nada extra.

### 4.3 Declarando o relacionamento nos Models

```php
// app/Models/Ticket.php
public function tags(): BelongsToMany
{
    return $this->belongsToMany(Tag::class);
}

// app/Models/Tag.php
public function tickets(): BelongsToMany
{
    return $this->belongsToMany(Ticket::class);
}
```

Repare que `belongsToMany` é declarado **nos dois lados** — diferente do
`hasMany`/`belongsTo`, onde cada lado usa um método diferente. Em uma relação N:M,
ambos os lados "pertencem a vários" um do outro.

### 4.4 Manipulando a relação: `attach`, `detach` e `sync`

```php
$ticket->tags()->attach($tag->id);      // adiciona uma tag (sem remover as outras)
$ticket->tags()->detach($tag->id);      // remove uma tag específica
$ticket->tags()->sync([1, 2, 3]);       // GARANTE que só essas 3 fiquem ligadas
                                          // (adiciona o que falta, remove o que sobra)
```

`sync()` é o mais usado na prática, porque corresponde exatamente ao que um
formulário de edição faz: "a partir de agora, estas são as tags deste ticket" —
sem você ter que calcular manualmente quais adicionar e quais remover.

### 4.5 Criando tags "on the fly" a partir de um campo de texto

Em vez de forçar o usuário a escolher tags de uma lista pré-cadastrada, o projeto
aceita um campo de texto livre (`"impressora, urgente"`), transforma cada palavra
em uma Tag de verdade (criando as que ainda não existem) e sincroniza:

```php
private function syncTags(Ticket $ticket, string $tagsInput): void
{
    $tagIds = collect(explode(',', $tagsInput))
        ->map(fn ($name) => trim($name))         // remove espaços em volta
        ->filter()                                // descarta strings vazias
        ->map(fn ($name) => Tag::firstOrCreate(['name' => $name])->id)
        ->all();

    $ticket->tags()->sync($tagIds);
}
```

`Tag::firstOrCreate(['name' => $name])` é um atalho que faz duas coisas em uma
chamada: busca uma Tag com aquele nome; se não achar, cria. Isso evita duplicar
tags e evita ter que escrever o `if` manualmente.

---

## 5. Comentários: um recurso aninhado

### 5.1 O que muda em relação a um resource route "normal"

Uma Categoria ou uma Tarefa fazem sentido sozinhas na URL: `/tasks/3`. Já um
**comentário** só faz sentido dentro do contexto de um ticket específico — por
isso, a URL correta é `/tickets/5/comments`, não `/comments` isolado.

```php
Route::post('tickets/{ticket}/comments', [CommentController::class, 'store'])
    ->name('comments.store');

Route::delete('tickets/{ticket}/comments/{comment}', [CommentController::class, 'destroy'])
    ->name('comments.destroy');
```

### 5.2 Recebendo os dois parâmetros no Controller

```php
public function store(Request $request, Ticket $ticket): RedirectResponse
{
    // $ticket já vem resolvido automaticamente a partir do {ticket} na URL
    $ticket->comments()->create([
        'body' => $request->validate(['body' => 'required|string'])['body'],
        'user_id' => $request->user()->id,
    ]);

    return redirect()->route('tickets.show', $ticket);
}

public function destroy(Request $request, Ticket $ticket, Comment $comment): RedirectResponse
{
    // Route Model Binding funciona para os DOIS parâmetros da URL ao mesmo tempo
    $comment->delete();

    return redirect()->route('tickets.show', $ticket);
}
```

Note `$ticket->comments()->create([...])` em vez de `Comment::create([...])`: como
já temos o `$ticket` em mãos e ele tem o relacionamento `comments()`, o Eloquent
já preenche o `ticket_id` sozinho — uma linha a menos para escrever (e uma forma a
menos de errar o ID).

> ⚠️ **Simplificação assumida neste projeto**: o código não verifica se o
> `{comment}` da URL realmente pertence ao `{ticket}` da mesma URL — tecnicamente,
> alguém poderia montar uma URL misturando o ID de um ticket com o ID de um
> comentário de outro ticket. Para um projeto de estudo isso não chega a ser
> perigoso (o pior caso é um erro de exibição), mas numa aplicação real você
> resolveria isso com **binding aninhado/escopado**
> (`Route::resource(...)->scoped()` ou uma verificação extra no Controller).

---

## 6. Autorização simples por papel

### 6.1 A regra de negócio

- **Cliente**: só vê e comenta os próprios chamados.
- **Agente**: vê todos os chamados, pode editar status/prioridade/categoria/agente
  responsável de qualquer um.

### 6.2 Implementação sem Policies (a versão simples)

```php
// TicketController@edit
public function edit(Request $request, Ticket $ticket): View
{
    abort_unless($request->user()->isAgente(), 403, 'Só agentes podem editar chamados.');
    // ...
}
```

`abort_unless($condicao, $codigo, $mensagem)` é um atalho para
`if (!$condicao) { abort($codigo, $mensagem); }`. Se a condição for falsa, a
requisição para imediatamente com um erro HTTP 403 (Acesso Proibido) — nada do
resto do método roda.

Isso é reforçado também na *view*, escondendo o botão "Editar" de quem não é
agente (seção 7 mostra o trecho de `tickets/show.blade.php`):

```blade
@if (auth()->user()->isAgente())
    <a href="{{ route('tickets.edit', $ticket) }}" class="btn btn-outline-secondary">Editar</a>
@endif
```

⚠️ **Importante**: esconder o botão na view é só uma questão de UX (evitar
confundir o usuário com um botão que não vai funcionar). A proteção **de verdade**
é sempre a checagem no Controller — nunca confie só em esconder um botão, já que
alguém pode digitar a URL diretamente.

### 6.3 O caminho "certo" para quando isso crescer: Policies

Esse `abort_unless` espalhado pelos métodos funciona bem para poucas regras, mas
não escala: se amanhã você tiver 5 regras de autorização diferentes, o Controller
vira uma bagunça. O Laravel tem uma ferramenta dedicada para isso — **Policies**:

```bash
php artisan make:policy TicketPolicy --model=Ticket
```

```php
class TicketPolicy
{
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->isAgente();
    }

    public function view(User $user, Ticket $ticket): bool
    {
        return $user->isAgente() || $ticket->user_id === $user->id;
    }
}
```

```php
// No Controller, vira só uma linha:
$this->authorize('update', $ticket);
```

Isso é sugerido como exercício de evolução na seção 9 — o projeto atual usa a
versão simples de propósito, para não introduzir dois conceitos novos (Policies e
tudo mais) na mesma leitura.

---

## 7. Tour pelo código do projeto

Ordem sugerida de leitura:

1. **`database/migrations/`** — leia na ordem dos timestamps. Repare que
   `add_role_to_users_table` vem antes de `create_tickets_table` (porque tickets
   referencia usuários), e `create_tag_ticket_table` vem por último (depende de
   `tags` e `tickets` já existirem).

2. **`app/Models/User.php`** — a coluna `role`, o método auxiliar `isAgente()`
   (evita espalhar `$user->role === 'agente'` por todo o código), e os dois
   relacionamentos `tickets()`/`assignedTickets()` (seção 3).

3. **`app/Models/Ticket.php`** — `user()`/`assignee()` (seção 3), `tags()` (seção 4)
   e `comments()` (repare no `->latest()` encadeado — isso já ordena os comentários
   do mais novo para o mais antigo sempre que você acessar `$ticket->comments`).

4. **`app/Http/Controllers/AuthController.php`** — a autenticação (seção 2).

5. **`routes/web.php`** — os grupos `guest`/`auth` (seção 2.5) e a rota aninhada de
   comentários (seção 5).

6. **`app/Http/Controllers/TicketController.php`** — o método `index()` já mostra a
   filtragem por papel (`when(! $user->isAgente(), ...)`); o método privado
   `syncTags()` no fim do arquivo é o código da seção 4.5.

7. **`app/Http/Controllers/CommentController.php`** — o recurso aninhado (seção 5)
   e a checagem de autorização repetida (mesma regra do `TicketController@show`).

8. **`resources/views/tickets/show.blade.php`** — reúne quase tudo: tags exibidas
   como badges, lista de comentários, formulário de novo comentário, e o botão de
   editar condicional ao papel do usuário.

---

## 8. Passo a passo de instalação

(Resumo — o `README.md` incluído no projeto tem a versão completa e comentada.)

```bash
# 1. Criar o projeto Laravel
composer create-project laravel/laravel helpdesk-tickets
cd helpdesk-tickets

# 2. Copiar os arquivos deste pacote para dentro do projeto,
#    sobrescrevendo app/Models/User.php, routes/web.php e o DatabaseSeeder.

# 3. Configurar SQLite no .env (DB_CONNECTION=sqlite) e criar o arquivo do banco
touch database/database.sqlite

# 4. Rodar as migrations
php artisan migrate

# 5. Popular com dados de exemplo (cria as contas de teste)
php artisan db:seed

# 6. Subir o servidor
php artisan serve
```

Contas de teste criadas pelo seeder:

| Papel | E-mail | Senha |
|---|---|---|
| Agente | `agente@helpdesk.test` | `password` |
| Cliente | `cliente@helpdesk.test` | `password` |

---

## 9. Próximos passos

### 9.1 Evoluções diretas (praticar o que já foi visto)

- Recriar um `CategoryController` completo (CRUD), repetindo o padrão do
  Gerenciador de Tarefas — ótimo exercício de fixação.
- Adicionar uma página "minhas tags" listando todas as tags existentes e quantos
  tickets cada uma tem (`Tag::withCount('tickets')->get()`).
- Permitir que o cliente edite o próprio ticket **enquanto o status for "aberto"**
  (uma regra condicional a mais no `abort_unless`).

### 9.2 Migrar a autorização para Policies

Como comentado na seção 6.3 — o momento certo é quando você perceber regras de
autorização se repetindo em mais de um Controller (`TicketController` e
`CommentController` já compartilham uma checagem parecida hoje).

### 9.3 Notificações

Quando um agente muda o status de um ticket para "resolvido", envie um e-mail para
quem abriu o chamado usando o sistema de
[Notifications](https://laravel.com/docs/notifications) do Laravel:

```bash
php artisan make:notification TicketResolvedNotification
```

### 9.4 Filas (Queues)

Enviar e-mail durante a própria requisição deixa a resposta mais lenta para quem
está esperando na tela. O próximo passo natural é jogar esse envio para uma
**fila** (`ShouldQueue`), processada em segundo plano — o mesmo padrão usado por
aplicações Laravel em produção para qualquer tarefa demorada (e-mails, geração de
relatórios, chamadas a APIs externas).

### 9.5 Transformando em API + Sanctum

Se um dia você quiser um app mobile consumindo o mesmo Helpdesk, o
[Laravel Sanctum](https://laravel.com/docs/sanctum) é o pacote oficial para
autenticação de APIs (tokens, em vez de sessão de navegador) — o próximo passo
depois de já dominar autenticação baseada em sessão, como fizemos aqui.

Bons estudos! 🎫
