@extends('layouts.app')

@section('title', 'Categorias')

@section('content')

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Categorias</h1>
        <a href="{{ route('categories.create') }}" class="btn btn-primary">+ Nova Categoria</a>
    </div>

    @forelse ($categories as $category)
        <div class="card mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">
                        <a href="{{ route('categories.show', $category) }}" class="text-decoration-none">
                            {{ $category->name }}
                        </a>
                    </h5>
                    <small class="text-muted">{{ $category->tasks_count }} tarefa(s)</small>
                </div>

                <div class="text-nowrap">
                    <a href="{{ route('categories.edit', $category) }}" class="btn btn-sm btn-outline-secondary">Editar</a>

                    <form
                        action="{{ route('categories.destroy', $category) }}"
                        method="POST"
                        class="d-inline"
                        onsubmit="return confirm('Excluir esta categoria? As tarefas dela ficarão sem categoria.')"
                    >
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger">Excluir</button>
                    </form>
                </div>
            </div>
        </div>
    @empty
        <p class="text-muted">Nenhuma categoria cadastrada.</p>
    @endforelse

@endsection
