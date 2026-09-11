@extends('layouts.app')

@section('title', 'Abrir Chamado')

@section('content')

    <h1 class="h3 mb-3">Abrir novo chamado</h1>

    <form action="{{ route('tickets.store') }}" method="POST">
        @csrf

        <div class="mb-3">
            <label class="form-label">Título</label>
            <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title') }}">
            @error('title') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="mb-3">
            <label class="form-label">Descrição</label>
            <textarea name="description" rows="4" class="form-control @error('description') is-invalid @enderror">{{ old('description') }}</textarea>
            @error('description') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="row">
            <div class="col-md-4 mb-3">
                <label class="form-label">Prioridade</label>
                @php $currentPriority = old('priority', 'media'); @endphp
                <select name="priority" class="form-select">
                    <option value="baixa" @selected($currentPriority === 'baixa')>Baixa</option>
                    <option value="media" @selected($currentPriority === 'media')>Média</option>
                    <option value="alta" @selected($currentPriority === 'alta')>Alta</option>
                    <option value="urgente" @selected($currentPriority === 'urgente')>Urgente</option>
                </select>
            </div>

            <div class="col-md-4 mb-3">
                <label class="form-label">Categoria</label>
                @php $currentCategoryId = (int) old('category_id'); @endphp
                <select name="category_id" class="form-select">
                    <option value="">Sem categoria</option>
                    @foreach ($categories as $category)
                        <option value="{{ $category->id }}" @selected($currentCategoryId === $category->id)>
                            {{ $category->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div class="col-md-4 mb-3">
                <label class="form-label">Tags (separadas por vírgula)</label>
                <input type="text" name="tags" class="form-control" value="{{ old('tags') }}" placeholder="ex: impressora, urgente">
            </div>
        </div>

        <button type="submit" class="btn btn-primary">Abrir Chamado</button>
        <a href="{{ route('tickets.index') }}" class="btn btn-link">Cancelar</a>
    </form>

@endsection
