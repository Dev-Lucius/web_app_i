<?php
/**
 * order_form.php
 * ---------------------------------------------------------------------
 * Mostra o formulário de pedido. Um único arquivo cobre os dois casos:
 *
 *   order_form.php            -> formulário vazio (criar um pedido novo)
 *   order_form.php?id=5       -> formulário preenchido (editar o pedido 5)
 *
 * O antigo projeto tinha insert_order.php e update_order.php quase
 * idênticos (mesmo HTML, mesma navbar, mesmos campos). Unificar os
 * dois em um só formulário evita manter duas cópias sincronizadas.
 * Quem decide se é INSERT ou UPDATE é o order_salvar.php, com base na
 * presença do campo escondido "id".
 *
 * Segurança: ao editar, conferimos se o pedido pertence mesmo ao
 * cliente logado (`AND customer_id = ?`). No projeto original,
 * update_order.php buscava o pedido só pelo id, então um cliente
 * malicioso poderia editar pedidos de OUTRO cliente trocando o id
 * na URL/formulário. Aqui isso não é mais possível.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
require_once __DIR__ . '/includes/db.php';

exigirLogin();

$pedido = ['id' => '', 'description' => '', 'amount' => ''];
$modoEdicao = false;

if (!empty($_GET['id'])) {
    $pdo = obterConexao();
    $stmt = $pdo->prepare('SELECT id, description, amount FROM orders WHERE id = ? AND customer_id = ?');
    $stmt->execute([(int) $_GET['id'], $_SESSION['id']]);
    $encontrado = $stmt->fetch();

    if (!$encontrado) {
        redirecionarPara('home.php');
    }

    $pedido = $encontrado;
    $modoEdicao = true;
}

$tituloPagina = $modoEdicao ? 'Editar pedido' : 'Novo pedido';
$paginaAtiva  = 'home';
require __DIR__ . '/includes/header.php';
?>

<div class="card-formulario">
    <h3 class="text-center"><?= $modoEdicao ? 'Editar pedido' : 'Novo pedido' ?></h3>

    <form action="order_salvar.php" method="post">
        <?php if ($modoEdicao): ?>
            <input type="hidden" name="id" value="<?= (int) $pedido['id'] ?>">
        <?php endif; ?>

        <div class="form-group">
            <label for="description">Descrição:</label>
            <input type="text" name="description" id="description" class="form-control"
                   value="<?= h($pedido['description']) ?>" required>
        </div>

        <div class="form-group">
            <label for="amount">Valor:</label>
            <input type="number" step="0.01" min="0" name="amount" id="amount" class="form-control"
                   value="<?= h((string) $pedido['amount']) ?>" required>
        </div>

        <div class="d-flex justify-content-between align-items-center">
            <a href="home.php">Cancelar</a>
            <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
    </form>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
