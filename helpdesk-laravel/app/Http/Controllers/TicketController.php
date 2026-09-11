<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TicketController extends Controller
{
    public function index(Request $request): View
    {
        $user = $request->user();

        $tickets = Ticket::with(['user', 'assignee', 'category'])
            // Cliente só vê os próprios chamados; agente vê todos.
            ->when(! $user->isAgente(), fn ($query) => $query->where('user_id', $user->id))
            ->when($request->status, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->get();

        return view('tickets.index', compact('tickets'));
    }

    public function create(): View
    {
        $categories = Category::orderBy('name')->get();

        return view('tickets.create', compact('categories'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:baixa,media,alta,urgente',
            'category_id' => 'nullable|exists:categories,id',
            'tags' => 'nullable|string',
        ]);

        $ticket = Ticket::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'category_id' => $validated['category_id'] ?? null,
            'user_id' => $request->user()->id,
        ]);

        $this->syncTags($ticket, $validated['tags'] ?? '');

        return redirect()
            ->route('tickets.show', $ticket)
            ->with('success', 'Chamado aberto com sucesso!');
    }

    public function show(Request $request, Ticket $ticket): View
    {
        $this->authorizeView($request->user(), $ticket);

        $ticket->load(['comments.user', 'tags', 'assignee', 'category', 'user']);

        return view('tickets.show', compact('ticket'));
    }

    public function edit(Request $request, Ticket $ticket): View
    {
        abort_unless($request->user()->isAgente(), 403, 'Só agentes podem editar chamados.');

        $categories = Category::orderBy('name')->get();
        $agentes = User::where('role', 'agente')->orderBy('name')->get();
        $ticket->load('tags');

        return view('tickets.edit', compact('ticket', 'categories', 'agentes'));
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        abort_unless($request->user()->isAgente(), 403, 'Só agentes podem editar chamados.');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:aberto,em_andamento,resolvido,fechado',
            'priority' => 'required|in:baixa,media,alta,urgente',
            'category_id' => 'nullable|exists:categories,id',
            'assigned_to' => 'nullable|exists:users,id',
            'tags' => 'nullable|string',
        ]);

        $ticket->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'category_id' => $validated['category_id'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
        ]);

        $this->syncTags($ticket, $validated['tags'] ?? '');

        return redirect()
            ->route('tickets.show', $ticket)
            ->with('success', 'Chamado atualizado com sucesso!');
    }

    public function destroy(Request $request, Ticket $ticket): RedirectResponse
    {
        abort_unless($request->user()->isAgente(), 403);

        $ticket->delete();

        return redirect()
            ->route('tickets.index')
            ->with('success', 'Chamado removido com sucesso!');
    }

    /**
     * Regra de autorização simples (sem Policy): só o solicitante do
     * chamado ou qualquer agente podem visualizá-lo.
     */
    private function authorizeView(User $user, Ticket $ticket): void
    {
        abort_unless($user->isAgente() || $ticket->user_id === $user->id, 403);
    }

    /**
     * Recebe uma string "impressora, urgente, hardware", cria as Tags que
     * ainda não existirem, e sincroniza a lista final com o ticket.
     *
     * sync() é o método ideal para relacionamentos N:M: ele compara a lista
     * nova com a lista atual e ajusta a tabela pivô (adiciona o que faltar,
     * remove o que não está mais na lista) em uma única chamada.
     */
    private function syncTags(Ticket $ticket, string $tagsInput): void
    {
        $tagIds = collect(explode(',', $tagsInput))
            ->map(fn ($name) => trim($name))
            ->filter()
            ->map(fn ($name) => Tag::firstOrCreate(['name' => $name])->id)
            ->all();

        $ticket->tags()->sync($tagIds);
    }
}
