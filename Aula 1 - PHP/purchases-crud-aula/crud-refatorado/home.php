<?php
/**
 * home.php
 * ---------------------------------------------------------------------
 * Lista os pedidos ("orders") do cliente logado. É a tela inicial do
 * cliente comum — o administrador é mandado para admin.php.
 *
 * Esse arquivo agora só READ (lê e mostra). Criar, editar e excluir
 * viraram responsabilidade de outros arquivos (order_form.php,
 * order_salvar.php, order_excluir.php). Isso é o "R" do CRUD isolado
 * do "C", "U" e "D" — mais fácil de entender o que cada arquivo faz.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
require_once __DIR__ . '/includes/db.php';

exigirLogin();

if (souAdmin()) {
    redirecionarPara('admin.php');
}

$pdo = obterConexao();
$stmt = $pdo->prepare('SELECT id, description, amount FROM orders WHERE customer_id = ? ORDER BY id DESC');
$stmt->execute([$_SESSION['id']]);
$pedidos = $stmt->fetchAll();

$tituloPagina = 'Meus pedidos';
$paginaAtiva  = 'home';
require __DIR__ . '/includes/header.php';

if (($_GET['msg'] ?? '') === 'OK') {
    echo '<div class="alert alert-info">Pedido salvo com sucesso.</div>';
} elseif (($_GET['msg'] ?? '') === 'EXCLUIDO') {
    echo '<div class="alert alert-info">Pedido excluído.</div>';
}
?>

<div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="mb-0">Meus pedidos</h3>
    <a href="order_form.php" class="btn btn-primary">+ Novo pedido</a>
</div>

<table class="table table-hover bg-white">
    <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">Descrição</th>
            <th scope="col">Valor</th>
            <th scope="col" class="text-right">Ações</th>
        </tr>
    </thead>
    <tbody>
    <?php if (empty($pedidos)): ?>
        <tr>
            <td colspan="4" class="text-center text-muted">Nenhum pedido cadastrado ainda.</td>
        </tr>
    <?php endif; ?>

    <?php foreach ($pedidos as $pedido): ?>
        <tr>
            <td><?= h((string) $pedido['id']) ?></td>
            <td><?= h($pedido['description']) ?></td>
            <td>R$ <?= h(number_format((float) $pedido['amount'], 2, ',', '.')) ?></td>
            <td class="text-right acoes-tabela">
                <a href="order_form.php?id=<?= (int) $pedido['id'] ?>" class="btn btn-info btn-sm">Editar</a>
                <form action="order_excluir.php" method="post" onsubmit="return confirm('Excluir este pedido?');">
                    <input type="hidden" name="id" value="<?= (int) $pedido['id'] ?>">
                    <button type="submit" class="btn btn-danger btn-sm">Excluir</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>

<?php require __DIR__ . '/includes/footer.php'; ?>
