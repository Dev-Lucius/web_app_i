<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Task;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Popula o banco com dados de exemplo.
     * Rode com: php artisan db:seed
     */
    public function run(): void
    {
        $trabalho = Category::create([
            'name' => 'Trabalho',
            'description' => 'Tarefas profissionais',
        ]);

        $estudos = Category::create([
            'name' => 'Estudos',
            'description' => 'Tarefas de aprendizado',
        ]);

        $pessoal = Category::create([
            'name' => 'Pessoal',
            'description' => 'Tarefas do dia a dia',
        ]);

        Task::create([
            'title' => 'Terminar o guia de Laravel',
            'description' => 'Ler o guia completo e rodar este projeto de exemplo.',
            'status' => 'em_andamento',
            'due_date' => now()->addDays(3),
            'category_id' => $estudos->id,
        ]);

        Task::create([
            'title' => 'Revisar Pull Request do time',
            'description' => 'Revisar o código antes do deploy de sexta-feira.',
            'status' => 'pendente',
            'due_date' => now()->addDay(),
            'category_id' => $trabalho->id,
        ]);

        Task::create([
            'title' => 'Fazer compras da semana',
            'status' => 'pendente',
            'category_id' => $pessoal->id,
        ]);

        Task::create([
            'title' => 'Configurar ambiente Laravel',
            'description' => 'Instalar PHP, Composer e criar o primeiro projeto.',
            'status' => 'concluida',
            'category_id' => $estudos->id,
        ]);

        Task::create([
            'title' => 'Tarefa sem categoria definida',
            'description' => 'Exemplo de tarefa com category_id nulo.',
            'status' => 'pendente',
        ]);
    }
}
