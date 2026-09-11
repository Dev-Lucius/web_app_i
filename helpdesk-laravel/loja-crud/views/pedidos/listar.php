<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0"><i class="bi bi-cart3"></i> Pedidos</h4>
    <a href="index.php?pagina=pedidos&acao=criar" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Novo Pedido</a>
</div>
<div class="card border-0 shadow-sm">
    <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr><th>#</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th class="text-end">Ações</th></tr>
            </thead>
            <tbody>
                <?php foreach ($pedidos as $p): ?>
                <?php
                $badge = match($p['status']) {
                    'PENDENTE' => 'bg-warning text-dark',
                    'PAGO' => 'bg-info',
                    'EM_SEPARACAO' => 'bg-primary',
                    'ENVIADO' => 'bg-secondary',
                    'ENTREGUE' => 'bg-success',
                    'CANCELADO' => 'bg-danger',
                    default => 'bg-light text-dark'
                };
                ?>
                <tr>
                    <td>#<?= $p['id'] ?></td>
                    <td><?= htmlspecialchars($p['cliente_nome']) ?></td>
                    <td><?= date('d/m/Y H:i', strtotime($p['data_hora_pedido'])) ?></td>
                    <td>R$ <?= number_format($p['valor_total'], 2, ',', '.') ?></td>
                    <td><span class="badge <?= $badge ?>"><?= $p['status'] ?></span></td>
                    <td class="text-end">
                        <a href="index.php?pagina=pedidos&acao=visualizar&id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-info"><i class="bi bi-eye"></i></a>
                        <a href="index.php?pagina=pedidos&acao=excluir&id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-danger" onclick="return confirm('Excluir pedido? O estoque será restaurado.')"><i class="bi bi-trash"></i></a>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($pedidos)): ?><tr><td colspan="6" class="text-center text-muted py-4">Nenhum pedido.</td></tr><?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
