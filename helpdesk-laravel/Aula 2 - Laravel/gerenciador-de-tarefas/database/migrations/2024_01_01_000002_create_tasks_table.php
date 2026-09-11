<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('pendente'); // pendente | em_andamento | concluida
            $table->date('due_date')->nullable();

            // Chave estrangeira opcional: uma tarefa pode não ter categoria.
            // nullOnDelete() faz com que, se a categoria for apagada,
            // a tarefa continue existindo apenas sem categoria (mais seguro
            // do que apagar as tarefas em cascata).
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
