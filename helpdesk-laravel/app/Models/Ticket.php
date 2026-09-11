<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'user_id',
        'assigned_to',
        'category_id',
    ];

    /**
     * O solicitante: quem abriu o chamado.
     * Como a coluna se chama "user_id" (padrão), não precisa de configuração extra.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * O agente responsável (pode ser nulo, se ainda não atribuído).
     * Aqui SIM precisamos avisar qual coluna usar, já que "assigned_to"
     * foge do padrão "user_id" que o Eloquent assumiria por padrão.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->latest();
    }

    /**
     * Relacionamento N:M: um ticket pode ter várias tags,
     * e uma tag pode estar em vários tickets, através da tabela
     * pivô "tag_ticket" (ver a migration correspondente).
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
