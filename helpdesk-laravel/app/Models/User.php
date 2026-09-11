<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // 'cliente' ou 'agente'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAgente(): bool
    {
        return $this->role === 'agente';
    }

    /**
     * Chamados ABERTOS por este usuário (como solicitante).
     * Usa a convenção padrão: procura "user_id" na tabela tickets.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Chamados ATRIBUÍDOS a este usuário (como agente responsável).
     * Aqui a coluna NÃO se chama "user_id" — é "assigned_to" — por isso
     * precisamos informar explicitamente qual é a chave estrangeira.
     * Isso é o que torna possível ter DOIS relacionamentos diferentes
     * entre Ticket e User na mesma tabela.
     */
    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }
}
