<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('aberto');   // aberto | em_andamento | resolvido | fechado
            $table->string('priority')->default('media');  // baixa | media | alta | urgente

            // Quem ABRIU o chamado (obrigatório).
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Agente RESPONSÁVEL pelo chamado (opcional, pode não estar atribuído ainda).
            // Repare que precisamos indicar explicitamente ->constrained('users'),
            // já que o nome da coluna ("assigned_to") não segue o padrão "*_id"
            // que o Laravel usaria para adivinhar a tabela sozinho.
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();

            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
