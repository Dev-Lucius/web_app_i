<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Esta é a tabela auxiliar (pivô) do relacionamento N:M entre
     * Tag e Ticket. Ela NÃO tem Model próprio nem $fillable — sua única
     * função é guardar quais tags estão ligadas a quais tickets.
     *
     * O nome "tag_ticket" segue a convenção do Eloquent: os dois nomes de
     * model, em minúsculo e singular, em ordem alfabética, separados por "_".
     */
    public function up(): void
    {
        Schema::create('tag_ticket', function (Blueprint $table) {
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['ticket_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tag_ticket');
    }
};
