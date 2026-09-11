@extends('layouts.app')

@section('title', 'Editar Categoria')

@section('content')

    <h1 class="h3 mb-3">Editar Categoria</h1>

    <form action="{{ route('categories.update', $category) }}" method="POST">
        @csrf
        @method('PUT')
        @include('categories._form')

        <button type="submit" class="btn btn-primary">Atualizar</button>
        <a href="{{ route('categories.index') }}" class="btn btn-link">Cancelar</a>
    </form>

@endsection
