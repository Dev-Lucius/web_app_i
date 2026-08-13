<?php
/**
 * admin.php
 * ---------------------------------------------------------------------
 * Painel do administrador: lista todos os clientes (exceto o próprio
 * admin) e, para cada um, os pedidos que ele cadastrou. É uma tela
 * somente leitura.
 *
 * Mantivemos a mesma estratégia do projeto original (uma consulta para
 * os clientes e, para cada cliente, uma segunda consulta buscando os
 * pedidos dele). Isso é chamado de "N+1 queries" e não é o mais
 * eficiente — o ideal, em um sistema maior, seria um único JOIN.
 * Optamos por manter assim porque fica mais fácil de acompanhar o que
 * está acontecendo passo a passo; veja o README para uma sugestão de
 * como evoluir isso com JOIN.
 * ---------------------------------------------------------------------
 */
require_once __DIR__ . '/includes/funcoes.php';
require_once __DIR__ . '/includes/db.php';

exigirAdmin();

$pdo = obterConexao();

$clientes = $pdo->prepare('SELECT id, name, email FROM customers WHERE name != ? ORDER BY name');
$clientes->execute([ADMIN_NAME]);
$clientes = $clientes->fetchAll();

$buscarPedidosDoCliente = $pdo->prepare('SELECT id, description, amount FROM orders WHERE customer_id = ?');

$tituloPagina = 'Administração';
$paginaAtiva  = 'admin';
require __DIR__ . '/includes/header.php';
?>

<h3 class="mb-3">Clientes e pedidos</h3>

<table class="table bg-white">
    <thead class="thead-light">
        <tr>
            <th scope="col">#</th>
            <th scope="col">Nome</th>
            <th scope="col">E-mail</th>
        </tr>
    </thead>
    <tbody>
    <?php if (empty($clientes)): ?>
        <tr>
            <td colspan="3" class="text-center text-muted">Nenhum cliente cadastrado.</td>
        </tr>
    <?php endif; ?>

    <?php foreach ($clientes as $cliente): ?>
        <tr class="table-primary">
            <td><?= h((string) $cliente['id']) ?></td>
            <td><?= h($cliente['name']) ?></td>
            <td><?= h($cliente['email']) ?></td>
        </tr>
        <?php
        $buscarPedidosDoCliente->execute([$cliente['id']]);
        $pedidos = $buscarPedidosDoCliente->fetchAll();
        ?>
        <?php if (!empty($pedidos)): ?>
        <tr>
            <td colspan="3">
                <table class="table table-sm table-light mb-0">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Descrição</th>
                            <th scope="col">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($pedidos as $pedido): ?>
                        <tr>
                            <td><?= h((string) $pedido['id']) ?></td>
                            <td><?= h($pedido['description']) ?></td>
                            <td>R$ <?= h(number_format((float) $pedido['amount'], 2, ',', '.')) ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </td>
        </tr>
        <?php endif; ?>
    <?php endforeach; ?>
    </tbody>
</table>

<?php require __DIR__ . '/includes/footer.php'; ?>
