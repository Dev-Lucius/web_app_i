<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Rode com: php artisan db:seed
     *
     * Cria dois usuários prontos para você testar os dois papéis:
     *   agente@helpdesk.test  / password
     *   cliente@helpdesk.test / password
     */
    public function run(): void
    {
        $agente = User::create([
            'name' => 'Ana Suporte',
            'email' => 'agente@helpdesk.test',
            'password' => Hash::make('password'),
            'role' => 'agente',
        ]);

        $cliente = User::create([
            'name' => 'Bruno Cliente',
            'email' => 'cliente@helpdesk.test',
            'password' => Hash::make('password'),
            'role' => 'cliente',
        ]);

        $hardware = Category::create(['name' => 'Hardware', 'description' => 'Problemas com equipamentos físicos']);
        $software = Category::create(['name' => 'Software', 'description' => 'Problemas com programas e sistemas']);
        $rede = Category::create(['name' => 'Rede', 'description' => 'Problemas de conexão e internet']);

        $ticket = Ticket::create([
            'title' => 'Impressora não imprime',
            'description' => 'A impressora do 2º andar exibe erro de papel mesmo com papel na bandeja.',
            'status' => 'em_andamento',
            'priority' => 'alta',
            'user_id' => $cliente->id,
            'assigned_to' => $agente->id,
            'category_id' => $hardware->id,
        ]);

        $ticket->tags()->attach([
            Tag::firstOrCreate(['name' => 'impressora'])->id,
            Tag::firstOrCreate(['name' => 'urgente'])->id,
        ]);

        $ticket->comments()->create([
            'user_id' => $agente->id,
            'body' => 'Já estou verificando, pode enviar uma foto do erro exibido no visor?',
        ]);

        Ticket::create([
            'title' => 'Sistema lento ao abrir planilhas',
            'description' => 'O Excel trava ao abrir arquivos com mais de 5 abas.',
            'status' => 'aberto',
            'priority' => 'media',
            'user_id' => $cliente->id,
            'category_id' => $software->id,
        ]);

        Ticket::create([
            'title' => 'Wi-Fi caindo constantemente',
            'description' => 'A conexão cai a cada 10 minutos, aproximadamente.',
            'status' => 'aberto',
            'priority' => 'urgente',
            'user_id' => $cliente->id,
            'category_id' => $rede->id,
        ]);
    }
}
