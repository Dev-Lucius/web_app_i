<?php
/**
 * order_excluir.php  (antigo trecho de home.php que rodava o DELETE)
 * ---------------------------------------------------------------------
 * O "D" do CRUD, isolado em seu próprio arquivo.
 *
 * No projeto original, a exclusão acontecia dentro do próprio
 * home.php, misturada com o código que lista os pedidos. Separar deixa
 * claro, só pelo nome do arquivo, o que essa ação faz — e evita que a
 * mesma URL (home.php) sirva tanto para "ver a lista" quanto para
 * "apagar alguma coisa".
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
require_once __DIR__ . '/includes/db.php';

exigirLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_POST['id'])) {
    redirecionarPara('home.php');
}

$pdo = obterConexao();

// De novo: "AND customer_id = ?" impede um cliente de excluir pedido
// alheio só adivinhando/trocando o id no formulário.
$stmt = $pdo->prepare('DELETE FROM orders WHERE id = ? AND customer_id = ?');
$stmt->execute([(int) $_POST['id'], $_SESSION['id']]);

redirecionarPara('home.php?msg=EXCLUIDO');
