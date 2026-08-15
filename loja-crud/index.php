<?php
session_start();
require_once __DIR__ . '/includes/conection.php';

$pagina = $_GET['pagina'] ?? 'home';
$acao = $_GET['acao'] ?? 'listar';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

function flash(string $msg, string $tipo = 'success'): void {
    $_SESSION['flash'] = ['msg' => $msg, 'tipo' => $tipo];
}

switch ($pagina) {
    case 'clientes':
        require_once __DIR__ . '/controllers/ClienteController.php';
        $ctrl = new ClienteController(obterConexao());
        break;
    case 'categorias':
        require_once __DIR__ . '/controllers/CategoriaController.php';
        $ctrl = new CategoriaController(obterConexao());
        break;
    case 'produtos':
        require_once __DIR__ . '/controllers/ProdutoController.php';
        $ctrl = new ProdutoController(obterConexao());
        break;
    case 'pedidos':
        require_once __DIR__ . '/controllers/PedidoController.php';
        $ctrl = new PedidoController(obterConexao());
        break;
    default:
        $pagina = 'home';
        break;
}

if ($pagina !== 'home') {
    switch ($acao) {
        case 'listar':   $ctrl->listar(); break;
        case 'criar':    $ctrl->criar(); break;
        case 'editar':   $ctrl->editar($id); break;
        case 'salvar':   $ctrl->salvar(); break;
        case 'excluir':  $ctrl->excluir($id); break;
        case 'visualizar': $ctrl->visualizar($id); break;
        default:         $ctrl->listar(); break;
    }
} else {
    try {
        $pdo = obterConexao();
        $totalClientes = (int) $pdo->query("SELECT COUNT(*) FROM clientes")->fetchColumn();
        $totalProdutos = (int) $pdo->query("SELECT COUNT(*) FROM produtos")->fetchColumn();
        $totalPedidos  = (int) $pdo->query("SELECT COUNT(*) FROM pedidos")->fetchColumn();
        $faturamento   = (float) $pdo->query("SELECT COALESCE(SUM(valor_total),0) FROM pedidos WHERE status != 'CANCELADO'")->fetchColumn();
    } catch (PDOException $e) {
        $totalClientes = $totalProdutos = $totalPedidos = 0;
        $faturamento = 0.0;
        flash('Erro ao carregar dashboard: ' . $e->getMessage(), 'danger');
    }

    $titulo = 'Dashboard';
    ob_start();
    include __DIR__ . '/views/home.php';
    $conteudo = ob_get_clean();
    include __DIR__ . '/layout.php';
}