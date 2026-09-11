@extends('layouts.app')

@section('title', 'Tarefas')

@section('content')

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Minhas Tarefas</h1>
        <a href="{{ route('tasks.create') }}" class="btn btn-primary">+ Nova Tarefa</a>
    </div>

    {{-- Filtro simples por status via query string (?status=pendente) --}}
    <form method="GET" class="mb-3">
        <select name="status" class="form-select w-auto d-inline-block" onchange="this.form.submit()">
            <option value="">Todos os status</option>
            <option value="pendente" @selected(request('status') === 'pendente')>Pendente</option>
            <option value="em_andamento" @selected(request('status') === 'em_andamento')>Em andamento</option>
            <option value="concluida" @selected(request('status') === 'concluida')>Concluída</option>
        </select>
    </form>

    @forelse ($tasks as $task)
        <div class="card mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">
                        <a href="{{ route('tasks.show', $task) }}" class="text-decoration-none">
                            {{ $task->title }}
                        </a>
                    </h5>

                    <span class="badge bg-secondary">{{ $task->category->name ?? 'Sem categoria' }}</span>
                    <span class="badge bg-info text-dark">{{ str_replace('_', ' ', $task->status) }}</span>

                    @if ($task->due_date)
                        <small class="text-muted ms-2">Vence em {{ $task->due_date->format('d/m/Y') }}</small>
                    @endif
                </div>

                <div class="text-nowrap">
                    <a href="{{ route('tasks.edit', $task) }}" class="btn btn-sm btn-outline-secondary">Editar</a>

                    <form
                        action="{{ route('tasks.destroy', $task) }}"
                        method="POST"
                        class="d-inline"
                        onsubmit="return confirm('Tem certeza que deseja excluir esta tarefa?')"
                    >
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger">Excluir</button>
                    </form>
                </div>
            </div>
        </div>
    @empty
        <p class="text-muted">Nenhuma tarefa encontrada.</p>
    @endforelse

@endsection
