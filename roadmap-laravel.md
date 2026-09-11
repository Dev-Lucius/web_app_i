# 🚀 Roadmap de Estudos — Laravel

> **Versão:** Laravel 11+  
> **Duração estimada:** 8–12 semanas (estudando 1–2h por dia)  
> **Pré-requisitos:** PHP 8.1+, HTML/CSS básico, SQL/MySQL, lógica de programação

---

## 📍 FASE 1: Fundamentos (Semanas 1–2)

### 1.1 Pré-requisitos de PHP
Antes de tocar no Laravel, você precisa dominar:

| Tópico | O que estudar |
|--------|--------------|
| **Composer** | Instalação, `composer require`, `autoload`, `vendor/` |
| **Namespaces** | `namespace App\Models;`, `use App\Models\User;` |
| **POO** | Classes, herança, interfaces, traits, `public/private/protected` |
| **Arrays & Strings modernos** | `array_map`, `array_filter`, arrow functions `fn()` |
| **Tipagem** | `string`, `int`, `array`, `?string` (nullable), `mixed` |
| **Closures & Callbacks** | Funções anônimas, `call_user_func` |

**🔗 Recursos:**
- [PHP: The Right Way](https://phptherightway.com/)
- [Composer Docs](https://getcomposer.org/doc/)

---

### 1.2 Ambiente de Desenvolvimento

```bash
# Opção 1: Laravel Herd (recomendado para Windows/Mac)
https://herd.laravel.com

# Opção 2: Laravel Sail (Docker)
curl -s https://laravel.build/meuprojeto | bash

# Opção 3: Instalação manual via Composer
composer create-project laravel/laravel meuprojeto
cd meuprojeto
php artisan serve
```

**O que configurar:**
- [ ] PHP 8.2+ instalado
- [ ] Composer instalado
- [ ] Node.js + NPM (para Vite/frontend)
- [ ] MySQL/PostgreSQL ou SQLite
- [ ] VS Code com extensões: **Laravel Extension Pack**, **PHP Intelephense**

---

### 1.3 Estrutura do Projeto Laravel

```
meuprojeto/
├── app/
│   ├── Console/          # Comandos Artisan customizados
│   ├── Exceptions/       # Tratamento de exceções
│   ├── Http/
│   │   ├── Controllers/  # Lógica das requisições
│   │   └── Middleware/   # Filtros de requisição
│   ├── Models/           # Eloquent ORM
│   └── Providers/        # Service Providers
├── bootstrap/            # Inicialização da aplicação
├── config/               # Arquivos de configuração
├── database/
│   ├── factories/        # Fábricas de dados fake
│   ├── migrations/       # Versionamento do schema
│   └── seeders/          # Dados iniciais
├── public/               # Ponto de entrada (index.php)
├── resources/
│   ├── css/              # Tailwind/estilos
│   ├── js/               # Alpine.js/Vue/React
│   └── views/            # Blade templates
├── routes/
│   ├── web.php           # Rotas web
│   └── api.php           # Rotas de API
├── storage/              # Logs, cache, uploads
└── tests/                # Testes PHPUnit/Pest
```

**Pontos-chave:**
- Toda lógica fica em `app/`
- Rotas definem o que a URL faz
- Controllers recebem a requisição e devolvem a resposta
- Models falam com o banco (Eloquent)
- Views usam Blade (sintaxe limpa tipo `{{ $variavel }}`)

---

## 📍 FASE 2: Rotas, Controllers e Views (Semanas 3–4)

### 2.1 Rotas

```php
// routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProdutoController;

// Rota com closure
Route::get('/', function () {
    return view('welcome');
});

// Rota com Controller
Route::get('/produtos', [ProdutoController::class, 'index']);

// Rota com parâmetro
Route::get('/produtos/{id}', [ProdutoController::class, 'show']);

// Rota nomeada
Route::get('/produtos', [ProdutoController::class, 'index'])->name('produtos.index');

// Grupo de rotas com middleware
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/perfil', [PerfilController::class, 'edit']);
});

// Resource (gera 7 rotas RESTful automaticamente)
Route::resource('produtos', ProdutoController::class);
```

**Exercícios práticos:**
1. [ ] Crie 5 rotas: `/`, `/sobre`, `/contato`, `/produtos`, `/produtos/{id}`
2. [ ] Crie um grupo de rotas `/admin` protegido por middleware
3. [ ] Use `Route::resource()` para um CRUD de categorias

---

### 2.2 Controllers

```php
// app/Http/Controllers/ProdutoController.php
namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    // Listar todos
    public function index()
    {
        $produtos = Produto::all();
        return view('produtos.index', compact('produtos'));
    }

    // Mostrar um
    public function show(Produto $produto)  // Route Model Binding
    {
        return view('produtos.show', compact('produto'));
    }

    // Formulário de criação
    public function create()
    {
        return view('produtos.create');
    }

    // Salvar
    public function store(Request $request)
    {
        $validado = $request->validate([
            'nome' => 'required|string|max:255',
            'preco' => 'required|numeric|min:0',
        ]);

        Produto::create($validado);
        return redirect()->route('produtos.index')->with('success', 'Produto criado!');
    }

    // Formulário de edição
    public function edit(Produto $produto)
    {
        return view('produtos.edit', compact('produto'));
    }

    // Atualizar
    public function update(Request $request, Produto $produto)
    {
        $validado = $request->validate([
            'nome' => 'required|string|max:255',
            'preco' => 'required|numeric|min:0',
        ]);

        $produto->update($validado);
        return redirect()->route('produtos.index')->with('success', 'Produto atualizado!');
    }

    // Excluir
    public function destroy(Produto $produto)
    {
        $produto->delete();
        return redirect()->route('produtos.index')->with('success', 'Produto excluído!');
    }
}
```

**Conceitos-chave:**
- **Dependency Injection**: Laravel injeta `Request` e models automaticamente
- **Route Model Binding**: passar `Produto $produto` busca o registro pelo ID da URL
- **Validação**: `$request->validate()` retorna 422 automaticamente se falhar
- **Flash messages**: `with('chave', 'valor')` envia dados para a próxima requisição

---

### 2.3 Views com Blade

```blade
{{-- resources/views/produtos/index.blade.php --}}
@extends('layouts.app')

@section('titulo', 'Lista de Produtos')

@section('conteudo')
    <h1>Produtos</h1>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <a href="{{ route('produtos.create') }}" class="btn btn-primary">Novo Produto</a>

    <table class="table">
        @foreach($produtos as $produto)
            <tr>
                <td>{{ $produto->nome }}</td>
                <td>R$ {{ number_format($produto->preco, 2, ',', '.') }}</td>
                <td>
                    <a href="{{ route('produtos.edit', $produto) }}">Editar</a>
                    <form action="{{ route('produtos.destroy', $produto) }}" method="POST">
                        @csrf
                        @method('DELETE')
                        <button type="submit">Excluir</button>
                    </form>
                </td>
            </tr>
        @endforeach
    </table>
@endsection
```

**Diretivas Blade essenciais:**

| Diretiva | Função |
|----------|--------|
| `{{ $var }}` | Echo escapado (seguro contra XSS) |
| `{!! $html !!}` | Echo NÃO escapado (cuidado!) |
| `@if`, `@elseif`, `@else`, `@endif` | Condicionais |
| `@foreach`, `@endforeach` | Loop |
| `@for`, `@while` | Outros loops |
| `@extends('layout')` | Herança de template |
| `@section('nome')`, `@yield('nome')` | Blocos de conteúdo |
| `@csrf` | Token de proteção contra CSRF |
| `@method('PUT')` | Spoofing de método HTTP |
| `@include('partial')` | Incluir partials |
| `@component('alert')` | Componentes reutilizáveis |

---

## 📍 FASE 3: Eloquent ORM e Banco de Dados (Semanas 5–6)

### 3.1 Migrations

```bash
# Criar migration
php artisan make:migration create_produtos_table

# Criar migration com modelo
php artisan make:model Produto -m

# Rodar migrations
php artisan migrate

# Reverter última migration
php artisan migrate:rollback

# Reverter TUDO
php artisan migrate:reset

# Refazer (rollback + migrate)
php artisan migrate:refresh --seed
```

```php
// database/migrations/xxxx_create_produtos_table.php
public function up(): void
{
    Schema::create('produtos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('categoria_id')->constrained()->onDelete('cascade');
        $table->string('nome');
        $table->text('descricao')->nullable();
        $table->decimal('preco', 10, 2);
        $table->integer('estoque')->default(0);
        $table->boolean('ativo')->default(true);
        $table->timestamps(); // created_at e updated_at
    });
}
```

---

### 3.2 Eloquent — O coração do Laravel

```php
// app/Models/Produto.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = ['categoria_id', 'nome', 'descricao', 'preco', 'estoque', 'ativo'];

    protected $casts = [
        'preco' => 'decimal:2',
        'ativo' => 'boolean',
    ];

    // Relacionamento: Produto pertence a uma Categoria
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    // Relacionamento: Produto tem muitos Itens de Pedido
    public function itens(): HasMany
    {
        return $this->hasMany(ItemPedido::class);
    }

    // Scope local: produtos ativos
    public function scopeAtivos($query)
    {
        return $query->where('ativo', true);
    }

    // Scope local: produtos com estoque baixo
    public function scopeEstoqueBaixo($query)
    {
        return $query->whereColumn('estoque', '<=', 'estoque_minimo');
    }
}
```

**Consultas Eloquent:**

```php
// Todos
$produtos = Produto::all();

// Com condição
$ativos = Produto::where('ativo', true)->get();

// Paginado
$produtos = Produto::paginate(10);        // 10 por página
$produtos = Produto::simplePaginate(10);  // sem contar total

// Ordenado
$produtos = Produto::orderBy('preco', 'desc')->get();

// Com relacionamento (eager loading — evita N+1)
$produtos = Produto::with('categoria')->get();

// Buscar um
$produto = Produto::find(1);           // retorna null se não achar
$produto = Produto::findOrFail(1);     // retorna 404 se não achar

// Criar
$produto = Produto::create(['nome' => 'Mouse', 'preco' => 99.90]);

// Atualizar
$produto->update(['preco' => 89.90]);

// Excluir
$produto->delete();

// Soft Delete (não exclui do banco, marca deleted_at)
// No model: use Illuminate\Database\Eloquent\SoftDeletes;
$produto->delete();        // soft delete
Produto::withTrashed()->get();  // inclui deletados
Produto::onlyTrashed()->get();  // só deletados
$produto->restore();       // restaura
```

---

### 3.3 Factories e Seeders (dados de teste)

```php
// database/factories/ProdutoFactory.php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProdutoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => fake()->word(),
            'descricao' => fake()->sentence(),
            'preco' => fake()->randomFloat(2, 10, 1000),
            'estoque' => fake()->numberBetween(0, 100),
            'ativo' => true,
        ];
    }
}
```

```php
// database/seeders/DatabaseSeeder.php
public function run(): void
{
    \App\Models\Categoria::factory(5)->create();
    \App\Models\Produto::factory(50)->create();
    \App\Models\User::factory(10)->create();
}
```

```bash
php artisan db:seed
php artisan migrate:fresh --seed  # recria tudo + seed
```

---

## 📍 FASE 4: Autenticação e Autorização (Semanas 7–8)

### 4.1 Breeze / Jetstream / Fortify

```bash
# Laravel Breeze (mais simples, Blade + Alpine)
composer require laravel/breeze --dev
php artisan breeze:install
npm install && npm run dev
php artisan migrate

# Cria automaticamente:
# - Login / Register / Forgot Password
# - Dashboard
# - Profile (editar dados, alterar senha, deletar conta)
# - Middleware 'auth' e 'verified'
```

### 4.2 Gates e Policies (Autorização)

```php
// app/Providers/AppServiceProvider.php
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('editar-produto', function (User $user, Produto $produto) {
        return $user->id === $produto->user_id || $user->isAdmin();
    });
}

// No Controller
if (Gate::denies('editar-produto', $produto)) {
    abort(403, 'Acesso negado');
}

// Ou no Blade
@can('editar-produto', $produto)
    <a href="{{ route('produtos.edit', $produto) }}">Editar</a>
@endcan
```

```php
// app/Policies/ProdutoPolicy.php
class ProdutoPolicy
{
    public function update(User $user, Produto $produto): bool
    {
        return $user->id === $produto->user_id;
    }

    public function delete(User $user, Produto $produto): bool
    {
        return $user->isAdmin();
    }
}
```

---

## 📍 FASE 5: APIs RESTful (Semanas 9–10)

### 5.1 API Resources

```bash
php artisan make:controller Api/ProdutoController --api
php artisan make:resource ProdutoResource
```

```php
// app/Http/Resources/ProdutoResource.php
class ProdutoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'preco_formatado' => 'R$ ' . number_format($this->preco, 2, ',', '.'),
            'categoria' => new CategoriaResource($this->whenLoaded('categoria')),
            'criado_em' => $this->created_at->format('d/m/Y'),
        ];
    }
}
```

```php
// app/Http/Controllers/Api/ProdutoController.php
class ProdutoController extends Controller
{
    public function index()
    {
        return ProdutoResource::collection(Produto::paginate(10));
    }

    public function store(Request $request)
    {
        $produto = Produto::create($request->validated());
        return new ProdutoResource($produto);
    }

    public function show(Produto $produto)
    {
        return new ProdutoResource($produto->load('categoria'));
    }

    public function update(Request $request, Produto $produto)
    {
        $produto->update($request->validated());
        return new ProdutoResource($produto);
    }

    public function destroy(Produto $produto)
    {
        $produto->delete();
        return response()->json(['message' => 'Produto excluído'], 204);
    }
}
```

### 5.2 Sanctum (Autenticação para APIs)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

```php
// Login retorna token
$token = $user->createToken('app-token')->plainTextToken;
return response()->json(['token' => $token]);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
    Route::apiResource('produtos', ProdutoController::class);
});
```

---

## 📍 FASE 6: Testes e Qualidade (Semana 11)

### 6.1 PHPUnit / Pest

```bash
# PHPUnit (padrão do Laravel)
php artisan make:test ProdutoTest

# Pest (sintaxe mais limpa)
composer require pestphp/pest --dev
php artisan pest:install
```

```php
// tests/Feature/ProdutoTest.php
class ProdutoTest extends TestCase
{
    use RefreshDatabase; // reseta o banco a cada teste

    public function test_lista_produtos(): void
    {
        Produto::factory(5)->create();

        $response = $this->getJson('/api/produtos');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    public function test_cria_produto(): void
    {
        $response = $this->postJson('/api/produtos', [
            'nome' => 'Mouse Gamer',
            'preco' => 199.90,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.nome', 'Mouse Gamer');
    }

    public function test_valida_preco_negativo(): void
    {
        $response = $this->postJson('/api/produtos', [
            'nome' => 'Teste',
            'preco' => -10,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['preco']);
    }
}
```

```bash
php artisan test              # roda todos
php artisan test --filter=ProdutoTest
php artisan test --parallel   # paralelo (mais rápido)
```

---

## 📍 FASE 7: Avançado e Deploy (Semana 12+)

### 7.1 Filas e Jobs (Processamento assíncrono)

```bash
php artisan make:job ProcessarPedido
```

```php
// Enviar email, gerar relatório, processar pagamento...
ProcessarPedido::dispatch($pedido);

// Com delay
ProcessarPedido::dispatch($pedido)->delay(now()->addMinutes(10));
```

```bash
# Rodar worker
php artisan queue:work

# Usar Redis/SQS para filas em produção
```

### 7.2 Cache

```php
// Cachear query por 1 hora
$produtos = Cache::remember('produtos-ativos', 3600, function () {
    return Produto::ativos()->with('categoria')->get();
});

// Limpar cache
Cache::forget('produtos-ativos');
```

### 7.3 Eventos e Listeners

```bash
php artisan make:event PedidoCriado
php artisan make:listener EnviarEmailConfirmacao --event=PedidoCriado
```

### 7.4 Deploy

| Plataforma | Comando / Config |
|------------|------------------|
| **Laravel Forge** | Servidor VPS gerenciado (DigitalOcean, AWS, etc.) |
| **Vapor** | Serverless na AWS |
| **Railway / Render** | Deploy com Git push |
| **Shared Hosting** | Upload manual + configuração |

**Checklist de deploy:**
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] `php artisan migrate --force`
- [ ] Configurar queue worker (Supervisor)
- [ ] Configurar cron para `php artisan schedule:run`
- [ ] SSL/HTTPS habilitado

---

## ✅ Checklist de Progresso

| Fase | Tópico | Status |
|------|--------|--------|
| 1 | Composer, namespaces, POO | ☐ |
| 1 | Ambiente Laravel instalado | ☐ |
| 1 | Estrutura de pastas | ☐ |
| 2 | Rotas (web + resource) | ☐ |
| 2 | Controllers com CRUD | ☐ |
| 2 | Views Blade (extends, section, component) | ☐ |
| 3 | Migrations e Schema | ☐ |
| 3 | Eloquent (CRUD, relacionamentos, scopes) | ☐ |
| 3 | Factories e Seeders | ☐ |
| 4 | Laravel Breeze instalado | ☐ |
| 4 | Gates e Policies | ☐ |
| 5 | API Resource + Collection | ☐ |
| 5 | Sanctum autenticação | ☐ |
| 6 | Testes de Feature | ☐ |
| 6 | Testes de Unit | ☐ |
| 7 | Jobs e Filas | ☐ |
| 7 | Cache | ☐ |
| 7 | Deploy em produção | ☐ |

---

## 📚 Recursos Oficiais

| Recurso | Link |
|---------|------|
| Documentação Laravel | [laravel.com/docs](https://laravel.com/docs) |
| Laracasts (vídeos) | [laracasts.com](https://laracasts.com) |
| Laravel News | [laravel-news.com](https://laravel-news.com) |
| Laravel Daily (dicas) | [laraveldaily.com](https://laraveldaily.com) |
| Pacotes populares | [packagist.org](https://packagist.org) |

---

## 🎯 Projetos Práticos Recomendados

1. **Blog completo** — posts, categorias, tags, comentários, painel admin
2. **E-commerce** — produtos, carrinho, pedidos, pagamento (Stripe/PagSeguro), estoque
3. **SaaS de tarefas** — multi-tenant, equipes, projetos, drag-and-drop (Livewire)
4. **API de clima/CEP** — consome APIs externas, cache, filas
5. **Sistema de reservas** — calendário, disponibilidade, notificações por email

---

*Roadmap criado em 2026 — Laravel 11.x*
