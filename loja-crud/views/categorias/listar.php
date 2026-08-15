<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0"><i class="bi bi-tags"></i> Categorias</h4>
    <a href="index.php?pagina=categorias&acao=criar" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Nova</a>
</div>
<div class="card border-0 shadow-sm">
    <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light"><tr><th>Nome</th><th>Descrição</th><th class="text-end">Ações</th></tr></thead>
            <tbody>
                <?php foreach ($categorias as $c): ?>
                <tr>
                    <td><?= htmlspecialchars($c['nome']) ?></td>
                    <td><?= htmlspecialchars($c['descricao'] ?? '-') ?></td>
                    <td class="text-end">
                        <a href="index.php?pagina=categorias&acao=editar&id=<?= $c['id'] ?>" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                        <a href="index.php?pagina=categorias&acao=excluir&id=<?= $c['id'] ?>" class="btn btn-sm btn-outline-danger" onclick="return confirm('Excluir?')"><i class="bi bi-trash"></i></a>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($categorias)): ?><tr><td colspan="3" class="text-center text-muted py-4">Nenhuma categoria.</td></tr><?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
