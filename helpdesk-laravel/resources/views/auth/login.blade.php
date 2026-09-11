@extends('layouts.guest')

@section('title', 'Entrar')

@section('content')
    <h1 class="h4 mb-3">Entrar</h1>

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <div class="mb-3">
            <label class="form-label">E-mail</label>
            <input type="email" name="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email') }}">
            @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
        </div>

        <div class="mb-3">
            <label class="form-label">Senha</label>
            <input type="password" name="password" class="form-control">
        </div>

        <div class="form-check mb-3">
            <input type="checkbox" name="remember" class="form-check-input" id="remember">
            <label class="form-check-label" for="remember">Lembrar de mim</label>
        </div>

        <button type="submit" class="btn btn-primary">Entrar</button>
        <a href="{{ route('register') }}" class="btn btn-link">Criar conta</a>
    </form>

    <hr>
    <small class="text-muted">
        Contas de teste (após rodar o seeder):<br>
        Agente: <code>agente@helpdesk.test</code> / <code>password</code><br>
        Cliente: <code>cliente@helpdesk.test</code> / <code>password</code>
    </small>
@endsection
