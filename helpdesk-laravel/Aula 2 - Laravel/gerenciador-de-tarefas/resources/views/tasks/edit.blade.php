@extends('layouts.app')

@section('title', 'Editar Tarefa')

@section('content')

    <h1 class="h3 mb-3">Editar Tarefa</h1>

    <form action="{{ route('tasks.update', $task) }}" method="POST">
        @csrf
        @method('PUT')
        @include('tasks._form')

        <button type="submit" class="btn btn-primary">Atualizar</button>
        <a href="{{ route('tasks.index') }}" class="btn btn-link">Cancelar</a>
    </form>

@endsection
