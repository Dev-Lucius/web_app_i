<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * Campos que podem ser preenchidos via Mass Assignment
     * (ex: Category::create($request->all())).
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Relacionamento: uma Categoria TEM VÁRIAS Tarefas.
     * Isso permite usar $category->tasks para pegar todas as tarefas dela.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
