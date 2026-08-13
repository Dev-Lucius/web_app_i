<?php
/**
 * order_salvar.php  (junta o antigo insert_order.php + update_order.php)
 * ---------------------------------------------------------------------
 * Recebe o POST de order_form.php e decide sozinho o que fazer:
 *
 *   - Se veio um campo "id"  -> é uma EDIÇÃO  -> roda um UPDATE
 *   - Se NÃO veio "id"       -> é um pedido novo -> roda um INSERT
 *
 * Esse é o "C" (Create) e o "U" (Update) do CRUD, juntos por serem
 * praticamente a mesma operação (salvar dados de um pedido).
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
require_once __DIR__ . '/includes/db.php';

exigirLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirecionarPara('home.php');
}

$descricao = postTrim('description');
$valor     = $_POST['amount'] ?? '';
$idPedido  = $_POST['id'] ?? null;

// Validação simples: descrição não pode ser vazia e valor precisa ser
// um número válido. Em caso de erro, volta para o formulário mantendo
// o contexto (novo ou edição do mesmo id).
if ($descricao === '' || !is_numeric($valor)) {
    $destino = $idPedido ? 'order_form.php?id=' . (int) $idPedido : 'order_form.php';
    redirecionarPara($destino . '&erro=1');
}

$pdo = obterConexao();

if (!empty($idPedido)) {
    // UPDATE — o "AND customer_id = ?" garante que ninguém edite um
    // pedido que não é seu, mesmo manipulando o id no formulário.
    $stmt = $pdo->prepare(
        'UPDATE orders SET description = ?, amount = ? WHERE id = ? AND customer_id = ?'
    );
    $stmt->execute([$descricao, $valor, (int) $idPedido, $_SESSION['id']]);
} else {
    // INSERT
    $stmt = $pdo->prepare(
        'INSERT INTO orders (description, amount, customer_id) VALUES (?, ?, ?)'
    );
    $stmt->execute([$descricao, $valor, $_SESSION['id']]);
}

redirecionarPara('home.php?msg=OK');
