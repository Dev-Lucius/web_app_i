@extends('layouts.guest')

@section('title', 'Criar conta')

@section('content')
    <h1 class="h4 mb-3">Criar conta</h1>

    <form method="POST" action="{{ route('register') }}">
        @csrf

        <div class="mb-3">
            <label class="form-label">Nome</label>
            <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name') }}">
            @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="mb-3">
            <label class="form-label">E-mail</label>
            <input type="email" name="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email') }}">
            @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="mb-3">
            <label class="form-label">Senha</label>
            <input type="password" name="password" class="form-control @error('password') is-invalid @enderror">
            @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="mb-3">
            <label class="form-label">Confirme a senha</label>
            <input type="password" name="password_confirmation" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Você é...</label>
            @php $currentRole = old('role', 'cliente'); @endphp
            <select name="role" class="form-select">
                <option value="cliente" @selected($currentRole === 'cliente')>Cliente (quero abrir chamados)</option>
                <option value="agente" @selected($currentRole === 'agente')>Agente de suporte</option>
            </select>
            <small class="text-muted d-block mt-1">
                Em um sistema real, contas de agente normalmente seriam criadas por um
                administrador. Aqui deixamos você escolher livremente só para facilitar
                os testes dos dois papéis.
            </small>
        </div>

        <button type="submit" class="btn btn-primary">Cadastrar</button>
        <a href="{{ route('login') }}" class="btn btn-link">Já tenho conta</a>
    </form>
@endsection
