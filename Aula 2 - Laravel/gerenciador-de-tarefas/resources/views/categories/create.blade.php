@extends('layouts.app')

@section('title', 'Nova Categoria')

@section('content')

    <h1 class="h3 mb-3">Nova Categoria</h1>

    <form action="{{ route('categories.store') }}" method="POST">
        @csrf
        @include('categories._form')

        <button type="submit" class="btn btn-primary">Salvar</button>
        <a href="{{ route('categories.index') }}" class="btn btn-link">Cancelar</a>
    </form>

@endsection
