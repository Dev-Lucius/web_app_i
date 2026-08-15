<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0">Pedido #<?= $pedido['id'] ?></h4>
    <a href="index.php?pagina=pedidos" class="btn btn-outline-secondary btn-sm">Voltar</a>
</div>

<div class="row g-4">
    <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white"><strong><i class="bi bi-person"></i> Cliente</strong></div>
            <div class="card-body">
                <p class="mb-1"><strong><?= htmlspecialchars($pedido['cliente_nome']) ?></strong></p>
                <p class="mb-1 text-muted"><?= htmlspecialchars($pedido['email']) ?></p>
                <p class="mb-0 text-muted"><?= htmlspecialchars($pedido['telefone'] ?? '-') ?></p>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white"><strong><i class="bi bi-geo-alt"></i> Endereço de Entrega</strong></div>
            <div class="card-body">
                <?php if ($pedido['logradouro']): ?>
                <p class="mb-1"><?= htmlspecialchars($pedido['logradouro']) ?>, <?= htmlspecialchars($pedido['numero']) ?></p>
                <p class="mb-1 text-muted"><?= htmlspecialchars($pedido['bairro']) ?> — <?= htmlspecialchars($pedido['cidade']) ?>/<?= htmlspecialchars($pedido['estado']) ?></p>
                <p class="mb-0 text-muted">CEP: <?= htmlspecialchars($pedido['cep']) ?></p>
                <?php else: ?>
                <p class="text-muted mb-0">Nenhum endereço selecionado.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div class="card border-0 shadow-sm mt-4">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <strong><i class="bi bi-box-seam"></i> Itens</strong>
        <span class="badge bg-<?= match($pedido['status']){'PENDENTE'=>'warning text-dark','PAGO'=>'info','EM_SEPARACAO'=>'primary','ENVIADO'=>'secondary','ENTREGUE'=>'success','CANCELADO'=>'danger',default=>'light'} ?>">
            <?= $pedido['status'] ?>
        </span>
    </div>
    <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
                <?php foreach ($itens as $item): ?>
                <tr>
                    <td><?= htmlspecialchars($item['produto_nome']) ?></td>
                    <td><?= $item['quantidade'] ?></td>
                    <td>R$ <?= number_format($item['preco_unitario'], 2, ',', '.') ?></td>
                    <td>R$ <?= number_format($item['subtotal'], 2, ',', '.') ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot class="table-group-divider">
                <tr>
                    <td colspan="3" class="text-end"><h5 class="m-0">Total:</h5></td>
                    <td><h5 class="m-0 text-success">R$ <?= number_format($pedido['valor_total'], 2, ',', '.') ?></h5></td>
                </tr>
            </tfoot>
        </table>
    </div>
</div>

<?php if ($pedido['observacao']): ?>
<div class="alert alert-light border mt-4">
    <strong>Observação:</strong> <?= nl2br(htmlspecialchars($pedido['observacao'])) ?>
</div>
<?php endif; ?>
