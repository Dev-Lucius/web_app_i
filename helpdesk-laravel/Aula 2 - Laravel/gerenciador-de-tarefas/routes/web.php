<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

// Ao acessar a raiz do site, redireciona para a listagem de tarefas
Route::get('/', function () {
    return redirect()->route('tasks.index');
});

// Route::resource cria automaticamente as 7 rotas RESTful de CRUD.
// Rode "php artisan route:list" para ver todas elas geradas.
Route::resource('tasks', TaskController::class);
Route::resource('categories', CategoryController::class);
