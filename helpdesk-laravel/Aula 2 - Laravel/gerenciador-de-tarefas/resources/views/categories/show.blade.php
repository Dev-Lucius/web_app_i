@extends('layouts.app')

@section('title', $category->name)

@section('content')

    <h1 class="h3">{{ $category->name }}</h1>
    <p class="text-muted">{{ $category->description }}</p>

    <h2 class="h5 mt-4">Tarefas nesta categoria</h2>

    @forelse ($tasks as $task)
        <div class="card mb-2">
            <div class="card-body">
                <a href="{{ route('tasks.show', $task) }}">{{ $task->title }}</a>
                <span class="badge bg-info text-dark">{{ str_replace('_', ' ', $task->status) }}</span>
            </div>
        </div>
    @empty
        <p class="text-muted">Nenhuma tarefa nesta categoria ainda.</p>
    @endforelse

    <a href="{{ route('categories.index') }}" class="btn btn-link">Voltar</a>

@endsection
