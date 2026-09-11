@extends('layouts.app')

@section('title', $ticket->title)

@section('content')

    <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
            <h1 class="h3 mb-1">#{{ $ticket->id }} — {{ $ticket->title }}</h1>
            <span class="badge bg-info text-dark">{{ str_replace('_', ' ', $ticket->status) }}</span>
            <span class="badge bg-warning text-dark">{{ $ticket->priority }}</span>
            <span class="badge bg-secondary">{{ $ticket->category->name ?? 'Sem categoria' }}</span>
            @foreach ($ticket->tags as $tag)
                <span class="badge bg-light text-dark border">#{{ $tag->name }}</span>
            @endforeach
        </div>

        @if (auth()->user()->isAgente())
            <a href="{{ route('tickets.edit', $ticket) }}" class="btn btn-outline-secondary">Editar</a>
        @endif
    </div>

    <p class="text-muted">
        Aberto por <strong>{{ $ticket->user->name }}</strong> em {{ $ticket->created_at->format('d/m/Y H:i') }}
        @if ($ticket->assignee)
            &nbsp;|&nbsp; Agente responsável: <strong>{{ $ticket->assignee->name }}</strong>
        @else
            &nbsp;|&nbsp; <span class="text-warning">Sem agente atribuído</span>
        @endif
    </p>

    <p>{{ $ticket->description }}</p>

    <hr>

    <h2 class="h5">Comentários</h2>

    @forelse ($ticket->comments as $comment)
        <div class="card mb-2">
            <div class="card-body py-2">
                <div class="d-flex justify-content-between">
                    <strong>{{ $comment->user->name }}</strong>
                    <small class="text-muted">{{ $comment->created_at->diffForHumans() }}</small>
                </div>
                <p class="mb-0">{{ $comment->body }}</p>
            </div>
        </div>
    @empty
        <p class="text-muted">Nenhum comentário ainda.</p>
    @endforelse

    <form action="{{ route('comments.store', $ticket) }}" method="POST" class="mt-3">
        @csrf
        <div class="mb-2">
            <textarea
                name="body"
                rows="3"
                class="form-control @error('body') is-invalid @enderror"
                placeholder="Escreva um comentário..."
            >{{ old('body') }}</textarea>
            @error('body') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>
        <button type="submit" class="btn btn-primary btn-sm">Comentar</button>
    </form>

    <a href="{{ route('tickets.index') }}" class="btn btn-link mt-3">Voltar</a>

@endsection
