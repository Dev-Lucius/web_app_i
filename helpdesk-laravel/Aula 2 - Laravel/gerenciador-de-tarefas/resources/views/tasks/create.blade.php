@extends('layouts.app')

@section('title', 'Nova Tarefa')

@section('content')

    <h1 class="h3 mb-3">Nova Tarefa</h1>

    <form action="{{ route('tasks.store') }}" method="POST">
        @csrf
        @include('tasks._form')

        <button type="submit" class="btn btn-primary">Salvar</button>
        <a href="{{ route('tasks.index') }}" class="btn btn-link">Cancelar</a>
    </form>

@endsection
