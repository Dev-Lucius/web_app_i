@extends('layouts.app')

@section('title', 'Editar Chamado')

@section('content')

    <h1 class="h3 mb-3">Editar Chamado #{{ $ticket->id }}</h1>

    <form action="{{ route('tickets.update', $ticket) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="mb-3">
            <label class="form-label">Título</label>
            <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title', $ticket->title) }}">
            @error('title') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="mb-3">
            <label class="form-label">Descrição</label>
            <textarea name="description" rows="4" class="form-control @error('description') is-invalid @enderror">{{ old('description', $ticket->description) }}</textarea>
            @error('description') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="row">
            <div class="col-md-3 mb-3">
                <label class="form-label">Status</label>
                @php $currentStatus = old('status', $ticket->status); @endphp
                <select name="status" class="form-select">
                    <option value="aberto" @selected($currentStatus === 'aberto')>Aberto</option>
                    <option value="em_andamento" @selected($currentStatus === 'em_andamento')>Em andamento</option>
                    <option value="resolvido" @selected($currentStatus === 'resolvido')>Resolvido</option>
                    <option value="fechado" @selected($currentStatus === 'fechado')>Fechado</option>
                </select>
            </div>

            <div class="col-md-3 mb-3">
                <label class="form-label">Prioridade</label>
                @php $currentPriority = old('priority', $ticket->priority); @endphp
                <select name="priority" class="form-select">
                    <option value="baixa" @selected($currentPriority === 'baixa')>Baixa</option>
                    <option value="media" @selected($currentPriority === 'media')>Média</option>
                    <option value="alta" @selected($currentPriority === 'alta')>Alta</option>
                    <option value="urgente" @selected($currentPriority === 'urgente')>Urgente</option>
                </select>
            </div>

            <div class="col-md-3 mb-3">
                <label class="form-label">Categoria</label>
                @php $currentCategoryId = (int) old('category_id', $ticket->category_id); @endphp
                <select name="category_id" class="form-select">
                    <option value="">Sem categoria</option>
                    @foreach ($categories as $category)
                        <option value="{{ $category->id }}" @selected($currentCategoryId === $category->id)>
                            {{ $category->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div class="col-md-3 mb-3">
                <label class="form-label">Agente responsável</label>
                @php $currentAssignedTo = (int) old('assigned_to', $ticket->assigned_to); @endphp
                <select name="assigned_to" class="form-select">
                    <option value="">Não atribuído</option>
                    @foreach ($agentes as $agente)
                        <option value="{{ $agente->id }}" @selected($currentAssignedTo === $agente->id)>
                            {{ $agente->name }}
                        </option>
                    @endforeach
                </select>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Tags (separadas por vírgula)</label>
            <input
                type="text"
                name="tags"
                class="form-control"
                value="{{ old('tags', $ticket->tags->pluck('name')->join(', ')) }}"
            >
        </div>

        <button type="submit" class="btn btn-primary">Salvar alterações</button>
        <a href="{{ route('tickets.show', $ticket) }}" class="btn btn-link">Cancelar</a>
    </form>

@endsection
