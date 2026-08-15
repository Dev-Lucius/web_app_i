<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0"><i class="bi bi-people"></i> Clientes</h4>
    <a href="index.php?pagina=clientes&acao=criar" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Novo Cliente
    </a>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>CPF</th>
                    <th>Status</th>
                    <th class="text-end">Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($clientes as $c): ?>
                <tr>
                    <td><?= htmlspecialchars($c['nome']) ?></td>
                    <td><?= htmlspecialchars($c['email']) ?></td>
                    <td><?= htmlspecialchars($c['telefone'] ?? '-') ?></td>
                    <td><?= htmlspecialchars($c['cpf']) ?></td>
                    <td>
                        <?php if ($c['ativo']): ?>
                            <span class="badge bg-success">Ativo</span>
                        <?php else: ?>
                            <span class="badge bg-secondary">Inativo</span>
                        <?php endif; ?>
                    </td>
                    <td class="text-end">
                        <a href="index.php?pagina=clientes&acao=editar&id=<?= $c['id'] ?>" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <a href="index.php?pagina=clientes&acao=excluir&id=<?= $c['id'] ?>" 
                           class="btn btn-sm btn-outline-danger"
                           onclick="return confirm('Tem certeza que deseja excluir?')">
                            <i class="bi bi-trash"></i>
                        </a>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($clientes)): ?>
                <tr><td colspan="6" class="text-center text-muted py-4">Nenhum cliente cadastrado.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
