<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'due_date',
        'category_id',
    ];

    /**
     * Conversão automática de tipos.
     * "due_date" vira um objeto Carbon em vez de uma string,
     * permitindo usar $task->due_date->format('d/m/Y') nas views.
     */
    protected $casts = [
        'due_date' => 'date',
    ];

    /**
     * Relacionamento inverso: uma Tarefa PERTENCE A uma Categoria.
     * Permite usar $task->category->name nas views.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
