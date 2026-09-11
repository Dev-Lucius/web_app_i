<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('tickets.index');
});

// Middleware "guest": só acessível para quem NÃO está logado.
Route::middleware('guest')->group(function () {
    Route::get('/registrar', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/registrar', [AuthController::class, 'register']);
    Route::get('/entrar', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/entrar', [AuthController::class, 'login']);
});

// Middleware "auth": só acessível para quem ESTÁ logado.
Route::middleware('auth')->group(function () {
    Route::post('/sair', [AuthController::class, 'logout'])->name('logout');

    Route::resource('tickets', TicketController::class);

    // Rotas aninhadas: um comentário só existe dentro do contexto de um ticket.
    Route::post('tickets/{ticket}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('tickets/{ticket}/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
});
