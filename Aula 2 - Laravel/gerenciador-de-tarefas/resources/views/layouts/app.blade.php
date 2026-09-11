<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Gerenciador de Tarefas')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container">
            <a class="navbar-brand" href="{{ route('tasks.index') }}">📋 Gerenciador de Tarefas</a>
            <div class="navbar-nav">
                <a class="nav-link" href="{{ route('tasks.index') }}">Tarefas</a>
                <a class="nav-link" href="{{ route('categories.index') }}">Categorias</a>
            </div>
        </div>
    </nav>

    <div class="container mb-5">

        {{-- Mensagem de sucesso após criar/editar/excluir algo --}}
        @if (session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif

        {{-- Aqui entra o conteúdo específico de cada página --}}
        @yield('content')

    </div>

</body>
</html>
