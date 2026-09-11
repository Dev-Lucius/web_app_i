@extends('layouts.app')

@section('title', $task->title)

@section('content')

    <h1 class="h3">{{ $task->title }}</h1>

    <p class="text-muted mb-3">
        Categoria: <strong>{{ $task->category->name ?? 'Sem categoria' }}</strong>
        &nbsp;|&nbsp;
        Status: <strong>{{ str_replace('_', ' ', $task->status) }}</strong>
        @if ($task->due_date)
            &nbsp;|&nbsp; Vence em <strong>{{ $task->due_date->format('d/m/Y') }}</strong>
        @endif
    </p>

    <p>{{ $task->description ?? 'Sem descrição.' }}</p>

    <a href="{{ route('tasks.edit', $task) }}" class="btn btn-outline-secondary">Editar</a>
    <a href="{{ route('tasks.index') }}" class="btn btn-link">Voltar</a>

@endsection
