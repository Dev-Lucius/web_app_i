@extends('layouts.app')

@section('title', 'Chamados')

@section('content')

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">
            {{ auth()->user()->isAgente() ? 'Todos os Chamados' : 'Meus Chamados' }}
        </h1>
        <a href="{{ route('tickets.create') }}" class="btn btn-primary">+ Abrir Chamado</a>
    </div>

    <form method="GET" class="mb-3">
        <select name="status" class="form-select w-auto d-inline-block" onchange="this.form.submit()">
            <option value="">Todos os status</option>
            <option value="aberto" @selected(request('status') === 'aberto')>Aberto</option>
            <option value="em_andamento" @selected(request('status') === 'em_andamento')>Em andamento</option>
            <option value="resolvido" @selected(request('status') === 'resolvido')>Resolvido</option>
            <option value="fechado" @selected(request('status') === 'fechado')>Fechado</option>
        </select>
    </form>

    @forelse ($tickets as $ticket)
        <div class="card mb-2">
            <div class="card-body">
                <h5 class="mb-1">
                    <a href="{{ route('tickets.show', $ticket) }}" class="text-decoration-none">
                        #{{ $ticket->id }} — {{ $ticket->title }}
                    </a>
                </h5>

                <span class="badge bg-info text-dark">{{ str_replace('_', ' ', $ticket->status) }}</span>
                <span class="badge bg-warning text-dark">{{ $ticket->priority }}</span>
                <span class="badge bg-secondary">{{ $ticket->category->name ?? 'Sem categoria' }}</span>

                <small class="text-muted ms-2">
                    aberto por {{ $ticket->user->name }}
                    @if ($ticket->assignee)
                        · agente: {{ $ticket->assignee->name }}
                    @else
                        · sem agente atribuído
                    @endif
                </small>
            </div>
        </div>
    @empty
        <p class="text-muted">Nenhum chamado encontrado.</p>
    @endforelse

@endsection
