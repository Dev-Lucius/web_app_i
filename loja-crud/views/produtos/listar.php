<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0"><i class="bi bi-box-seam"></i> Produtos</h4>
    <a href="index.php?pagina=produtos&acao=criar" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Novo Produto</a>
</div>
<div class="card border-0 shadow-sm">
    <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th class="text-end">Ações</th></tr>
            </thead>
            <tbody>
                <?php foreach ($produtos as $p): ?>
                <tr>
                    <td><?= htmlspecialchars($p['nome']) ?></td>
                    <td><?= htmlspecialchars($p['categoria_nome'] ?? 'Sem categoria') ?></td>
                    <td>R$ <?= number_format($p['preco'], 2, ',', '.') ?></td>
                    <td>
                        <?= (int)$p['qtd_estoque'] ?>
                        <?php if ($p['qtd_estoque'] <= $p['estoque_minimo']): ?>
                            <span class="badge bg-danger ms-1">Baixo</span>
                        <?php endif; ?>
                    </td>
                    <td><?= $p['ativo'] ? '<span class="badge bg-success">Ativo</span>' : '<span class="badge bg-secondary">Inativo</span>' ?></td>
                    <td class="text-end">
                        <a href="index.php?pagina=produtos&acao=editar&id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                        <a href="index.php?pagina=produtos&acao=excluir&id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-danger" onclick="return confirm('Excluir?')"><i class="bi bi-trash"></i></a>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($produtos)): ?><tr><td colspan="6" class="text-center text-muted py-4">Nenhum produto.</td></tr><?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
