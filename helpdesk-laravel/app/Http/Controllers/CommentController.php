<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Ticket $ticket): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isAgente() || $ticket->user_id === $user->id, 403);

        $validated = $request->validate([
            'body' => 'required|string',
        ]);

        $ticket->comments()->create([
            'body' => $validated['body'],
            'user_id' => $user->id,
        ]);

        return redirect()
            ->route('tickets.show', $ticket)
            ->with('success', 'Comentário adicionado!');
    }

    public function destroy(Request $request, Ticket $ticket, Comment $comment): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isAgente() || $comment->user_id === $user->id, 403);

        $comment->delete();

        return redirect()
            ->route('tickets.show', $ticket)
            ->with('success', 'Comentário removido!');
    }
}
